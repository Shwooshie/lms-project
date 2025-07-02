import React, { useState } from 'react'
import { sendMessage } from '../firebase/messageApi'
import { getAuth } from 'firebase/auth'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { getUser } from '../firebase/userApi'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function SendMessage() {
  const [toUserId, setToUserId] = useState('')
  const [content, setContent] = useState('')
  const auth = getAuth()
  const showMessage = useSnackbar()

  const handleSend = async (e) => {
    e.preventDefault()
    const sender = await getUser(auth.currentUser.uid)
    if (!toUserId) {
      showMessage('Please select a valid recipient email.', 'error')
      return
    }
    await sendMessage({
      fromUserId: auth.currentUser.uid,
      fromUserName: sender?.name || '',
      toUserId,
      content,
    })
    setToUserId('')
    setContent('')
    showMessage('Message sent!', 'success')
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Send Message</Typography>
      <Box component="form" onSubmit={handleSend}>
        <TextField
          label="Recipient User ID"
          value={toUserId}
          onChange={e => setToUserId(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Message"
          value={content}
          onChange={e => setContent(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Send
        </Button>
      </Box>
    </Paper>
  )
}

export default SendMessage