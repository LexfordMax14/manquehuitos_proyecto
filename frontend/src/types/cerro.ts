export interface RutaCerro {
  id: number
  nombre: string
  distanciaKm: number
  duracion: string
  dificultad: "Baja" | "Media" | "Alta" | "Experto"
  coordenadas: [number, number][]
}

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
  rutas?: RutaCerro[]
  createdAt: string
  updatedAt: string
}

