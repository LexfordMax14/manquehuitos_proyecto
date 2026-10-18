import express from "express";
import ComentariosModel from "../models/comentarios";
import Usuario from "../models/usuarios";
// import { withUsuarioOpcional } from "../utils/middleware";

const router = express.Router();

// GET
// devuelve todos los comentarios
router.get("/comentarios", async (request, response) => {
  const comentarios = await ComentariosModel.find({});
  response.json(comentarios);
});

// deberia devolver los comentarios con un cerro asociado
router.get("/comentarios/:idcerro", async (request, response) => {
  const id = request.params.idcerro;

  const comentarios_del_cerro = await ComentariosModel.find({
    cerro: id
  })

  if (!comentarios_del_cerro) {
    response.status(404).end();
    return;
  }
  response.json(comentarios_del_cerro);
});

// POST
// publicar un comentario fuera de una pagina de un cerro
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
  });

  const comentarioGuardado = await comentario.save();
  response.status(201).json(comentarioGuardado);
});

// publicar comentarios en una página de un cerro
router.post("/comentarios/:idcerro"/*, withOptionalUser */, async (request, response) => {
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
    cerro: request.params.idcerro
  });

  const comentarioGuardado = await comentario.save();
  response.status(201).json(comentarioGuardado);
});

// PUT
// editar comentario fuera de una pagina de cerro
router.put("/comentarios/:id", async (request, response) => {
  const comentario_id = request.params.id
  const { contenido } = request.body

  const comentarioActualizado = await ComentariosModel.findOneAndUpdate(
    { _id: comentario_id, cerro: null },
    { contenido },
    { new: true, runValidators: true }
  );

  if (!comentarioActualizado) {
    response.status(404).end();
    return;
  }
  response.json(comentarioActualizado);
});

// editar comentario en una pagina de cerro
router.put("/comentarios/:idcerro/:id", async (request, response) => {
  const comentario_id = request.params.id
  const cerro_id = request.params.idcerro
  const { contenido } = request.body

  const comentarioActualizado = await ComentariosModel.findOneAndUpdate(
    { _id: comentario_id, cerro: cerro_id },
    { contenido },
    { new: true, runValidators: true }
  );

  if (!comentarioActualizado) {
    response.status(404).end();
    return;
  }
  response.json(comentarioActualizado);
});

// eliminar comentario fuera de una pagina de un cerro
router.delete("/comentarios/:id", async (request, response) => {
  const comentario_id = request.params.id

  const comentario = await ComentariosModel.findOneAndDelete({
    _id: comentario_id,
    cerro:null,
  })

  if (!comentario) {
    response.status(404).json({
      error: "Comentario no encontrado fuera de un cerro",
    })
  }

  response.status(204).end();
});

// eliminar comentario en una pagina de cerro
router.delete("/comentarios/:idcerro/:id", async (request, response) => {
    const { idcerro, id } = request.params;

    const comentario = await ComentariosModel.findOneAndDelete({
      _id: id,
      cerro: idcerro,
    });

    if (!comentario) {
      response.status(404).json({
        error: "Comentario no encontrado en este cerro",
      });
      return;
    }

    response.status(204).end();
});

export default router;
