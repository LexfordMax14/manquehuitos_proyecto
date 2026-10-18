import { api } from './auth'
import type { ComentarioType } from '../types/comentario'

const comentariosUrl = '/api/comentarios'

const getByCerro = (cerroId: string) => {
  return api
    .get<ComentarioType[]>(`${comentariosUrl}/${cerroId}`)
    .then(response => response.data)
}

const create = (data: Pick<ComentarioType, 'contenido' | 'autor'>, cerroId: string) => {
  return api
    .post<ComentarioType>(`${comentariosUrl}/${cerroId}`, data)
    .then(response => response.data)
}

const update = (cerroId: string, id: string, contenido: string) => {
  return api
    .put<ComentarioType>(`${comentariosUrl}/${cerroId}/${id}`, { contenido })
    .then(response => response.data)
}

const remove = (cerroId: string, id: string) => {
  return api.delete(`${comentariosUrl}/${cerroId}/${id}`)
}

export default {
  getByCerro,
  create,
  update,
  remove,
}
