import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse, updateCourse, deleteCourse } from '../firebase/courseApi'
import { addMaterial } from '../firebase/materialApi'
import { addExercise } from '../firebase/exerciseApi'
import { uploadFile } from '../firebase/storage'
import { Box, Button, TextField, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useSnackbar } from './SnackbarProvider.jsx'

function CourseModify() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [description, setDescription] = useState('')
  const [materialFile, setMaterialFile] = useState(null)
  const [materialName, setMaterialName] = useState('')
  const [exerciseFile, setExerciseFile] = useState(null)
  const [exerciseName, setExerciseName] = useState('')
  const [exerciseDeadline, setExerciseDeadline] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const navigate = useNavigate()
  const showMessage = useSnackbar()

  useEffect(() => {
    const fetchCourse = async () => {
      const c = await getCourse(id)
      setCourse(c)
      setDescription(c.description || '')
    }
    fetchCourse()
  }, [id])

  const handleDescriptionUpdate = async (e) => {
    e.preventDefault()
    await updateCourse(id, { description })
    showMessage('Description updated!', 'success')
  }

  const handleMaterialUpload = async (e) => {
    e.preventDefault()
    try {
      if (!materialFile) {
        alert('Please select a file.')
        return
      }
      let fileUrl = ''
      fileUrl = await uploadFile(materialFile, `materials/${id}/${materialFile.name}`)
      await addMaterial({
        courseId: id,
        name: materialName,
        file: fileUrl,
        description: '',
        uploadedBy: course.lecturerId,
      })
      setMaterialFile(null)
      setMaterialName('')
      showMessage('Material uploaded!', 'success')
    } catch (err) {
      console.error(err)
      showMessage('Failed to upload material: ' + err.message, 'error')
    }
  }

  const handleExerciseUpload = async (e) => {
    e.preventDefault()
    let fileUrl = ''
    if (exerciseFile) {
      fileUrl = await uploadFile(exerciseFile, `exercises/${id}/${exerciseFile.name}`)
    }
    await addExercise({
      courseId: id,
      name: exerciseName,
      file: fileUrl,
      deadline: new Date(exerciseDeadline),
      createdBy: course.lecturerId,
    })
    setExerciseFile(null)
    setExerciseName('')
    setExerciseDeadline('')
    showMessage('Exercise uploaded!', 'success')
  }

  const handleDeleteCourse = () => {
    setShowDeleteDialog(true)
  }

  const confirmDeleteCourse = async () => {
    await deleteCourse(id)
    showMessage('Course deleted!', 'success')
    setShowDeleteDialog(false)
    navigate('/courses')
  }

  if (!course) return <div>Loading...</div>

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteCourse}
        >
          Delete Course
        </Button>
      </Box>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Course?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this course? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteCourse} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h5" mb={2}>Modify Course: {course.name}</Typography>
      {/* Modify Description */}
      <Box component="form" onSubmit={handleDescriptionUpdate} sx={{ mb: 3 }}>
        <TextField
          label="Course Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" color="primary">
          Update Description
        </Button>
      </Box>
      {/* Add Material */}
      <Box component="form" onSubmit={handleMaterialUpload} sx={{ mb: 3 }}>
        <Typography variant="h6" mb={1}>Add Material</Typography>
        <TextField
          label="Material Name"
          value={materialName}
          onChange={e => setMaterialName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mt: 1, mb: 1 }}
        >
          Upload File
          <input
            type="file"
            hidden
            accept=".doc,.docx,.pdf,.mp3,.mp4,.png,.jpg,.jpeg"
            onChange={e => setMaterialFile(e.target.files[0])}
            required
          />
        </Button>
        {/* Show selected file name */}
        {materialFile && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Selected file: {materialFile.name}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary">
          Add Material
        </Button>
      </Box>
      {/* Add Exercise */}
      <Box component="form" onSubmit={handleExerciseUpload}>
        <Typography variant="h6" mb={1}>Add Exercise</Typography>
        <TextField
          label="Exercise Name"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Deadline"
          type="datetime-local"
          value={exerciseDeadline}
          onChange={e => setExerciseDeadline(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mt: 1, mb: 1 }}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={e => setExerciseFile(e.target.files[0])}
            required
          />
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Add Exercise
        </Button>
      </Box>
    </Paper>
  )
}

export default CourseModify