import { useState } from 'react'
import { Alert, AppBar, Button, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { errorMessage } from '../services/auth'
function Header() {
  const { user, loading, signOut } = useAuth()
  const [error, setError] = useState('')
  return <><AppBar position="sticky"><Toolbar sx={{ gap: 1 }}>
    <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>Manquehuapp</Typography>
    {!loading && (user ? <>
      <Typography>{user.username}</Typography>
      <Button component={Link} to="/form" color="inherit">Crear cerro</Button>
      <Button color="inherit" onClick={async () => {
        try { await signOut(); setError('') } catch (failure) { setError(errorMessage(failure)) }
      }}>Cerrar sesión</Button>
    </> : <Button component={Link} to="/login" color="inherit">Iniciar sesión</Button>)}
  </Toolbar></AppBar>{error && <Alert severity="error">{error}</Alert>}</>
}
export default Header
