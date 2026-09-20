import { Box, Typography } from "@mui/material";
import type { ComentarioType } from "../types/comentario";

interface Prop {
  comentario: ComentarioType;
}

const Comentario = ({ comentario }: Prop) => (
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
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {comentario.contenido}
    </Typography>
  </Box>
);

export default Comentario;
