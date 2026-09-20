export interface ComentarioType {
  id: number
  cerro: number
  contenido: string
  autor: string | null
  // padre: number | null // null si no responde a nadie o el id del respondido
  // createdAt: string
  // updatedAt: string
  // likes: number
  // dislikes: number
}