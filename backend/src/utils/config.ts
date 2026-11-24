import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const MONGODB_URI = process.env.MONGODB_URI;
// En modo test (pruebas E2E) se usa otra base, porque /api/testing/reset la vacía.
const MONGODB_DBNAME = process.env.NODE_ENV === "test"
  ? process.env.MONGODB_DBNAME_TEST
  : process.env.MONGODB_DBNAME;
if (process.env.NODE_ENV === "test" &&
    (!MONGODB_DBNAME || MONGODB_DBNAME === process.env.MONGODB_DBNAME)) {
  throw new Error("MONGODB_DBNAME_TEST debe estar definida y ser distinta de MONGODB_DBNAME");
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en el entorno");

export default { PORT, HOST, MONGODB_URI, MONGODB_DBNAME, JWT_SECRET};
