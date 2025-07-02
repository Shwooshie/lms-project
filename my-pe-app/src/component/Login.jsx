import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from './SnackbarProvider'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const auth = getAuth()
  const navigate = useNavigate()
  const showMessage = useSnackbar()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      showMessage("Logged in successfully!", 'success')
      navigate('/courses') // Redirect to courses page after login
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        showMessage("Username is not correct", 'error')
      } else if (error.code === 'auth/wrong-password') {
        showMessage("Password is not correct", 'error')
      } else {
        showMessage(error.message, 'error')
      }
    }
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Login</Typography>
      <Box component="form" onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    </Paper>
  )
}

export default Login