// Backend de demostración para probar en local sin tocar ninguna base real.
// Levanta MongoDB en memoria con cerros de ejemplo y dos cuentas de prueba.
// Todo se borra al detenerlo (Ctrl+C).
//
// Uso (desde backend/):  npm run demo
// Luego, en otra terminal: cd frontend && npm run dev
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Cuentas de prueba (solo existen en esta base temporal).
const CUENTAS = [
  { username: "admin", password: "admin123", rol: "admin" },
  { username: "usuario", password: "usuario123", rol: "usuario" },
];

// Datos de ejemplo aproximados, solo para probar la interfaz.
const CERROS = [
  { nombre: "Cerro Manquehue", altura: 1638, dificultad: "Media", ubicacion: "Vitacura, Santiago", descansos: 3, banos: false,
    descripcion: "Cerro emblemático de Santiago con vista a toda la ciudad.",
    imagenes: ["/images/manquehue.jpg", "/images/manquehue_1.jpg", "/images/manquehue_2.jpg"],
    rutas: [{ id: 1, nombre: "Sendero principal", distanciaKm: 5.2, duracion: "3 h", dificultad: "Media",
      coordenadas: [[-33.3606, -70.5765], [-33.3560, -70.5775], [-33.3520, -70.5790], [-33.3488, -70.5800]] }] },
  { nombre: "Cerro Manquehuito", altura: 1185, dificultad: "Baja", ubicacion: "Vitacura, Santiago", descansos: 2, banos: false,
    descripcion: "Subida corta, ideal para empezar.",
    imagenes: ["/images/manquehuito_1.webp", "/images/manquehuito_2.jpg", "/images/manquehuito_3.jpg"], rutas: [] },
  { nombre: "Cerro San Cristóbal", altura: 880, dificultad: "Baja", ubicacion: "Providencia, Santiago", descansos: 4, banos: true,
    descripcion: "Parque urbano con senderos, funicular y teleférico.",
    imagenes: ["/images/san_cristobal_1.jpg", "/images/san_cristobal_2.jpg"], rutas: [] },
  { nombre: "Cerro La Campana", altura: 1880, dificultad: "Alta", ubicacion: "Olmué, Valparaíso", descansos: 2, banos: true,
    descripcion: "Ascenso exigente dentro del Parque Nacional La Campana.",
    imagenes: ["/images/la_campana_1.jpg", "/images/la_campana_2.jpg"], rutas: [] },
  { nombre: "Cerro Provincia", altura: 2750, dificultad: "Experto", ubicacion: "Lo Barnechea, Santiago", descansos: 1, banos: false,
    descripcion: "Ruta larga de alta montaña frente a Santiago.",
    imagenes: ["/images/provincia_1.jpg"], rutas: [] },
];

async function main() {
  const mongo = await MongoMemoryServer.create();
  const uploads = mkdtempSync(path.join(tmpdir(), "manquehuapp-demo-"));
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DBNAME = "demo";
  process.env.UPLOADS_DIR = uploads;
  const port = Number(process.env.PORT || 3001);

  const { default: app } = await import("../src/app");
  const { default: Usuario } = await import("../src/models/usuarios");
  const { default: Cerro } = await import("../src/models/cerros");
  await mongoose.connection.asPromise();

  for (const { username, password, rol } of CUENTAS) {
    const passwordHash = await bcrypt.hash(password, 10);
    await Usuario.create({ username, email: `${username}@example.test`, passwordHash, rol });
  }
  await Cerro.insertMany(CERROS);

  const server = app.listen(port, "127.0.0.1", () => {
    console.log(`\nBackend demo en http://127.0.0.1:${port}`);
    console.log("Cuentas: admin / admin123 (admin)  ·  usuario / usuario123 (usuario)\n");
  });
  const stop = async () => {
    server.close();
    await mongoose.disconnect();
    await mongo.stop();
    rmSync(uploads, { recursive: true, force: true });
    process.exit();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
main().catch(error => { console.error(error); process.exit(1); });
