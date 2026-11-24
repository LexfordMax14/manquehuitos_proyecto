import express from "express";
import CerrosModel from "../models/cerros";
import ComentariosModel from "../models/comentarios";
import Usuario from "../models/usuarios";

// Solo se registra con NODE_ENV=test (ver app.ts). Deja la base de test vacía
// para que cada prueba E2E parta del mismo estado.
const router = express.Router();

router.post("/reset", async (_request, response) => {
  await ComentariosModel.deleteMany({});
  await Usuario.deleteMany({});
  await CerrosModel.deleteMany({});
  response.status(204).end();
});

export default router;
