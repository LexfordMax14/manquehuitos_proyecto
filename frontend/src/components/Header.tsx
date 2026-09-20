import { AppBar, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { AccountCircle, Logout } from '@mui/icons-material'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#d9bfb0' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: '#800000',
            fontWeight: 'bold',
            textDecoration: 'none',
            flexGrow: 1,
          }}
        >
          Manquehuapp
        </Typography>

        <Button component={Link} to="/" sx={{ color: '#800000' }}>
          Threads
        </Button>

        <Tooltip title="Mi perfil">
          <IconButton component={Link} to="/perfil" aria-label="Mi perfil" sx={{ color: '#800000' }}>
            <AccountCircle />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cerrar sesión">
          <IconButton
            aria-label="Cerrar sesión"
            sx={{ color: '#800000' }}
          >
            <Logout />|
          </IconButton>
        </Tooltip>

      </Toolbar>
    </AppBar>
  )
}

export default Header
