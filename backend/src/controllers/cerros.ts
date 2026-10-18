import express from "express";
import CerrosModel from "../models/cerros"

const router = express.Router();

// GET
// devuelve todos los cerros
router.get("/", async (request, response) => {
  const cerros = await CerrosModel.find({});
  response.json(cerros);
});

// POST
// publicar un nuevo cerro
router.post("/", async (request, response) => {
  const { nombre, 
    altura, 
    dificultad, 
    ubicacion, 
    imagenes } = request.body;

  const cerro = new CerrosModel({
    nombre, altura, dificultad, ubicacion, imagenes
  });

  const cerroGuardado = await cerro.save();
  response.status(201).json(cerroGuardado);
});

// PUT
// editar cerro
router.put("/:idcerro", async (request, response) => {
  const cerro_id = request.params.idcerro
  const { altura, 
    dificultad, 
    ubicacion, 
    imagenes } = request.body;

  const cerroActualizado = await CerrosModel.findOneAndUpdate(
    { _id: cerro_id},
    { altura, dificultad, ubicacion, imagenes},
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
router.delete("/:idcerro", async (request, response) => {
  const cerro_id = request.params.idcerro

  const cerro = await CerrosModel.findOneAndDelete({
    _id: cerro_id,
  })

  if (!cerro) {
    response.status(404).json({
      error: "Cerro no encontrado",
    })
  }

  response.status(204).end();
});

export default router;