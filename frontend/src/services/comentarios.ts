import { api } from './auth'
import type { ComentarioType } from '../types/comentario'

const comentariosUrl = '/api/comentarios'

const getByCerro = (cerroId: string) => {
  return api
    .get<ComentarioType[]>(`${comentariosUrl}/${cerroId}`)
    .then(response => response.data)
}

// Con fotos se envía como multipart/form-data; sin fotos, como JSON.
const create = (data: Pick<ComentarioType, 'contenido' | 'autor'>, cerroId: string, fotos: File[] = []) => {
  let body: FormData | typeof data = data
  if (fotos.length > 0) {
    const form = new FormData()
    form.append('contenido', data.contenido)
    if (data.autor) form.append('autor', data.autor)
    fotos.forEach(foto => form.append('fotos', foto))
    body = form
  }
  return api
    .post<ComentarioType>(`${comentariosUrl}/${cerroId}`, body)
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
