import React, { useState } from 'react'
import { sendMessage } from '../firebase/messageApi'
import { getAuth } from 'firebase/auth'
import { listUsers, getUser } from '../firebase/userApi'
import {
  Box, Button, TextField, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText
} from '@mui/material'
import { useSnackbar } from './SnackbarProvider' // adjust path if needed

function ComposeMessage() {
  const [query, setQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [toUser, setToUser] = useState(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const auth = getAuth()
  const showMessage = useSnackbar()

  const handleSearch = async (e) => {
    setQuery(e.target.value)
    if (e.target.value.length > 1) {
      const users = await listUsers()
      const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(e.target.value.toLowerCase()) ||
        u.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setUserResults(filtered)
    } else {
      setUserResults([])
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    let recipient = toUser
    // If not selected from dropdown, try to find by email
    if (!recipient && query) {
      const users = await listUsers()
      recipient = users.find(u => u.email?.toLowerCase() === query.toLowerCase())
    }
    if (!recipient) {
      showMessage('Please select a valid recipient email.', 'error')
      return
    }
    // Fetch sender's name from Firestore
    const sender = await getUser(auth.currentUser.uid)
    await sendMessage({
      fromUserId: auth.currentUser.uid,
      fromUserName: sender?.name || '', // Use Firestore name
      toUserId: recipient.id,
      toUserEmail: recipient.email,
      toUserName: recipient.name,
      subject,
      content,
    })
    setToUser(null)
    setSubject('')
    setContent('')
    setQuery('')
    setUserResults([])
    showMessage('Message sent!', 'success')
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>New Message</Typography>
      <Box component="form" onSubmit={handleSend} sx={{ position: 'relative' }}>
        <TextField
          label="To (email)"
          value={toUser ? toUser.email : query}
          onChange={handleSearch}
          fullWidth
          margin="normal"
          autoComplete="off"
          required
        />
        {/* Recipient search dropdown */}
        {!toUser && userResults.length > 0 && (
          <List sx={{
            position: 'absolute',
            zIndex: 10,
            bgcolor: '#fff',
            boxShadow: 3,
            width: '100%', // Make dropdown match input width
            maxWidth: '100%', // Ensure it doesn't overflow
            maxHeight: 300,
            overflowY: 'auto',
            left: 0, // Align with input
            top: 70 // Adjust if needed to match input's bottom
          }}>
            {userResults.map(u => (
              <ListItem
                key={u.id}
                button
                onClick={() => { setToUser(u); setUserResults([]); }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    {u.name ? u.name[0].toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.email}
                  secondary={u.name}
                />
              </ListItem>
            ))}
          </List>
        )}
        <TextField
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Message"
          value={content}
          onChange={e => setContent(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={4}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Send
        </Button>
      </Box>
    </Paper>
  )
}

export default ComposeMessage

// filepath: my-pe-app/src/firebase/messageApi.js
export async function listMessages(userEmail) {
  const q = query(collection(db, 'messages'), where('toUserEmail', '==', userEmail))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}