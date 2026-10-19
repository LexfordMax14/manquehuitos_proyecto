import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

test("sesión, cookie, CSRF y permisos con MongoDB temporal", async () => {
  process.env.JWT_SECRET = "test-only-random-secret-never-use-in-production";
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DBNAME = "auth_test";
  const { default: app } = await import("../src/app");
  await mongoose.connection.asPromise();
  try {
    const agent = request.agent(app);
    const registration = await agent.post("/api/usuarios").send({ username: "lazaro", email: "lazaro@example.test", password: "secreto123" }).expect(201);
    assert.equal(registration.body.passwordHash, undefined);
    await agent.post("/api/usuarios").send({ username: "lazaro", email: "otro@example.test", password: "secreto123" }).expect(409);
    await agent.post("/api/login").send({ username: "lazaro", password: "incorrecta" }).expect(401);
    await agent.get("/api/login/me").expect(401);
    await agent.post("/api/cerros").send({}).expect(401);
    const guest = await agent.post("/api/comentarios").send({ contenido: "hola" }).expect(201);
    assert.equal(guest.body.autor, "Anónimo");
    const login = await agent.post("/api/login").send({ username: "lazaro", password: "secreto123" }).expect(200);
    const csrf = login.headers["x-csrf-token"];
    assert.ok(csrf);
    assert.match(login.headers["set-cookie"][0], /HttpOnly/);
    assert.match(login.headers["set-cookie"][0], /SameSite=Strict/);
    assert.equal(login.body.token, undefined);
    await agent.get("/api/login/me").expect(403);
    await agent.get("/api/auth/me").set("X-CSRF-Token", csrf).expect(200);
    await agent.post("/api/comentarios").set("X-CSRF-Token", "incorrecto").send({ contenido: "hola" }).expect(403);
    const comment = await agent.post("/api/comentarios").set("X-CSRF-Token", csrf).send({ contenido: "hola", autor: "otro" }).expect(201);
    assert.equal(comment.body.autor, "lazaro");
    const other = request.agent(app);
    await other.post("/api/usuarios").send({ username: "otro", email: "otro@example.test", password: "secreto123" }).expect(201);
    const otherLogin = await other.post("/api/login").send({ username: "otro", password: "secreto123" }).expect(200);
    await other.delete(`/api/comentarios/${comment.body.id}`).set("X-CSRF-Token", otherLogin.headers["x-csrf-token"]).expect(404);
    await agent.delete(`/api/comentarios/${comment.body.id}`).set("X-CSRF-Token", csrf).expect(204);
    const cerro = await agent.post("/api/cerros").set("X-CSRF-Token", csrf).send({ nombre: "Cerro", altura: 100, dificultad: "Baja", imagenes: ["foto.jpg"], ubicacion: "Santiago" }).expect(201);
    await request(app).get(`/api/cerros/${cerro.body.id}`).expect(200);
    for (const token of ["falso", jwt.sign({ id: login.body.id, csrf }, process.env.JWT_SECRET!, { expiresIn: -1 })]) {
      await request(app).get("/api/login/me").set("Cookie", `token=${token}`).set("X-CSRF-Token", csrf).expect(401);
    }
    await agent.post("/api/login/logout").set("X-CSRF-Token", csrf).expect(204);
    await agent.get("/api/login/me").set("X-CSRF-Token", csrf).expect(401);
  } finally { await mongoose.disconnect(); await mongo.stop(); }
});
