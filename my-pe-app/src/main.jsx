import './style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from './component/SnackbarProvider'

ReactDOM.createRoot(document.getElementById('app')).render(
  <BrowserRouter>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </BrowserRouter>
)
