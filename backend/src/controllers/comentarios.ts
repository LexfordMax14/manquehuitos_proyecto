import express from "express";
import ComentariosModel from "../models/comentarios";
import Usuario from "../models/usuarios";
// import { withUsuarioOpcional } from "../utils/middleware";

const router = express.Router();

// devuelve todos los comentarios
router.get("/comentarios", async (request, response) => {
  const comentarios = await ComentariosModel.find({});
  response.json(comentarios);
});

// deberia contener los comentarios con un cerro asociado
router.get("/comentarios/:id", async (request, response) => {
  const id = request.params.id;
  const comentarios_del_cerro = await Promise.all([
    ComentariosModel.find({ cerro: id })
  ]);

  if (!comentarios_del_cerro) {
    response.status(404).end();
    return;
  }
  response.json(comentarios_del_cerro);
});

// publicar un comentario en una página que no sea un cerro
router.post("/comentarios" /*, withOptionalUser */, async (request, response) => {
  const { contenido, autor } = request.body;

  const usuario = request.userId
    ? await Usuario.findById(request.userId)
    : null;

  if (request.userId && !usuario) {
    response.status(401).json({ error: "Usuario de sesión inexistente" });
    return;
  }

  const comentario = new ComentariosModel({
    contenido,
    autor: usuario ? usuario.username : autor || "Anónimo",
    usuario: usuario ? usuario._id : undefined,
    cerro: null,
  });

  const comentarioGuardado = await comentario.save();
  response.status(201).json(comentarioGuardado);
});

// publicar comentarios en una página de un cerro
router.post("/comentarios/:id"/*, withOptionalUser */, async (request, response) => {
  const { contenido, autor } = request.body;

  const usuario = request.userId
    ? await Usuario.findById(request.userId)
    : null;

  if (request.userId && !usuario) {
    response.status(401).json({ error: "Usuario de sesión inexistente" });
    return;
  }

  const comentario = new ComentariosModel({
    contenido,
    autor: usuario ? usuario.username : autor || "Anónimo",
    usuario: usuario ? usuario._id : undefined,
    cerro: request.params.id
  });

  const comentarioGuardado = await comentario.save();
  response.status(201).json(comentarioGuardado);
});

// editar comentario
router.put("/comentarios/:id", async (request, response) => {
  const comentarioActualizado = await ComentariosModel.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true }
  );

  if (!comentarioActualizado) {
    response.status(404).end();
    return;
  }
  response.json(comentarioActualizado);
});

export default router;
