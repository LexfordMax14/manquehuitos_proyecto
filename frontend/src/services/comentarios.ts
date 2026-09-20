import axios from "axios";
import type { ComentarioType } from "../types/comentario";
const baseUrl = "http://localhost:5174/notes";

const getAll = () => {
  const request = axios.get(baseUrl);
  const nonExisting = {
    id: 10000,
    content: "This note is not saved to server",
    important: true,
  };

  return request.then((response) => response.data.concat(nonExisting));
};

const create = (newObject: Omit<ComentarioType, "id">) => {
  return axios.post(baseUrl, newObject).then((request) => request.data);
};

export default {
  getAll,
  create,
};
