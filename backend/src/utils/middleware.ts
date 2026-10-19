import { NextFunction, Request, Response } from "express";
import logger from "./logger";
import jwt from "jsonwebtoken";
import config from "./config";

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: {
    name: string;
    message: string;
    code?: number;
    keyPattern?: {
      username?: number;
      email?: number;
    };
  },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  }
  // TODO (P2): username o email repetido (E11000)
  else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    const field = error.keyPattern?.username ? "usuario" : "email";

    response.status(400).json({
      error: `El ${field} ya existe`,
    });
  }
  // TODO (P4): token expirado (TokenExpiredError)
  else if (error.name === "TokenExpiredError") {
    response.status(401).json({ error: "Token expirado" });
  } else if (
    error.name === "JsonWebTokenError" ||
    error.name === "NotBeforeError"
  ) {
    response.status(401).json({ error: "Token inválido" });
  }

  next(error);
};

// TODO (P4): verificar el JWT de la cookie `token` y el header `X-CSRF-Token`,
// y guardar el id del usuario en `req.userId`.
export const withUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token;

  if (typeof token !== "string" || !token) {
    res.status(401).json({ error: "Falta el token" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    const csrfToken = req.headers["x-csrf-token"];

    if (
      typeof decodedToken !== "object" ||
      typeof decodedToken.id !== "string" ||
      !decodedToken.id ||
      typeof decodedToken.csrf !== "string" ||
      !decodedToken.csrf ||
      typeof csrfToken !== "string" ||
      decodedToken.csrf !== csrfToken
    ) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    req.userId = decodedToken.id;
  } catch (error) {
    next(error);
    return;
  }

  next();
};

// TODO (P5): withOptionalUser
export const withOptionalUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.cookies?.token === undefined) {
    next();
    return;
  }

  await withUser(req, res, next);
};

export default { requestLogger, unknownEndpoint, errorHandler };
