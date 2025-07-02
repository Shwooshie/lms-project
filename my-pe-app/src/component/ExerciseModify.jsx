import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExercise, updateExercise } from '../firebase/exerciseApi'
import { uploadFile, deleteFile } from '../firebase/storage'
import { Paper, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function ExerciseModify() {
  const { courseId, exerciseId } = useParams()
  const [exercise, setExercise] = useState(null)
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false)
  const navigate = useNavigate()
  const showMessage = useSnackbar()

  useEffect(() => {
    const fetchExercise = async () => {
      const ex = await getExercise(exerciseId)
      setExercise(ex)
      setName(ex.name)
      setFileUrl(ex.file)
      if (ex.deadline?.seconds) {
        // Convert Firestore Timestamp to yyyy-MM-ddTHH:mm for input
        const d = new Date(ex.deadline.seconds * 1000)
        setDeadline(d.toISOString().slice(0, 16))
      }
    }
    fetchExercise()
  }, [exerciseId])

  const handleUpdate = async (e) => {
    e.preventDefault()
    let newFileUrl = fileUrl
    if (file) {
      // Optionally delete old file
      if (fileUrl) {
        try { await deleteFile(fileUrl) } catch {}
      }
      newFileUrl = await uploadFile(file, `exercises/${courseId}/${file.name}`)
    }
    await updateExercise(exerciseId, {
      name,
      file: newFileUrl,
      deadline: deadline ? new Date(deadline) : null,
    })
    showMessage('Exercise updated!', 'success')
    navigate(`/exercises/${courseId}/detail/${exerciseId}`)
  }

  const handleDeleteFile = () => setShowDeleteFileDialog(true)
  const confirmDeleteFile = async () => {
    await deleteFile(fileUrl)
    setFileUrl('')
    await updateExercise(exerciseId, { file: '' })
    setShowDeleteFileDialog(false)
  }

  if (!exercise) return <div>Loading...</div>

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, mx: 'auto', mt: 6, p: 4 }}>
      <Typography variant="h5" mb={2}>Modify Exercise</Typography>
      <Box component="form" onSubmit={handleUpdate}>
        <TextField
          label="Exercise Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Deadline"
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        {fileUrl && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mr: 2 }}
            >
              Download Current File
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteFile}
            >
              Delete File
            </Button>
          </Box>
        )}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mt: 1, mb: 1 }}
        >
          {file ? 'Change File' : 'Upload New File'}
          <input
            type="file"
            hidden
            onChange={e => setFile(e.target.files[0])}
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Selected file: {file.name}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </Box>
      <Dialog open={showDeleteFileDialog} onClose={() => setShowDeleteFileDialog(false)}>
        <DialogTitle>Delete File?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the attached file?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteFileDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteFile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default ExerciseModify