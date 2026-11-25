import express from "express";
import { rm } from "node:fs/promises";
import path from "node:path";
import CerrosModel from "../models/cerros";
import ComentariosModel from "../models/comentarios";
import Usuario from "../models/usuarios";
import config from "../utils/config";

// Solo se registra con NODE_ENV=test (ver app.ts). Deja la base de test vacía
// para que cada prueba E2E parta del mismo estado.
const router = express.Router();

router.post("/reset", async (_request, response) => {
  await ComentariosModel.deleteMany({});
  await Usuario.deleteMany({});
  await CerrosModel.deleteMany({});
  await rm(path.resolve(config.UPLOADS_DIR, "comentarios"), { recursive: true, force: true });
  response.status(204).end();
});

// El rol de admin no se puede pedir al registrarse: los tests lo asignan aquí.
router.post("/admin", async (request, response) => {
  const usuario = await Usuario.findOneAndUpdate(
    { username: request.body.username },
    { rol: "admin" },
    { returnDocument: "after" },
  );
  if (!usuario) {
    response.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  response.status(204).end();
});

// Crea un cerro directamente, sin pasar por la sesión de un admin.
router.post("/cerros", async (request, response) => {
  const cerro = await CerrosModel.create(request.body);
  response.status(201).json(cerro);
});

export default router;
