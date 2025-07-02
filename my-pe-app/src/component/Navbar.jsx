import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getUser } from '../firebase/userApi'
import viteLogo from '../assets/icons/LMS_real.png' // Adjust path if needed

function Navbar() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const navigate = useNavigate()

  // Check authentication state
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch user role from Firestore
        const userData = await getUser(firebaseUser.uid)
        setRole(userData?.role)
      } else {
        setUser(null)
        setRole(null)
      }
    })
    return () => unsubscribe()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await signOut(getAuth())
    setUser(null)
    setRole(null)
    navigate('/') // Redirect to home page instead of login
  }

  // Login Menu
  if (!user) {
    return (
      <AppBar position="fixed" sx={{ width: '100%', top: 0, left: 0, bgcolor: '#000', color: '#fff', boxShadow: 1 }}>
        <Container maxWidth={false} disableGutters>
          <Toolbar>
            {/* Logo and nav links */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={viteLogo} alt="Logo" style={{ height: 64, marginRight: 24 }} />
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{ textTransform: 'none', color: '#fff', fontSize: '1.15rem', fontWeight: 'bold', mx: 1 }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                sx={{ textTransform: 'none', color: '#fff', fontSize: '1.15rem', fontWeight: 'bold', mx: 1 }}
              >
                Register
              </Button>
            </Box>
            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />
            {/* Login button on far right */}
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{ textTransform: 'none', color: '#fff', fontSize: '1.15rem', fontWeight: 'bold', mx: 1 }}
            >
              Login
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
    )
  }

  // Student Menu
  if (role === 'student') {
    return (
      <AppBar position="fixed" sx={{ width: '100%', top: 0, left: 0, bgcolor: '#000', color: '#fff' }}>
        <Container maxWidth={false} disableGutters>
          <Toolbar>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '100%',
            }}>
              <Button color="inherit" component={Link} to="/courses">My Courses</Button>
              <Button color="inherit" component={Link} to="/search">Search Course</Button>
              <Button color="inherit" component={Link} to="/join-course">Join Course</Button>
              <Button color="inherit" component={Link} to="/inbox">Inbox</Button>
              <Button color="inherit" onClick={handleLogout}>Log Out</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    )
  }

  // Lecturer Menu
  if (role === 'lecturer') {
    return (
      <AppBar position="fixed" sx={{ width: '100%', top: 0, left: 0, bgcolor: '#000', color: '#fff' }}>
        <Container maxWidth={false} disableGutters>
          <Toolbar>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '100%',
            }}>
              <Button color="inherit" component={Link} to="/courses">My Courses</Button>
              <Button color="inherit" component={Link} to="/search">Search Course</Button>
              <Button color="inherit" component={Link} to="/create-course">Create New Course</Button>
              <Button color="inherit" component={Link} to="/inbox">Inbox</Button>
              <Button color="inherit" onClick={handleLogout}>Log Out</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    )
  }

  // Fallback (should not happen)
  return null
}

export default Navbar