export interface DetalleCerro {
  id: number
  nombre: string
  descripcion: string
  altura: number
  dificultad: "Principiante" | "Intermedio" | "Avanzado"
  descansos: number
  banos: boolean
  imagenes: string[]
  ubicacion: string
  createdAt: string
  updatedAt: string
}
