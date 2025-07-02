import React, { useState } from 'react'
import { submitSolution } from '../firebase/solutionApi'
import { uploadFile } from '../firebase/storage'
import { getAuth } from 'firebase/auth'
import { useParams } from 'react-router-dom'
import { Box, Button, Typography, Paper } from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function SolutionSubmit() {
  const [file, setFile] = useState(null)
  const { exerciseId } = useParams()
  const auth = getAuth()
  const showMessage = useSnackbar()

  const handleSubmit = async (e) => {
    e.preventDefault()
    let fileUrl = ''
    if (file) {
      fileUrl = await uploadFile(file, `solutions/${exerciseId}/${auth.currentUser.uid}-${file.name}`)
    }
    await submitSolution({
      exerciseId,
      studentId: auth.currentUser.uid,
      file: fileUrl,
    })
    setFile(null)
    showMessage('Solution submitted!', 'success')
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Submit Solution</Typography>
      <Box component="form" onSubmit={handleSubmit}>
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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
    </Paper>
  )
}

export default SolutionSubmit