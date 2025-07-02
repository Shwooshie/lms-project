import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import bgImage from '../assets/icons/LMS_real.png' // Use your image or remove if not needed

function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: 8, // To avoid overlap with fixed navbar
      }}
    >
      <Paper elevation={6} sx={{ p: 5, bgcolor: 'rgba(255,255,255,0.85)', maxWidth: 600 }}>
        <Typography variant="h2" gutterBottom sx={{ color: '#000' }}>
          Welcome to LMS
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage courses, materials, exercises, and communication all in one place.<br />
          Please login or register to get started.
        </Typography>
      </Paper>
    </Box>
  )
}

export default Home