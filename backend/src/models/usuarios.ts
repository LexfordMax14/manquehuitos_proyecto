import mongoose from "mongoose";

export interface UsuarioData {
  id: string
  username: string
  email: string
  passwordHash: string
}

const userSchema = new mongoose.Schema<UsuarioData>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Correo inválido"],},
  passwordHash: { type: String, required: true},
});


const Usuario = mongoose.model<UsuarioData>("Usuario", userSchema);

userSchema.set("toJSON", {
  transform: (
    _document,
    returnedObject: {
      id?: string;
      _id?: mongoose.Types.ObjectId;
      __v?: number;
      passwordHash?: string;
    }
  ) => {
    returnedObject.id = returnedObject._id?.toString();

    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

export default Usuario;
