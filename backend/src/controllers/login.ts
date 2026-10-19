import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import Usuario from "../models/usuarios";
import config from "../utils/config";
import { withUser } from "../utils/auth";

const router = express.Router();
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const, path: "/" };
const publicUser = (user: { _id: unknown; username: string; email: string }) =>
  ({ id: String(user._id), username: user.username, email: user.email });

router.post("/", async (req, res) => {
  // La cookie es sameSite y sólo aceptamos JSON, como lo envía Axios.
  if (!req.is("application/json")) { res.sendStatus(415); return; }
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Usuario y contraseña requeridos" }); return;
  }
  const user = await Usuario.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" }); return;
  }
  const csrf = randomUUID();
  const token = jwt.sign({ id: String(user._id), username: user.username, csrf },
    config.JWT_SECRET!, { expiresIn: "1h" });
  res.setHeader("X-CSRF-Token", csrf);
  res.cookie("token", token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
  res.json(publicUser(user));
});
router.get("/me", withUser, async (req, res) => {
  const user = await Usuario.findById(req.userId);
  if (!user) { res.status(401).json({ error: "Usuario de sesión inexistente" }); return; }
  res.json(publicUser(user));
});
router.post("/logout", withUser, (_req, res) => {
  res.clearCookie("token", cookieOptions);
  res.sendStatus(204);
});
export default router;
