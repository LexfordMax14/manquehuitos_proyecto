import { api, errorMessage } from '../services/auth'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';

const estiloCampo = {
  '& .MuiInputLabel-root': { fontSize: '1.2rem' },
  '& .MuiOutlinedInput-notchedOutline legend': { fontSize: '0.9rem' },
};

const Registro = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);

  const noCoinciden = confirmar !== '' && confirmar !== contrasena;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (noCoinciden) return;
    setBusy(true);
    try {
      await api.post('/api/usuarios', { username: usuario, email: correo, password: contrasena });
      navigate('/login', { state: { registered: true } });
    } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
        <Stack sx={{ gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="h5" sx={{ color: 'primary.dark', textAlign: 'center' }}>
            Crear cuenta
          </Typography>

          <TextField
            label="Usuario"
            sx={estiloCampo}
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

          <TextField
            label="Correo"
            sx={{ ...estiloCampo, mb: 1.5 }}
            required
            type="email"
            autoComplete="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack sx={{ gap: 2 }}>
            <Button
              type="button"
              size="small"
              onClick={() => setMostrar(!mostrar)}
              startIcon={mostrar ? <VisibilityOff /> : <Visibility />}
              sx={{ alignSelf: 'flex-end', color: 'primary.light', py: 0, mt: -1, mb: -1 }}
            >
              {mostrar ? 'Ocultar' : 'Mostrar'}
            </Button>

            <TextField
              label="Contraseña"
              sx={estiloCampo}
              required
              type={mostrar ? 'text' : 'password'}
              autoComplete="new-password"
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

            <TextField
              label="Confirmar contraseña"
              sx={estiloCampo}
              required
              type={mostrar ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              error={noCoinciden}
              helperText={noCoinciden ? 'Las contraseñas no coinciden' : ' '}
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
          </Stack>

          <Button type="submit" disabled={busy} variant="contained" size="large">
            Registrarse
          </Button>

          <Button
            type="button"
            size="small"
            onClick={() => navigate('/login')}
            sx={{ alignSelf: 'center', textTransform: 'none', color: 'primary.light' }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Registro;
