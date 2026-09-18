export interface Cerro {
  nombre: string;
  altura: number;
  dificultad: 'Baja' | 'Media' | 'Alta' | 'Experto';
  descripcion: string;
  ubicacion: string;
  imagenes: File[];
}
