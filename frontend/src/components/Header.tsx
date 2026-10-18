import { AppBar, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { AccountCircle, Logout } from '@mui/icons-material'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            flexGrow: 1,
          }}
        >
          Manquehuapp
        </Typography>

        <Button component={Link} to="/login" sx={{ color: 'inherit' }}>
          Iniciar sesión
        </Button>

        <Tooltip title="Mi perfil">
          <IconButton component={Link} to="/" aria-label="Mi perfil" sx={{ color: 'inherit' }}>
            <AccountCircle />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cerrar sesión">
          <IconButton
            aria-label="Cerrar sesión"
            onClick={() => console.log('cerrar sesión')}
            sx={{ color: 'inherit' }}
          >
            <Logout />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}

export default Header
