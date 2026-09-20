import { createTheme } from '@mui/material/styles'

// Paleta "verde montaña": bosque, tierra y piedra clara.
// Cambiar un color acá lo cambia en toda la app.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E5E3A', // verde bosque
      light: '#4C8B5B',
      dark: '#1E3F27',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A9744F', // tierra / madera
    },
    background: {
      default: '#F4F1EA', // piedra clara
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2A24',
      secondary: '#55655C',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
})

export default theme
