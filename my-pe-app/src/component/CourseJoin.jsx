import React, { useState } from 'react'
import { enrollStudent } from '../firebase/courseApi'
import { getAuth } from 'firebase/auth'
import { getUser } from '../firebase/userApi'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function CourseJoin() {
  const [courseId, setCourseId] = useState('')
  const auth = getAuth()
  const showMessage = useSnackbar()

  const handleJoin = async (e) => {
    e.preventDefault()
    try {
      const user = await getUser(auth.currentUser.uid)
      await enrollStudent(courseId, {
        id: user.id,
        name: user.name,
        email: user.email,
      })
      showMessage('Joined course!', 'success')
    } catch (err) {
      showMessage(err.message, 'error')
    }
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Join Course</Typography>
      <Box component="form" onSubmit={handleJoin}>
        <TextField
          label="Course ID"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Join
        </Button>
      </Box>
    </Paper>
  )
}

export default CourseJoin