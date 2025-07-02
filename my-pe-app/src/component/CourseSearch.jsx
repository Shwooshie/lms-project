import React, { useState } from 'react'
import { searchCoursesByName } from '../firebase/courseApi'
import { Link } from 'react-router-dom'
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, Paper } from '@mui/material'

function CourseSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    setResults(await searchCoursesByName(query))
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Search Course</Typography>
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
        <TextField
          label="Course name"
          value={query}
          onChange={e => setQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Search
        </Button>
      </Box>
      <List>
        {results.map(course => (
          <ListItem key={course.id} component={Link} to={`/courses/${course.id}`} button>
            <ListItemText primary={course.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default CourseSearch