import type { ErrorRequestHandler } from "express";
import { MAX_FOTOS } from "./fotos";

const MENSAJES_MULTER: Record<string, string> = {
  LIMIT_FILE_SIZE: "Cada foto puede pesar como máximo 5 MB",
  LIMIT_FILE_COUNT: `Se pueden subir como máximo ${MAX_FOTOS} fotos`,
  LIMIT_UNEXPECTED_FILE: `Se pueden subir como máximo ${MAX_FOTOS} fotos`,
};

export const apiErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error.name === "MulterError") {
    res.status(400).json({ error: MENSAJES_MULTER[error.code] ?? "No se pudieron recibir las fotos" }); return;
  }
  if (error.name === "FotoInvalidaError") { res.status(400).json({ error: error.message }); return; }
  if (error.code === 11000) { res.status(409).json({ error: "Usuario o correo ya registrado" }); return; }
  if (["ValidationError", "CastError", "SyntaxError"].includes(error.name)) {
    res.status(400).json({ error: "Datos inválidos" }); return;
  }
  console.error(error.name);
  res.status(500).json({ error: "Error interno del servidor" });
};
