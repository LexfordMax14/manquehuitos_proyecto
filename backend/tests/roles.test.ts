import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("rol admin, plazo de edición de comentarios y eliminación", async () => {
  process.env.JWT_SECRET = "test-only-random-secret-never-use-in-production";
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DBNAME = "roles_test";
  const { default: app } = await import("../src/app");
  const { default: Usuario } = await import("../src/models/usuarios");
  const { default: Comentarios } = await import("../src/models/comentarios");
  await mongoose.connection.asPromise();

  const sesion = async (username: string) => {
    const agent = request.agent(app);
    await agent.post("/api/usuarios").send({ username, email: `${username}@example.test`, password: "secreto123" }).expect(201);
    const login = await agent.post("/api/login").send({ username, password: "secreto123" }).expect(200);
    return { agent, csrf: login.headers["x-csrf-token"] as string, body: login.body };
  };

  try {
    const autor = await sesion("autor");
    const otro = await sesion("otro");
    assert.equal(autor.body.rol, "usuario");

    // El rol no se puede elegir al registrarse.
    const colado = await request(app).post("/api/usuarios").send({ username: "colado", email: "colado@example.test", password: "secreto123", rol: "admin" }).expect(201);
    assert.equal((await Usuario.findById(colado.body.id))?.rol, "usuario");

    const admin = await sesion("admin");
    await Usuario.updateOne({ username: "admin" }, { $set: { rol: "admin" } });
    const me = await admin.agent.get("/api/login/me").set("X-CSRF-Token", admin.csrf).expect(200);
    assert.equal(me.body.rol, "admin");

    // Solo el admin crea, edita y elimina cerros.
    const datosCerro = { nombre: "Manquehue", altura: 1638, dificultad: "Media", imagenes: ["m.jpg"], ubicacion: "Vitacura" };
    await autor.agent.post("/api/cerros").set("X-CSRF-Token", autor.csrf).send(datosCerro).expect(403);
    const cerro = await admin.agent.post("/api/cerros").set("X-CSRF-Token", admin.csrf).send(datosCerro).expect(201);
    const idCerro = cerro.body.id;
    await autor.agent.put(`/api/cerros/${idCerro}`).set("X-CSRF-Token", autor.csrf).send(datosCerro).expect(403);
    await admin.agent.put(`/api/cerros/${idCerro}`).set("X-CSRF-Token", admin.csrf).send({ ...datosCerro, altura: 1640 }).expect(200);

    // El autor edita su comentario dentro de los 5 minutos; otro usuario no puede.
    const comentario = await autor.agent.post(`/api/comentarios/${idCerro}`).set("X-CSRF-Token", autor.csrf).send({ contenido: "original" }).expect(201);
    const url = `/api/comentarios/${idCerro}/${comentario.body.id}`;
    const editado = await autor.agent.put(url).set("X-CSRF-Token", autor.csrf).send({ contenido: "editado" }).expect(200);
    assert.equal(editado.body.contenido, "editado");
    await autor.agent.put(url).set("X-CSRF-Token", autor.csrf).send({ contenido: "  " }).expect(400);
    await otro.agent.put(url).set("X-CSRF-Token", otro.csrf).send({ contenido: "ajeno" }).expect(404);

    // Pasados los 5 minutos ya no se puede editar.
    await Comentarios.collection.updateOne({ _id: new mongoose.Types.ObjectId(comentario.body.id) }, { $set: { createdAt: new Date(Date.now() - 6 * 60 * 1000) } });
    await autor.agent.put(url).set("X-CSRF-Token", autor.csrf).send({ contenido: "tarde" }).expect(403);

    // El admin edita cualquier comentario aunque haya vencido el plazo.
    const moderado = await admin.agent.put(url).set("X-CSRF-Token", admin.csrf).send({ contenido: "moderado" }).expect(200);
    assert.equal(moderado.body.contenido, "moderado");

    // Solo el admin elimina comentarios, y se quita de la lista del usuario.
    await autor.agent.delete(url).set("X-CSRF-Token", autor.csrf).expect(403);
    await admin.agent.delete(url).set("X-CSRF-Token", admin.csrf).expect(204);
    await admin.agent.delete(url).set("X-CSRF-Token", admin.csrf).expect(404);
    assert.equal((await Usuario.findOne({ username: "autor" }))?.comentarios.length, 0);

    await admin.agent.delete(`/api/cerros/${idCerro}`).set("X-CSRF-Token", admin.csrf).expect(204);
  } finally { await mongoose.disconnect(); await mongo.stop(); }
});
