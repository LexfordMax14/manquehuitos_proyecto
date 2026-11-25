import express, { type Request, type Response } from "express";
import ComentariosModel from "../models/comentarios";
import Usuario from "../models/usuarios";
import { withUser, withOptionalUser, withAdmin } from "../utils/auth";
import { recibirFotos, guardarFotos, borrarFotos } from "../utils/fotos";

const router = express.Router();

// GET
// devuelve todos los comentarios
router.get("/", async (request, response) => {
  const comentarios = await ComentariosModel.find({});
  response.json(comentarios);
});

// deberia devolver los comentarios con un cerro asociado
router.get("/:idcerro", async (request, response) => {
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
router.post("/", withOptionalUser, async (request, response) => {
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
  if (usuario) {
    usuario.comentarios.push(comentarioGuardado._id);
    await usuario.save();
  }
  response.status(201).json(comentarioGuardado);
});

// publicar comentarios en una página de un cerro
// Acepta JSON o multipart/form-data con hasta 4 fotos en el campo "fotos".
router.post("/:idcerro", withOptionalUser, recibirFotos, async (request, response) => {
  const { contenido, autor } = request.body ?? {};
  const archivos = (request.files as Express.Multer.File[] | undefined) ?? [];

  const usuario = request.userId
    ? await Usuario.findById(request.userId)
    : null;

  if (request.userId && !usuario) {
    response.status(401).json({ error: "Usuario de sesión inexistente" });
    return;
  }
  if (archivos.length > 0 && !usuario) {
    response.status(401).json({ error: "Inicia sesión para subir fotos" });
    return;
  }
  if (typeof contenido !== "string" || !contenido.trim()) {
    response.status(400).json({ error: "El comentario no puede estar vacío" });
    return;
  }

  const comentario = new ComentariosModel({
    contenido,
    autor: usuario ? usuario.username : autor || "Anónimo",
    usuario: usuario ? usuario._id : undefined,
    cerro: request.params.idcerro,
    fotos: await guardarFotos(archivos),
  });

  const comentarioGuardado = await comentario.save();
  if (usuario) {
    usuario.comentarios.push(comentarioGuardado._id);
    await usuario.save();
  }
  response.status(201).json(comentarioGuardado);
});

// PUT
// El autor puede editar su comentario solo durante los primeros 5 minutos.
// El administrador puede editar cualquier comentario, sin plazo.
export const PLAZO_EDICION_MS = 5 * 60 * 1000;

const editarComentario = async (request: Request, response: Response, cerro: string | null) => {
  const { contenido } = request.body;
  if (typeof contenido !== "string" || !contenido.trim()) {
    response.status(400).json({ error: "El comentario no puede estar vacío" });
    return;
  }

  const usuario = await Usuario.findById(request.userId);
  if (!usuario) {
    response.status(401).json({ error: "Usuario de sesión inexistente" });
    return;
  }
  const esAdmin = usuario.rol === "admin";

  const comentario = await ComentariosModel.findOne(
    esAdmin
      ? { _id: request.params.id, cerro }
      : { _id: request.params.id, usuario: usuario._id, cerro },
  );
  if (!comentario) {
    response.status(404).json({ error: "Comentario no encontrado" });
    return;
  }
  if (!esAdmin && Date.now() - comentario.createdAt.getTime() > PLAZO_EDICION_MS) {
    response.status(403).json({ error: "El plazo de 5 minutos para editar terminó" });
    return;
  }

  comentario.contenido = contenido;
  response.json(await comentario.save());
};

// editar comentario fuera de una pagina de cerro
router.put("/:id", withUser, (request, response) =>
  editarComentario(request, response, null));

// editar comentario en una pagina de cerro
router.put("/:idcerro/:id", withUser, (request, response) =>
  editarComentario(request, response, String(request.params.idcerro)));

// DELETE
// Solo el administrador puede eliminar comentarios.
const eliminarComentario = async (request: Request, response: Response, cerro: string | null) => {
  const comentario = await ComentariosModel.findOneAndDelete({ _id: request.params.id, cerro });
  if (!comentario) {
    response.status(404).json({ error: "Comentario no encontrado" });
    return;
  }
  await borrarFotos(comentario.fotos);
  if (comentario.usuario) {
    await Usuario.updateOne({ _id: comentario.usuario }, { $pull: { comentarios: comentario._id } });
  }
  response.status(204).end();
};

// eliminar comentario fuera de una pagina de un cerro
router.delete("/:id", withAdmin, (request, response) =>
  eliminarComentario(request, response, null));

// eliminar comentario en una pagina de cerro
router.delete("/:idcerro/:id", withAdmin, (request, response) =>
  eliminarComentario(request, response, String(request.params.idcerro)));

export default router;
