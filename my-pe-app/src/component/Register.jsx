// components/Register.jsx
import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { createOrUpdateUser } from '../firebase/userApi'
import { Box, Button, MenuItem, TextField, Typography, Paper } from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const auth = getAuth()
  const showMessage = useSnackbar()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      await createOrUpdateUser(userCred.user.uid, { name, email, role })
      showMessage("Registered successfully!", 'success')
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Register</Typography>
      <Box component="form" onSubmit={handleRegister}>
        <TextField
          label="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
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
        <TextField
          select
          label="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="lecturer">Lecturer</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </Paper>
  )
}

export default Register
