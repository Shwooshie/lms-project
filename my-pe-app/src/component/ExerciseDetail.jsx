import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getExercise } from '../firebase/exerciseApi'
import { getAuth } from 'firebase/auth'
import { getUser } from '../firebase/userApi'
import { listStudentSolutions, listSolutions, gradeSolution, submitSolution } from '../firebase/solutionApi'
import { uploadFile } from '../firebase/storage'
import { Paper, Typography, Button, Box, List, ListItem, ListItemText, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { deleteExercise } from '../firebase/exerciseApi'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function ExerciseDetail() {
  const { courseId, exerciseId } = useParams()
  const [exercise, setExercise] = useState(null)
  const [role, setRole] = useState(null)
  const [canModify, setCanModify] = useState(false)
  const [studentSolution, setStudentSolution] = useState(null)
  const [allSolutions, setAllSolutions] = useState([])
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitFile, setSubmitFile] = useState(null)
  const [grading, setGrading] = useState({ open: false, solution: null, grade: '', feedback: '' })
  const [studentNames, setStudentNames] = useState({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const navigate = useNavigate()
  const auth = getAuth()
  const showMessage = useSnackbar()

  useEffect(() => {
    const fetchData = async () => {
      const ex = await getExercise(exerciseId)
      setExercise(ex)
      if (auth.currentUser) {
        const userData = await getUser(auth.currentUser.uid)
        setRole(userData?.role)
        setCanModify(userData?.role === 'lecturer' && ex.createdBy === auth.currentUser.uid)
        if (userData?.role === 'student') {
          // Fetch student's own solution
          const sols = await listStudentSolutions(auth.currentUser.uid)
          const sol = sols.find(s => s.exerciseId === exerciseId)
          setStudentSolution(sol || null)
        } else if (userData?.role === 'lecturer') {
          // Fetch all solutions for this exercise
          const sols = await listSolutions(exerciseId)
          setAllSolutions(sols)
          // Fetch student names for all solutions
          const ids = [...new Set(sols.map(s => s.studentId))]
          const nameMap = {}
          await Promise.all(ids.map(async id => {
            const u = await getUser(id)
            if (u) nameMap[id] = u.name
          }))
          setStudentNames(nameMap)
        }
      }
    }
    fetchData()
  }, [exerciseId, showSubmit, grading.open])

  // Student: handle submit/resubmit
  const handleSubmitSolution = async (e) => {
    e.preventDefault()
    if (!submitFile) {
      alert('Please select a file.')
      return
    }
    let fileUrl = ''
    fileUrl = await uploadFile(submitFile, `solutions/${exerciseId}/${auth.currentUser.uid}-${submitFile.name}`)
    // If resubmitting, just add a new solution (or update existing)
    await submitSolution({
      exerciseId,
      studentId: auth.currentUser.uid,
      file: fileUrl,
    })
    setShowSubmit(false)
    setSubmitFile(null)
    showMessage('Solution submitted!', 'success')
  }

  // Lecturer: handle grading
  const handleGrade = async () => {
    await gradeSolution(grading.solution.id, grading.grade, grading.feedback)
    setGrading({ open: false, solution: null, grade: '', feedback: '' })
    showMessage('Evaluation submitted!', 'success')
  }

  if (!exercise) return <div>Loading...</div>

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 6, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" mb={2}>{exercise.name}</Typography>
      <Typography variant="subtitle1" mb={2}>
        Due: {exercise.deadline && new Date(exercise.deadline.seconds ? exercise.deadline.seconds * 1000 : exercise.deadline).toLocaleString()}
      </Typography>
      {exercise.file && (
        <Box mb={3}>
          <Button
            variant="outlined"
            href={exercise.file}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Attachment
          </Button>
        </Box>
      )}

      {/* Student: Submit/Resubmit Solution */}
      {role === 'student' && (
        <Box sx={{ mt: 4 }}>
          {studentSolution ? (
            <Box>
              <Typography variant="body1" mb={1}>
                <strong>Your Submission:</strong>
              </Typography>
              <Button
                variant="outlined"
                href={studentSolution.file}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mb: 1 }}
              >
                Download Submitted File
              </Button>
              <Typography variant="body2" mb={1}>
                {studentSolution.grade !== undefined
                  ? `Grade: ${studentSolution.grade}/100`
                  : 'Not graded yet.'}
              </Typography>
              <Typography variant="body2" mb={2}>
                {studentSolution.feedback && `Feedback: ${studentSolution.feedback}`}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowSubmit(true)}
              >
                Resubmit
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowSubmit(true)}
            >
              Submit Solution
            </Button>
          )}
          {/* Submit/Resubmit Dialog */}
          <Dialog open={showSubmit} onClose={() => setShowSubmit(false)}>
            <DialogTitle>Submit Solution</DialogTitle>
            <DialogContent>
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
                  accept=".doc,.docx,.pdf,.mp3,.mp4,.png,.jpg"
                  onChange={e => setSubmitFile(e.target.files[0])}
                  required
                />
              </Button>
              {submitFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {submitFile.name}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSubmit(false)}>Cancel</Button>
              <Button onClick={handleSubmitSolution} variant="contained" color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Lecturer: List and Evaluate Submissions */}
      {role === 'lecturer' && (
        <Box sx={{ mt: 4, textAlign: 'left' }}>
          <Typography variant="h6" mb={2}>Student Submissions</Typography>
          <List>
            {allSolutions.length === 0 && (
              <ListItem>
                <ListItemText primary="No submissions yet." />
              </ListItem>
            )}
            {allSolutions.map(sol => (
              <ListItem key={sol.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText
                  primary={`Student: ${studentNames[sol.studentId] || sol.studentId}`}
                  secondary={
                    <>
                      <a href={sol.file} target="_blank" rel="noopener noreferrer">Download File</a>
                      <br />
                      {sol.grade !== undefined
                        ? `Grade: ${sol.grade}/100`
                        : 'Not graded yet.'}
                      {sol.feedback && <><br />Feedback: {sol.feedback}</>}
                    </>
                  }
                />
                <Button
                  variant="outlined"
                  onClick={() => setGrading({ open: true, solution: sol, grade: sol.grade || '', feedback: sol.feedback || '' })}
                  sx={{ ml: 2 }}
                >
                  Evaluate
                </Button>
              </ListItem>
            ))}
          </List>
          {/* Grading Dialog */}
          <Dialog open={grading.open} onClose={() => setGrading({ ...grading, open: false })}>
            <DialogTitle>Evaluate Submission</DialogTitle>
            <DialogContent>
              <TextField
                label="Grade (0-100)"
                type="number"
                value={grading.grade}
                onChange={e => setGrading({ ...grading, grade: e.target.value })}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
                required
              />
              <TextField
                label="Feedback"
                value={grading.feedback}
                onChange={e => setGrading({ ...grading, feedback: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                minRows={2}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setGrading({ ...grading, open: false })}>Cancel</Button>
              <Button onClick={handleGrade} variant="contained" color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Lecturer: Modify/Delete buttons */}
      {canModify && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            component={Link}
            to={`/exercises/${courseId}/modify/${exerciseId}`}
            variant="contained"
            color="primary"
          >
            Modify
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Exercise?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this exercise? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await deleteExercise(exerciseId)
              setShowDeleteDialog(false)
              navigate(`/courses/${courseId}`)
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default ExerciseDetail