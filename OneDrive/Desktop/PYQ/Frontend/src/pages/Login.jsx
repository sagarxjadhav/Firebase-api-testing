import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseConfig'
import { getExamRedirectUrl } from '../utils/examUtils'

export default function Login({ hideSwitch = false }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // Try to fetch user profile for routing (with localStorage fallback)
      let selectedExam = null
      try {
        const profileSnap = await getDoc(doc(db, 'users', cred.user.uid))
        selectedExam = profileSnap.exists() ? (profileSnap.data().selectedExam || null) : null
      } catch (firestoreError) {
        console.warn("Firestore read failed, using localStorage fallback:", firestoreError)
        // Fallback to localStorage
        const localUser = localStorage.getItem("auth_user")
        if (localUser) {
          const userData = JSON.parse(localUser)
          selectedExam = userData.selectedExam || null
        }
      }
      
      // Store user data in localStorage for app access
      const userData = {
        uid: cred.user.uid,
        email: cred.user.email,
        name: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
        selectedExam: selectedExam
      }
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // Store email separately for easy access
      localStorage.setItem('user_email', cred.user.email)
      console.log('User data stored in localStorage:', userData)
      console.log('User email stored:', cred.user.email)
      
      // Navigate to user's selected exam or subjects page
      const redirectUrl = getExamRedirectUrl()
      console.log('Redirecting to:', redirectUrl)
      navigate(redirectUrl)
    } catch (err) {
      const msg = String(err?.message || err)
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Invalid email or password')
      } else if (msg.includes('auth/user-not-found')) {
        setError('No account found with this email')
      } else {
        setError('Login failed. Please try again.')
      }
    }
  }

  return (
    <Box sx={{
      maxWidth: 520,
      mx: 'auto',
      px: 2,
      py: 0,
      minHeight: 'calc(100vh - 32px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ color: 'var(--text-primary)' }}>Welcome back</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'var(--text-secondary)' }} align="center">Login to continue and start solving PYQs.</Typography>
                  <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField size="medium" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
                    <TextField size="medium" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" size="large" fullWidth>Login</Button>
                    {!hideSwitch && (
                      <Typography sx={{ color: 'var(--text-secondary)' }} align="center">No account? <Link to="/signup">Signup</Link></Typography>
                    )}
                  </Stack>
    </Box>
  )
}


