import React, { useEffect, useState } from 'react'
import { listCourses } from '../firebase/courseApi'
import { Link } from 'react-router-dom'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  Box
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getUser } from '../firebase/userApi'

function stringToColor(string) {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }
  return color
}

function CourseList() {
  const [courses, setCourses] = useState([])
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserId(firebaseUser.uid)
        const userData = await getUser(firebaseUser.uid)
        setRole(userData?.role)
        // Fetch courses based on role
        if (userData?.role === 'student') {
          const cs = await listCourses({ studentId: firebaseUser.uid })
          setCourses(cs)
        } else if (userData?.role === 'lecturer') {
          const cs = await listCourses({ lecturerId: firebaseUser.uid })
          setCourses(cs)
        } else {
          const cs = await listCourses()
          setCourses(cs)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <Box sx={{ p: 4, bgcolor: '#fff', minHeight: '100vh', mt: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {courses.map(course => (
          <Grid item key={course.id} xs={12} sm={6} md={3}>
            <Card
              sx={{
                width: 370,
                height: 340,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                boxShadow: 4,
                bgcolor: '#fff'
              }}
            >
              <Box
                sx={{
                  height: 100,
                  bgcolor: stringToColor(course.name),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 3,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  position: 'relative'
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: stringToColor(course.lecturerName || 'L'),
                    fontSize: 40,
                    border: '3px solid #fff',
                    position: 'absolute',
                    bottom: -40,
                    right: 24,
                  }}
                >
                  {(course.lecturerName || 'L')[0]}
                </Avatar>
              </Box>
              <CardContent sx={{ flexGrow: 1, mt: 6 }}>
                <Typography gutterBottom variant="h5" component="div" noWrap>
                  {course.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" noWrap>
                  {course.lecturerName || ''}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pb: 2, px: 2 }}>
                <Button
                  component={Link}
                  to={`/courses/${course.id}`}
                  variant="contained"
                  size="small"
                  endIcon={<FolderOpenIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default CourseList