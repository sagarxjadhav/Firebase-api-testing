import { useEffect } from 'react'
import { Box } from '@mui/material'
import Login from './Login.jsx'

export default function Auth() {

  useEffect(() => {
    try {
      localStorage.setItem('first_open_seen_auth', 'true')
    } catch {}
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 0.5, sm: 0 } }}>
      <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
        <Login />
      </Box>
    </Box>
  )
}


