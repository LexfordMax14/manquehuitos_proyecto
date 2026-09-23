import cerros from "../data/cerros.json";
import type { Cerro } from '../types/cerro'


const getCerro = (id: number): Cerro => {
  const cerro = cerros.find(cerro => cerro.id === id);

    if (!cerro) {
        throw new Error("Cerro no encontrado");
    }

    return cerro as Cerro;
}

export default {
  getCerro
}
