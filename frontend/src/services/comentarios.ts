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

export default {
  getByCerro,
  create,
}
