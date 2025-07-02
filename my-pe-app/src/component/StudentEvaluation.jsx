import React, { useState } from 'react'
import { gradeSolution } from '../firebase/solutionApi'
import { useParams } from 'react-router-dom'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function StudentEvaluation() {
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const { solutionId } = useParams()
  const showMessage = useSnackbar()

  const handleEvaluate = async (e) => {
    e.preventDefault()
    await gradeSolution(solutionId, grade, feedback)
    setGrade('')
    setFeedback('')
    showMessage('Evaluation submitted!', 'success')
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Evaluate Student's Performance</Typography>
      <Box component="form" onSubmit={handleEvaluate}>
        <TextField
          label="Grade"
          value={grade}
          onChange={e => setGrade(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Feedback"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Submit Evaluation
        </Button>
      </Box>
    </Paper>
  )
}

export default StudentEvaluation