export interface Cerro {
  id: number
  nombre: string
  descripcion: string
  altura: number
  dificultad?: "Baja" | "Media" | "Alta" | "Experto"
  descansos?: number
  banos?: boolean  
  imagenes: string[]
  ubicacion: string
  createdAt: string
  updatedAt: string
}
