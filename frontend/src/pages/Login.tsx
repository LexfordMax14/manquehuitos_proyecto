import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';

const estiloCampo = {
  '& .MuiInputLabel-root': { fontSize: '1.2rem' },
  '& .MuiOutlinedInput-notchedOutline legend': { fontSize: '0.9rem' },
};

const Login = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrar, setMostrar] = useState(false);

  // Por ahora solo frontend: no se validan credenciales
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { usuario, contrasena });
    navigate('/');
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
        <Stack sx={{ gap: 2 }}>
          <Typography variant="h5" sx={{ color: 'primary.dark', textAlign: 'center' }}>
            Manquehuapp
          </Typography>

          <TextField
            label="Usuario"
            sx={{ ...estiloCampo, mb: 1.5 }}
            required
            autoComplete="username"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack>
            <Button
              type="button"
              size="small"
              onClick={() => setMostrar(!mostrar)}
              startIcon={mostrar ? <VisibilityOff /> : <Visibility />}
              sx={{ alignSelf: 'flex-end', color: 'primary.light', py: 0, mt: -1 }}
            >
              {mostrar ? 'Ocultar' : 'Mostrar'}
            </Button>

            <TextField
              label="Contraseña"
              sx={estiloCampo}
              required
              type={mostrar ? 'text' : 'password'}
              autoComplete="current-password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Solo visual por ahora: no hace nada al presionarlo. */}
            <Button
              type="button"
              size="small"
              sx={{ alignSelf: 'flex-end', textTransform: 'none', color: 'primary.light', py: 0, mt: 0.5 }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Stack>

          <Button type="submit" variant="contained" size="large">
            Ingresar
          </Button>

          <Button type="button" variant="outlined" onClick={() => navigate('/registro')}>
            Registrarse
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
