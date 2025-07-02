import React, { createContext, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

const SnackbarContext = createContext()

export function useSnackbar() {
  return useContext(SnackbarContext)
}

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <SnackbarContext.Provider value={showMessage}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}