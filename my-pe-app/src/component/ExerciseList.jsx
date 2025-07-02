import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listExercises } from '../firebase/exerciseApi'
import { List, ListItem, ListItemText, Button, Typography, Paper, Box } from '@mui/material'

function ExerciseList() {
  const { courseId } = useParams()
  const [exercises, setExercises] = useState([])

  useEffect(() => {
    const fetchExercises = async () => {
      setExercises(await listExercises(courseId))
    }
    fetchExercises()
  }, [courseId])

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Exercise List</Typography>
      <List>
        {exercises.map(e => (
          <ListItem key={e.id}>
            <ListItemText primary={e.name} />
            <Button
              component={Link}
              to={`/exercises/${courseId}/modify/${e.id}`}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Modify
            </Button>
            <Button
              component={Link}
              to={`/exercises/${courseId}/delete/${e.id}`}
              variant="outlined"
              color="error"
              size="small"
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        <Button
          component={Link}
          to={`/exercises/${courseId}/upload`}
          variant="contained"
          color="primary"
        >
          Upload New Exercise
        </Button>
      </Box>
    </Paper>
  )
}

export default ExerciseList