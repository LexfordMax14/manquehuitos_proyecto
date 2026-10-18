import type { ErrorRequestHandler } from "express";
export const apiErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error.code === 11000) { res.status(409).json({ error: "Usuario o correo ya registrado" }); return; }
  if (["ValidationError", "CastError", "SyntaxError"].includes(error.name)) {
    res.status(400).json({ error: "Datos inválidos" }); return;
  }
  console.error(error.name);
  res.status(500).json({ error: "Error interno del servidor" });
};
