import express from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/usuarios";

const router = express.Router();

router.post("/", async (request, response) => {
  const { username, email, password } = request.body;

  if (typeof password !== "string" || password.length < 5) {
    response.status(400).json({
      error: "La contraseña debe tener al menos 5 caracteres",
    });
    return;
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    response.status(400).json({
      error: "Correo inválido",
    });
    return;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const usuario = new Usuario({
    username,
    email,
    passwordHash,
  });

  const savedUser = await usuario.save();

  response.status(201).json(savedUser);
});


router.get("/", async (_request, response) => {
  const usuarios = await Usuario.find({});
  response.json(usuarios);
});

export default router;
