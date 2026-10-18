import axios from 'axios'
import type { Cerro } from '../types/cerro'

const cerrosUrl = '/api/cerros'

const parseCerros = (data: unknown): Cerro[] => {
  if (Array.isArray(data)) {
    return data as Cerro[]
  }

  if (typeof data === 'object' && data !== null) {
    const response = data as { cerros?: unknown; data?: unknown }

    if (Array.isArray(response.cerros)) {
      return response.cerros as Cerro[]
    }

    if (Array.isArray(response.data)) {
      return response.data as Cerro[]
    }
  }

  throw new Error('La API devolvió un formato inválido para los cerros')
}

const getAll = () => {
  return axios.get<unknown>(cerrosUrl).then(response => parseCerros(response.data))
}

const getCerro = (id: string) => {
  return axios.get<Cerro>(`${cerrosUrl}/${id}`).then(response => response.data)
}

type CerroData = Omit<Cerro, 'id' | 'createdAt' | 'updatedAt'>

const create = (data: CerroData) => {
  return axios.post<Cerro>(cerrosUrl, data).then(response => response.data)
}

const update = (id: string, data: Partial<CerroData>) => {
  return axios.put<Cerro>(`${cerrosUrl}/${id}`, data).then(response => response.data)
}

const remove = (id: string) => {
  return axios.delete(`${cerrosUrl}/${id}`)
}

export default {
  getAll,
  getCerro,
  create,
  update,
  remove,
}
