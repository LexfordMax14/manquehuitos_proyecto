export interface ComentarioType {
  id: string
  cerro: string
  contenido: string
  autor: string | null
  usuario?: string // id del usuario que lo publicó; no existe en comentarios anónimos
  fotos: string[] // URLs de las fotos subidas
  createdAt: string
  updatedAt: string
  // padre: number | null // null si no responde a nadie o el id del respondido
  // likes: number
  // dislikes: number
}
