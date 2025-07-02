import React, { useState } from 'react'
import { addExercise } from '../firebase/exerciseApi'
import { uploadFile } from '../firebase/storage'
import { getAuth } from 'firebase/auth'
import { useParams } from 'react-router-dom'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function ExerciseUpload() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [file, setFile] = useState(null)
  const { courseId } = useParams()
  const auth = getAuth()
  const showMessage = useSnackbar()

  const handleUpload = async (e) => {
    e.preventDefault()
    let fileUrl = ''
    if (file) {
      fileUrl = await uploadFile(file, `exercises/${courseId}/${file.name}`)
    }
    await addExercise({
      courseId,
      name,
      description,
      file: fileUrl,
      deadline: new Date(deadline),
      createdBy: auth.currentUser.uid,
    })
    setName('')
    setDescription('')
    setDeadline('')
    setFile(null)
    showMessage('Exercise uploaded!', 'success')
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Upload Exercise</Typography>
      <Box component="form" onSubmit={handleUpload}>
        <TextField
          label="Title"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Deadline"
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mt: 2 }}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={e => setFile(e.target.files[0])}
            required
          />
        </Button>
        {/* Show selected file name */}
        {file && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Selected file: {file.name}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Upload
        </Button>
      </Box>
    </Paper>
  )
}

export default ExerciseUpload