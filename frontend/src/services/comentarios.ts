import axios from 'axios'
import type { ComentarioType } from '../types/comentario'

const comentariosUrl = '/api/comentarios'

const getByCerro = (cerroId: string) => {
  return axios
    .get<ComentarioType[]>(`${comentariosUrl}/${cerroId}`)
    .then(response => response.data)
}

const create = (data: Pick<ComentarioType, 'contenido' | 'autor'>, cerroId: string) => {
  return axios
    .post<ComentarioType>(`${comentariosUrl}/${cerroId}`, data)
    .then(response => response.data)
}

const update = (cerroId: string, id: string, contenido: string) => {
  return axios
    .put<ComentarioType>(`${comentariosUrl}/${cerroId}/${id}`, { contenido })
    .then(response => response.data)
}

const remove = (cerroId: string, id: string) => {
  return axios.delete(`${comentariosUrl}/${cerroId}/${id}`)
}

export default {
  getByCerro,
  create,
  update,
  remove,
}
