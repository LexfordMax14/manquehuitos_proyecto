import express from "express";
import path from "node:path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { apiErrors } from "./utils/apiErrors";
import config from "./utils/config";
import logger from "./utils/logger";
// import middleware from "./utils/middleware";
import cerrosRouter from "./controllers/cerros";
import comentariosRouter from "./controllers/comentarios";
import usuariosRouter from "./controllers/usuarios";
import loginRouter from "./controllers/login";

const app = express();

mongoose.set("strictQuery", false);

if (config.MONGODB_URI) {
  mongoose
    .connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME })
    .then(() => logger.info("connected to MongoDB"))
    .catch((error) => {
      logger.error("error connecting to MongoDB:", error.message);
    });
}

app.use(express.static("dist"));
app.use(express.json());
app.use(cookieParser());
app.use((_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
// app.use(middleware.requestLogger);

app.use("/api/cerros", cerrosRouter);
app.use("/api/comentarios", comentariosRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/login", loginRouter);
app.use("/api/auth", loginRouter);

// React Router maneja las paginas al abrir o recargar una URL directamente.
app.use((req, res, next) => {
  if (req.method === "GET" && !/^\/api(?:\/|$)/.test(req.path) && req.accepts("html")) {
    res.sendFile(path.resolve("dist/index.html"), error => { if (error) next(error); });
    return;
  }
  next();
});

// app.use(middleware.unknownEndpoint);
app.use(apiErrors);

export default app;