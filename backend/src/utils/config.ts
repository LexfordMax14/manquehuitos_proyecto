import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

export default { PORT, HOST, MONGODB_URI, MONGODB_DBNAME};
