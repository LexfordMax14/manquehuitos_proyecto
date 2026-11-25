import { useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { ComentarioType } from "../types/comentario";

// Debe coincidir con PLAZO_EDICION_MS del backend, que es quien realmente lo valida.
export const PLAZO_EDICION_MS = 5 * 60 * 1000;

interface Prop {
  comentario: ComentarioType;
  esAutor: boolean;
  esAdmin: boolean;
  onEditar: (contenido: string) => Promise<void>;
  onEliminar: () => Promise<void>;
}

// Milisegundos que le quedan al autor para editar (0 si ya pasó el plazo).
const tiempoRestante = (createdAt: string) =>
  Math.max(0, new Date(createdAt).getTime() + PLAZO_EDICION_MS - Date.now());

const Comentario = ({ comentario, esAutor, esAdmin, onEditar, onEliminar }: Prop) => {
  const [restante, setRestante] = useState(() => tiempoRestante(comentario.createdAt));
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(comentario.contenido);
  const [ocupado, setOcupado] = useState(false);

  // Actualiza el contador cada segundo mientras el comentario siga siendo editable.
  useEffect(() => {
    if (!esAutor || restante === 0) return;
    const timer = setInterval(() => setRestante(tiempoRestante(comentario.createdAt)), 1000);
    return () => clearInterval(timer);
  }, [esAutor, restante, comentario.createdAt]);

  // El admin edita cualquier comentario sin plazo; el autor, solo durante 5 minutos.
  const puedeEditar = esAdmin || (esAutor && restante > 0);
  const minutos = Math.floor(restante / 60000);
  const segundos = String(Math.floor((restante % 60000) / 1000)).padStart(2, "0");
  const fueEditado = comentario.updatedAt !== comentario.createdAt;

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOcupado(true);
    try {
      await onEditar(texto.trim());
      setEditando(false);
    } catch {
      // La página del cerro muestra el error (por ejemplo, si venció el plazo).
    } finally {
      setOcupado(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm("¿Eliminar este comentario? No se puede deshacer.")) return;
    setOcupado(true);
    try {
      await onEliminar();
    } catch {
      // La página del cerro muestra el error.
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: 'primary.dark' }}>
        {comentario.autor || "Anónimo"}
        {fueEditado && (
          <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
            (editado)
          </Typography>
        )}
      </Typography>

      {editando ? (
        <Stack component="form" onSubmit={guardar} sx={{ gap: 1, mt: 1 }}>
          <TextField
            size="small"
            multiline
            required
            autoFocus
            value={texto}
            onChange={event => setTexto(event.target.value)}
          />
          <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
            <Button
              size="small"
              disabled={ocupado}
              onClick={() => { setTexto(comentario.contenido); setEditando(false); }}
            >
              Cancelar
            </Button>
            <Button size="small" type="submit" variant="contained" disabled={ocupado || !texto.trim()}>
              Guardar
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
          {comentario.contenido}
        </Typography>
      )}

      {comentario.fotos?.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1, mt: 1.5 }}>
          {comentario.fotos.map((foto, index) => (
            <Box key={foto} component="a" href={foto} target="_blank" rel="noopener noreferrer">
              <Box
                component="img"
                src={foto}
                alt={`Foto ${index + 1} de ${comentario.autor || 'Anónimo'}`}
                loading="lazy"
                sx={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 1, display: 'block' }}
              />
            </Box>
          ))}
        </Box>
      )}

      {!editando && (puedeEditar || esAdmin) && (
        <Stack direction="row" sx={{ gap: 1, mt: 1, alignItems: 'center' }}>
          {puedeEditar && (
            <>
              <Button size="small" disabled={ocupado} onClick={() => setEditando(true)}>
                Editar
              </Button>
              {!esAdmin && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {minutos}:{segundos} para editar
                </Typography>
              )}
            </>
          )}
          {esAdmin && (
            <Button size="small" color="error" disabled={ocupado} onClick={eliminar} sx={{ ml: 'auto' }}>
              Eliminar
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default Comentario;
