import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 ")]);

test("subida de fotos en comentarios con validación de formato", async () => {
  process.env.JWT_SECRET = "test-only-random-secret-never-use-in-production";
  const uploads = mkdtempSync(path.join(tmpdir(), "fotos-test-"));
  process.env.UPLOADS_DIR = uploads;
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DBNAME = "fotos_test";
  const { default: app } = await import("../src/app");
  const { default: Usuario } = await import("../src/models/usuarios");
  await mongoose.connection.asPromise();

  const sesion = async (username: string) => {
    const agent = request.agent(app);
    await agent.post("/api/usuarios").send({ username, email: `${username}@example.test`, password: "secreto123" }).expect(201);
    const login = await agent.post("/api/login").send({ username, password: "secreto123" }).expect(200);
    return { agent, csrf: login.headers["x-csrf-token"] as string };
  };

  try {
    const usuario = await sesion("usuario");
    const admin = await sesion("admin");
    await Usuario.updateOne({ username: "admin" }, { $set: { rol: "admin" } });
    const cerro = await admin.agent.post("/api/cerros").set("X-CSRF-Token", admin.csrf)
      .send({ nombre: "Cerro", altura: 100, dificultad: "Baja", imagenes: ["c.jpg"], ubicacion: "Santiago" }).expect(201);
    const url = `/api/comentarios/${cerro.body.id}`;
    const publicar = () => usuario.agent.post(url).set("X-CSRF-Token", usuario.csrf).field("contenido", "con fotos");

    // PNG, JPG y WEBP válidos: se guardan y se pueden descargar.
    const ok = await publicar()
      .attach("fotos", PNG, "a.png").attach("fotos", JPG, "b.jpeg").attach("fotos", WEBP, "c.webp").expect(201);
    assert.equal(ok.body.fotos.length, 3);
    assert.match(ok.body.fotos[0], /^\/uploads\/comentarios\/[\w-]+\.png$/);
    assert.match(ok.body.fotos[1], /\.jpg$/);
    assert.match(ok.body.fotos[2], /\.webp$/);
    await request(app).get(ok.body.fotos[0]).expect(200).expect("Content-Type", /image\/png/);
    await request(app).get("/uploads/comentarios/no-existe.png").expect(404);

    // Se valida el contenido real, no la extensión ni el tipo declarado.
    const falso = await publicar().attach("fotos", Buffer.from("<script>alert(1)</script>"), { filename: "x.png", contentType: "image/png" }).expect(400);
    assert.match(falso.body.error, /PNG, JPG o WEBP/);
    await publicar().attach("fotos", Buffer.from("GIF89a......"), "x.gif").expect(400);

    // Límites de cantidad y peso.
    const cinco = publicar();
    for (let i = 0; i < 5; i++) cinco.attach("fotos", PNG, `${i}.png`);
    await cinco.expect(400);
    const pesada = await publicar().attach("fotos", Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]), "grande.png").expect(400);
    assert.match(pesada.body.error, /5 MB/);

    // Sin sesión se puede comentar texto, pero no subir fotos.
    await request(app).post(url).send({ contenido: "solo texto" }).expect(201);
    await request(app).post(url).field("contenido", "anon").attach("fotos", PNG, "a.png").expect(401);
    await usuario.agent.post(url).set("X-CSRF-Token", usuario.csrf).field("contenido", " ").attach("fotos", PNG, "a.png").expect(400);

    // Al eliminar el comentario se borran sus fotos del disco.
    const archivo = path.join(uploads, "comentarios", path.basename(ok.body.fotos[0]));
    assert.ok(existsSync(archivo));
    await admin.agent.delete(`${url}/${ok.body.id}`).set("X-CSRF-Token", admin.csrf).expect(204);
    assert.equal(existsSync(archivo), false);
  } finally {
    await mongoose.disconnect(); await mongo.stop();
    rmSync(uploads, { recursive: true, force: true });
  }
});
