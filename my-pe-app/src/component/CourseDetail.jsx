import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourse } from '../firebase/courseApi'
import { listMaterials } from '../firebase/materialApi'
import { listExercises } from '../firebase/exerciseApi'
import { Typography, List, ListItem, ListItemText, Button, Paper, Box, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getUser } from '../firebase/userApi'
import { unenrollStudent } from '../firebase/courseApi'

function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [materials, setMaterials] = useState([])
  const [exercises, setExercises] = useState([])
  const [canModify, setCanModify] = useState(false)
  const [students, setStudents] = useState([])
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState(null)
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const c = await getCourse(id)
      setCourse(c)
      // Sort by dateCreated ascending (oldest first, most recent last)
      const mats = await listMaterials(id)
      mats.sort((a, b) => (a.dateCreated?.seconds || 0) - (b.dateCreated?.seconds || 0))
      setMaterials(mats)
      const exs = await listExercises(id)
      exs.sort((a, b) => (a.dateCreated?.seconds || 0) - (b.dateCreated?.seconds || 0))
      setExercises(exs)
      setStudents(c?.students || [])
    }
    fetchData()
  }, [id])

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && course) {
        setUserId(firebaseUser.uid)
        const userData = await getUser(firebaseUser.uid)
        setRole(userData?.role)
        // Check if student is enrolled
        if (userData?.role === 'student') {
          setIsEnrolled(
            Array.isArray(course.students) &&
            course.students.some(s => s.id === firebaseUser.uid)
          )
        }
        setCanModify(
          userData?.role === 'lecturer' && course.lecturerId === firebaseUser.uid
        )
      } else {
        setCanModify(false)
        setIsEnrolled(false)
      }
    })
    return () => unsubscribe()
  }, [course])

  // Remove a student by id
  const handleRemoveStudent = (studentId) => {
    setStudentToRemove(studentId)
    setShowRemoveDialog(true)
  }

  const confirmRemoveStudent = async () => {
    await unenrollStudent(course.id, studentToRemove)
    // Refresh student list
    const updatedCourse = await getCourse(course.id)
    setCourse(updatedCourse)
    setStudents(updatedCourse?.students || [])
    setShowRemoveDialog(false)
    setStudentToRemove(null)
  }

  if (!course) return <div>Loading...</div>

  //Only show details if student is not enrolled
  if (role === 'student' && !isEnrolled) {
    return (
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          mx: 'auto',
          mt: 4,
          p: 5,
          position: 'relative',
        }}
      >
        <Typography variant="h3" sx={{ textAlign: 'center', width: '100%' }}>
          {course.name}
        </Typography>
        <Typography variant="subtitle1" mb={2} sx={{ textAlign: 'center' }}>
          Lecturer: {course.lecturerName || ''}
        </Typography>
        <Typography variant="body1" mb={2} sx={{ textAlign: 'center' }}>
          {course.description}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            bottom: 16,
            color: '#888',
            fontSize: 16,
            fontFamily: 'monospace',
          }}
        >
          Course ID: {course.id}
        </Box>
      </Paper>
    )
  }

  const sortedStudents = [...students].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  )

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        mt: 4,
        p: 5,
        position: 'relative',
        minHeight: 700,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3" sx={{ textAlign: 'center', width: '100%' }}>
          {course.name}
        </Typography>
      </Box>
      <Typography variant="subtitle1" mb={2} sx={{ textAlign: 'center' }}>
        {course.description}
      </Typography>
      <Typography variant="h6" mt={3}>Materials</Typography>
      <List sx={{ maxHeight: 90, overflowY: 'auto', mb: 2 }}>
        {materials.map(m => (
          <ListItem key={m.id} disablePadding>
            <ListItemButton component={Link} to={`/materials/${id}/detail/${m.id}`}>
              <ListItemText primary={m.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" mt={3}>Exercises</Typography>
      <List sx={{ maxHeight: 90, overflowY: 'auto', mb: 2 }}>
        {exercises.map(e => (
          <ListItem key={e.id} disablePadding>
            <ListItemButton component={Link} to={`/exercises/${id}/detail/${e.id}`}>
              <ListItemText
                primary={e.name}
                secondary={e.deadline && new Date(e.deadline.seconds * 1000).toLocaleString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* Student List */}
      <Typography variant="h6" mt={3}>
        Enrolled Students <span style={{ fontWeight: 400, color: '#666', fontSize: 18 }}>({students.length} students)</span>
      </Typography>
      <List sx={{ maxHeight: 90, overflowY: 'auto', mb: 2 }}>
        {sortedStudents.map(student => (
          <ListItem key={student.id}>
            <ListItemText
              primary={student.name}
              secondary={student.email}
            />
            {canModify && (
              <Button
                color="error"
                onClick={() => handleRemoveStudent(student.id)}
              >
                Remove
              </Button>
            )}
          </ListItem>
        ))}
        {students.length === 0 && (
          <ListItem>
            <ListItemText primary="No students enrolled yet." />
          </ListItem>
        )}
      </List>
      {canModify && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            component={Link}
            to={`/courses/${course.id}/modify`}
            variant="contained"
            color="secondary"
          >
            Modify Course
          </Button>
        </Box>
      )}
      {/* Course ID at bottom left */}
      <Box
        sx={{
          position: 'absolute',
          left: 24,
          bottom: 16,
          color: '#888',
          fontSize: 16,
          fontFamily: 'monospace',
        }}
      >
        Course ID: {course.id}
      </Box>
      {/* Remove Student Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onClose={() => setShowRemoveDialog(false)}>
        <DialogTitle>Remove Student?</DialogTitle>
        <DialogContent>
          Are you sure you want to remove this student from the course?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRemoveDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoveStudent} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default CourseDetail