import React, { useState, useEffect } from 'react'
import { createCourse, listCourses, getCourseWithMaterials, duplicateCourseAndMaterials } from '../firebase/courseApi'
import { getAuth } from 'firebase/auth'
import { Box, Button, MenuItem, TextField, Typography, Paper } from '@mui/material'
import { getUser } from '../firebase/userApi'
import { useSnackbar } from './SnackbarProvider'

function CourseCreate() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [copyFrom, setCopyFrom] = useState('')
  const [courses, setCourses] = useState([])
  const auth = getAuth()
  const showMessage = useSnackbar()

  useEffect(() => {
    listCourses({ lecturerId: auth.currentUser?.uid }).then(setCourses)
  }, [auth.currentUser])

  const handleCopy = async (courseId) => {
    if (!courseId) return
    const { course } = await getCourseWithMaterials(courseId)
    setName(course.name + ' (Copy)')
    setDescription(course.description)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userData = await getUser(auth.currentUser.uid)
    if (copyFrom) {
      await duplicateCourseAndMaterials(
        copyFrom,
        { name, description, lecturerName: userData.name },
        auth.currentUser.uid
      )
      showMessage('Course copied and created!', 'success')
    } else {
      await createCourse({
        name,
        description,
        lecturerId: auth.currentUser.uid,
        lecturerName: userData.name,
      })
      showMessage('Course created!', 'success')
    }
    setName('')
    setDescription('')
    setCopyFrom('')
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Create New Course</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          select
          label="Copy from existing course"
          value={copyFrom}
          onChange={e => { setCopyFrom(e.target.value); handleCopy(e.target.value) }}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">-- None --</MenuItem>
          {courses.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Course Name"
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
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          {copyFrom ? 'Copy Course' : 'Create'}
        </Button>
      </Box>
    </Paper>
  )
}

export default CourseCreate