import mongoose from "mongoose";

export interface RutaCerroData {
  id: number
  nombre: string
  distanciaKm: number
  duracion: string
  dificultad: "Baja" | "Media" | "Alta" | "Experto"
  coordenadas: [number, number][]
}

const rutaSchema = new mongoose.Schema<RutaCerroData>(
  {
    id: { type: Number },
    nombre: { type: String },
    distanciaKm: { type: Number },
    duracion: { type: String },
    dificultad: { type: String },
    coordenadas: { type: [[Number]] },
  },
  { _id: false }
);

export interface CerroData {
  rutas: RutaCerroData[]
  nombre: string
  descripcion: string
  altura: number
  dificultad?: "Baja" | "Media" | "Alta" | "Experto"
  descansos?: number
  banos?: boolean  
  imagenes: string[]
  ubicacion: string
  createdAt: Date;
  updatedAt: Date;
}

const DIFICULTAD = ["Baja", "Media", "Alta", "Experto"];
function dificultadValida(v: string) {
  return DIFICULTAD.includes(v);
}


const postSchema = new mongoose.Schema<CerroData>(
  {
    rutas: { type: [rutaSchema], default: [] },
    nombre: { type: String, required: true },
    descripcion: { type: String },
    altura: { type: Number, required: true },
    dificultad: { 
      type: String, 
      required: true,
      validate: {
        validator: dificultadValida,
        message: (props) => `${props.value} no es una dificultad valida`,
      },
    },
    descansos: { type: Number },
    banos: { type: Boolean },
    imagenes: { type: [String], required: true },
    ubicacion: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

postSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const CerroModel = mongoose.model<CerroData>("CerroData", postSchema);

export default CerroModel;