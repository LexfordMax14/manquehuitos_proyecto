import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "./config";
import Usuario from "../models/usuarios";

// El JWT nunca se lee desde localStorage: llega en la cookie httpOnly.
export const withUser: RequestHandler = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.cookies?.token || "", config.JWT_SECRET!);
    if (typeof decoded !== "object" || typeof decoded.id !== "string" ||
        typeof decoded.csrf !== "string") {
      res.status(401).json({ error: "Sesión inválida" }); return;
    }
    if (decoded.csrf !== req.get("X-CSRF-Token")) {
      res.status(403).json({ error: "Token CSRF inválido" }); return;
    }
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Sesión ausente, inválida o expirada" });
  }
};

// Patrón P5: invitado sin cookie; sesión presente siempre se verifica.
export const withOptionalUser: RequestHandler = (req, res, next) => {
  if (!req.cookies?.token) { next(); return; }
  withUser(req, res, next);
};

// El rol se consulta en la base en cada petición (no se confía en el token),
// así un cambio de rol aplica sin volver a iniciar sesión.
export const withAdmin: RequestHandler = (req, res, next) => {
  withUser(req, res, () => {
    Usuario.findById(req.userId).then(usuario => {
      if (!usuario) { res.status(401).json({ error: "Usuario de sesión inexistente" }); return; }
      if (usuario.rol !== "admin") {
        res.status(403).json({ error: "Requiere rol de administrador" }); return;
      }
      next();
    }).catch(next);
  });
};
