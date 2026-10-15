import mongoose, { Schema } from "mongoose";

export interface Comentario {
  contenido: string
  autor: string
  createdAt: Date
  updatedAt: Date
  //likes: number
  //dislikes: number  
  usuario: mongoose.Types.ObjectId
  // padre?: mongoose.Types.ObjectId // null si no responde a nadie o el id del respondido
}


const postSchema = new mongoose.Schema<Comentario>(
  {
    contenido: { type: String, required: true },
    autor: { type: String },
    //likes: { type: Number, default: 0 },
    //dislikes: { type: Number, default: 0 },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario"},
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

const ComentarioModel = mongoose.model<Comentario>("Comentario", postSchema);

export default ComentarioModel;