import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseConfig'

export default function Signup({ hideSwitch = false }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Set displayName
      try { await updateProfile(cred.user, { displayName: name }) } catch {}
      // Create user profile in Firestore (with fallback to localStorage)
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          email,
          phone: phone || null,
          selectedExam: selectedExam || null,
          createdAt: new Date().toISOString()
        })
      } catch (firestoreError) {
        console.warn("Firestore write failed, using localStorage fallback:", firestoreError)
        // Fallback to localStorage for now
        localStorage.setItem("auth_user", JSON.stringify({
          uid: cred.user.uid,
          name,
          email,
          phone: phone || null,
          selectedExam: selectedExam || null,
        }))
        // Store email separately for easy access
        localStorage.setItem('user_email', email)
      }
      setSuccess(true)
      // Redirect to login, which will then redirect to selected exam
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      console.error('Signup error:', err)
      const code = err?.code || ''
      if (code === 'auth/email-already-in-use') setError('Email already in use')
      else if (code === 'auth/weak-password') setError('Password should be at least 6 characters')
      else if (code === 'auth/operation-not-allowed') setError('Email/Password sign-in is disabled in Firebase Console')
      else if (code === 'auth/invalid-email') setError('Invalid email address')
      else setError('Signup failed. Please try again.')
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
      <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ color: 'var(--text-primary)' }}>Create account</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'var(--text-secondary)' }} align="center">Start practicing PYQs right away.</Typography>
      <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField size="medium" label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
        <TextField size="medium" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
        <TextField size="medium" label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
        <FormControl fullWidth size="medium">
          <InputLabel>Selected Exam</InputLabel>
          <Select
            value={selectedExam}
            label="Selected Exam"
            onChange={e => setSelectedExam(e.target.value)}
          >
                        <MenuItem value="JEE Mains">JEE Mains</MenuItem>
                        <MenuItem value="JEE Advanced">JEE Advanced</MenuItem>
                        <MenuItem value="NEET">NEET</MenuItem>
                        <MenuItem value="UPSC Prelims">UPSC Prelims</MenuItem>
                        <MenuItem value="GATE">GATE</MenuItem>
                        <MenuItem value="CAT">CAT</MenuItem>
                        <MenuItem value="SSC">SSC</MenuItem>
                        <MenuItem value="Banking">Banking</MenuItem>
                        <MenuItem value="Railway">Railway</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField size="medium" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Account created successfully! Redirecting to login...</Alert>}
        <Button type="submit" variant="contained" size="large" fullWidth disabled={success}>Create account</Button>
        {!hideSwitch && (
          <Typography sx={{ color: 'var(--text-secondary)' }} align="center">Have an account? <Link to="/login">Login</Link></Typography>
        )}
      </Stack>
    </Box>
  )
}


