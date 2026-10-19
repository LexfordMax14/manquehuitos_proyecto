// Servidor aislado para las pruebas de navegador; nunca conecta la base del proyecto.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
async function main() {
  const mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DBNAME = "browser_test";
  const { default: app } = await import("../src/app");
  await mongoose.connection.asPromise();
  const server = app.listen(4318, "127.0.0.1");
  const stop = async () => { server.close(); await mongoose.disconnect(); await mongo.stop(); process.exit(); };
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
}
main().catch(error => { console.error(error); process.exit(1); });
