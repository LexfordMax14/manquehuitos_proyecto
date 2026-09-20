import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import type { Cerro } from '../types/cerro';

// Lo que el usuario llena en el formulario: el id y los comentarios no van,
// porque los genera el backend. Las imágenes son archivos, no URLs todavía.
type NuevoCerro = Pick<Cerro, 'nombre' | 'altura' | 'dificultad' | 'descripcion' | 'ubicacion'> & {
  imagenes: FileList | null;
};

const DIFICULTADES = ['Baja', 'Media', 'Alta', 'Experto'];

const CreateCerroForm = () => {
  const navigate = useNavigate();

  const [cerro, setCerro] = useState<NuevoCerro>({
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
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Stack sx={{ gap: 2.5 }}>
          <Typography variant="h5" sx={{ color: 'primary.dark' }}>
            Crear nuevo cerro
          </Typography>

          <TextField
            label="Nombre"
            required
            value={cerro.nombre}
            onChange={e => setCerro({ ...cerro, nombre: e.target.value })}
          />

          <TextField
            label="Altura (m)"
            type="number"
            required
            value={cerro.altura}
            onChange={e => setCerro({ ...cerro, altura: Number(e.target.value) })}
          />

          <TextField
            select
            label="Dificultad"
            value={cerro.dificultad}
            onChange={e => setCerro({ ...cerro, dificultad: e.target.value as Cerro['dificultad'] })}
          >
            {DIFICULTADES.map(nivel => (
              <MenuItem key={nivel} value={nivel}>
                {nivel}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Ubicación"
            required
            value={cerro.ubicacion}
            onChange={e => setCerro({ ...cerro, ubicacion: e.target.value })}
          />

          <TextField
            label="Descripción"
            required
            multiline
            rows={4}
            value={cerro.descripcion}
            onChange={e => setCerro({ ...cerro, descripcion: e.target.value })}
          />

          <Button component="label" variant="outlined" startIcon={<CloudUpload />}>
            {cerro.imagenes?.length
              ? `${cerro.imagenes.length} imagen(es) seleccionada(s)`
              : 'Subir imágenes'}
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={e => setCerro({ ...cerro, imagenes: e.target.files })}
            />
          </Button>

          <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
            <Button type="button" onClick={() => navigate('/')}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Crear
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CreateCerroForm;
