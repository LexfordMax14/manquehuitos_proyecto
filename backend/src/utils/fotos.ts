import type { RequestHandler } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import config from "./config";

export const MAX_FOTOS = 4;
export const MAX_BYTES_FOTO = 5 * 1024 * 1024; // 5 MB

// URL pública bajo la que se sirven las fotos subidas.
export const URL_FOTOS = "/uploads/comentarios";
const carpetaFotos = () => path.resolve(config.UPLOADS_DIR, "comentarios");

// Formatos aceptados. No confiamos en la extensión ni en el tipo que declara
// el navegador: se revisan los primeros bytes reales del archivo.
const FORMATOS = [
  { ext: "png", esFormato: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "jpg", esFormato: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "webp", esFormato: (b: Buffer) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
];

export class FotoInvalidaError extends Error {
  name = "FotoInvalidaError";
}

// Lee hasta MAX_FOTOS archivos del campo "fotos" en memoria (multipart/form-data).
// Los campos de texto del formulario quedan en request.body.
const recibir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES_FOTO, files: MAX_FOTOS },
}).array("fotos", MAX_FOTOS);

export const recibirFotos: RequestHandler = (req, res, next) => {
  if (!req.is("multipart/form-data")) { next(); return; }
  recibir(req, res, next);
};

// Valida todas las fotos y recién entonces las guarda; devuelve sus URLs públicas.
export const guardarFotos = async (archivos: Express.Multer.File[]) => {
  const extensiones = archivos.map(archivo => {
    const formato = FORMATOS.find(f => f.esFormato(archivo.buffer));
    if (!formato) {
      throw new FotoInvalidaError(`"${archivo.originalname}" no es una imagen PNG, JPG o WEBP`);
    }
    return formato.ext;
  });

  await mkdir(carpetaFotos(), { recursive: true });
  return Promise.all(archivos.map(async (archivo, i) => {
    const nombre = `${randomUUID()}.${extensiones[i]}`;
    await writeFile(path.join(carpetaFotos(), nombre), archivo.buffer);
    return `${URL_FOTOS}/${nombre}`;
  }));
};

// Borra del disco las fotos de un comentario eliminado (ignora las que ya no existan).
export const borrarFotos = async (urls: string[]) => {
  await Promise.all(urls.map(url =>
    unlink(path.join(carpetaFotos(), path.basename(url))).catch(() => undefined)));
};
