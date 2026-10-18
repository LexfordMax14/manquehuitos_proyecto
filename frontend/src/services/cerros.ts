import axios from 'axios'
import type { Cerro } from '../types/cerro'
const getAll = async (signal?: AbortSignal): Promise<Cerro[]> =>
  (await axios.get<Cerro[]>('/api/cerros', { signal })).data
const getCerro = async (id: string, signal?: AbortSignal): Promise<Cerro> =>
  (await axios.get<Cerro>(`/api/cerros/${encodeURIComponent(id)}`, { signal })).data
export default { getAll, getCerro }
