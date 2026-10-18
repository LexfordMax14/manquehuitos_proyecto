import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "./config";

// El JWT nunca se lee desde localStorage: llega en la cookie httpOnly.
export const withUser: RequestHandler = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.cookies?.token || "", config.JWT_SECRET!);
    if (typeof decoded !== "object" || typeof decoded.id !== "string" ||
        typeof decoded.csrf !== "string") {
      res.status(401).json({ error: "SesiÃ³n invÃ¡lida" }); return;
    }
    if (decoded.csrf !== req.get("X-CSRF-Token")) {
      res.status(403).json({ error: "Token CSRF invÃ¡lido" }); return;
    }
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "SesiÃ³n ausente, invÃ¡lida o expirada" });
  }
};

// Patrón P5: invitado sin cookie; sesión presente siempre se verifica.
export const withOptionalUser: RequestHandler = (req, res, next) => {
  if (!req.cookies?.token) { next(); return; }
  withUser(req, res, next);
};
