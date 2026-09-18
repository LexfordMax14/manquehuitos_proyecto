import { useState } from 'react';
import type { Cerro } from '../types/cerro';
import './CreateCerroForm.css';

interface CreateCerroFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCerroForm = ({ isOpen, onClose }: CreateCerroFormProps) => {
  const [cerro, setCerro] = useState<Omit<Cerro, 'imagenes'> & { imagenes: FileList | null }>({
    nombre: '',
    altura: 0,
    dificultad: 'Baja',
    descripcion: '',
    ubicacion: '',
    imagenes: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cerro creado:', cerro);
    alert('Cerro creado. Revisa la consola para ver los datos.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <form className="cerro-form" onSubmit={handleSubmit}>
        <button type="button" className="close-button" onClick={onClose}>X</button>
        <h2>Crear Nuevo Cerro</h2>
        <input type="text" placeholder="Nombre" onChange={(e) => setCerro({...cerro, nombre: e.target.value})} required />
        <input type="number" placeholder="Altura" onChange={(e) => setCerro({...cerro, altura: Number(e.target.value)})} required />
        <select onChange={(e) => setCerro({...cerro, dificultad: e.target.value as Cerro['dificultad']})}>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
          <option value="Experto">Experto</option>
        </select>
        <textarea placeholder="Descripción" onChange={(e) => setCerro({...cerro, descripcion: e.target.value})} required />
        <input type="text" placeholder="Ubicación" onChange={(e) => setCerro({...cerro, ubicacion: e.target.value})} required />
        <input type="file" multiple onChange={(e) => setCerro({...cerro, imagenes: e.target.files})} />
        <button type="submit">Crear</button>
      </form>
    </div>
  );
};
