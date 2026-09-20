// Modelo de un cerro. Por ahora solo con lo mínimo que necesita la tarjeta.

export interface Cerro {
  id: number
  nombre: string
  imagen: string
  altura: number
  dificultad?: string
  descansos?: string[]
  banos?: string[]
  descripcion: string
  imagenes: string[]
  titulo?: string
  galeria?: string[]
  ubicacion: string
  comentarios: string[]
}
