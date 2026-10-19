import express from "express";
import CerrosModel from "../models/cerros.ts"

import { withUser } from "../utils/auth";

const router = express.Router();

// GET
// devuelve todos los cerros
router.get("/", async (request, response) => {
  const cerros = await CerrosModel.find({});
  response.json(cerros);
});

// GET por id
router.get("/:idcerro", async (request, response) => {
  const cerro = await CerrosModel.findById(request.params.idcerro);

  if (!cerro) {
    response.status(404).json({
      error: "Cerro no encontrado",
    });
    return;
  }

  response.json(cerro);
});

// POST
// publicar un nuevo cerro
router.post("/", withUser, async (request, response) => {
  const { nombre, 
    descripcion,
    altura, 
    dificultad, 
    descansos,
    banos,
    ubicacion, 
    imagenes } = request.body;

  const cerro = new CerrosModel({
    nombre, descripcion, altura, dificultad, descansos, banos, ubicacion, imagenes
  });

  const cerroGuardado = await cerro.save();
  response.status(201).json(cerroGuardado);
});

// PUT
// editar cerro
router.put("/:idcerro", withUser, async (request, response) => {
  const cerro_id = request.params.idcerro
  const { nombre,
    descripcion,
    altura, 
    dificultad, 
    descansos,
    banos,
    ubicacion, 
    imagenes } = request.body;

  const cerroActualizado = await CerrosModel.findOneAndUpdate(
    { _id: cerro_id},
    { nombre, descripcion, altura, dificultad, descansos, banos, ubicacion, imagenes},
    { new: true, runValidators: true }
  );

  if (!cerroActualizado) {
    response.status(404).end();
    return;
  }
  response.json(cerroActualizado);
});

// DELETE
// eliminar cerro
router.delete("/:idcerro", withUser, async (request, response) => {
  const cerro_id = request.params.idcerro

  const cerro = await CerrosModel.findOneAndDelete({
    _id: cerro_id,
  })

  if (!cerro) {
    response.status(404).json({
      error: "Cerro no encontrado",
    });
    return;
  }

  response.status(204).end();
});

export default router;