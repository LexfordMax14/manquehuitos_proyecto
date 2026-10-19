import axios from 'axios'
export type SessionUser = { id: string; username: string; email: string }
export const api = axios.create({ withCredentials: true })
export function clearSession() {
  localStorage.removeItem('csrfToken')
  localStorage.removeItem('sessionUser')
}
api.interceptors.request.use(config => {
  const csrf = localStorage.getItem('csrfToken')
  if (csrf) config.headers['X-CSRF-Token'] = csrf
  return config
})
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    clearSession()
    window.dispatchEvent(new Event('session-expired'))
  }
  return Promise.reject(error)
})
export async function login(username: string, password: string): Promise<SessionUser> {
  const response = await api.post<SessionUser>('/api/login', { username, password })
  localStorage.setItem('csrfToken', response.headers['x-csrf-token'])
  localStorage.setItem('sessionUser', JSON.stringify(response.data))
  return response.data
}
export async function restoreLogin(): Promise<SessionUser> {
  return (await api.get<SessionUser>('/api/login/me')).data
}
export async function logout() {
  try { await api.post('/api/login/logout') } finally { clearSession() }
}
export function errorMessage(error: unknown): string {
  return axios.isAxiosError(error) ? error.response?.data?.error || 'No se pudo conectar con el servidor' : 'Ocurrió un error'
}
