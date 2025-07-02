import React, { useEffect, useState } from 'react'
import { listMessages } from '../firebase/messageApi'
import { getAuth } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import {
  Paper, Typography, List, ListItem, ListItemText, Box, Button
} from '@mui/material'
import { format } from 'date-fns'

function getSnippet(text, len = 40) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '…' : text
}

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return format(ts.toDate(), 'MMM d')
}

function Inbox() {
  const [messages, setMessages] = useState([])
  const auth = getAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMessages = async () => {
      if (auth.currentUser) {
        const msgs = await listMessages({
          id: auth.currentUser.uid,
          email: auth.currentUser.email
        })
        setMessages(msgs)
      }
    }
    fetchMessages()
  }, [auth.currentUser])

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Inbox
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/compose')}
        >
          Send Message
        </Button>
      </Box>
      <List>
        {messages.map(msg => (
          <ListItem
            key={msg.id}
            button
            component={Link}
            to={`/message/${msg.id}`}
            sx={{
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              py: 1.5,
              px: 2,
              '&:hover': { background: '#f5f5f5' }
            }}
          >
            {/* Sender */}
            <Box sx={{ minWidth: 120, fontWeight: 700, color: '#1976d2', flexShrink: 0 }}>
              {msg.fromUserName || msg.fromUserId}
            </Box>
            {/* Subject and snippet */}
            <Box sx={{ flexGrow: 1, ml: 2, overflow: 'hidden' }}>
              <span style={{ fontWeight: 600 }}>{msg.subject || '(No Subject)'}</span>
              <span style={{ color: '#666', marginLeft: 8 }}>
                {getSnippet(msg.content)}
              </span>
            </Box>
            {/* Date */}
            <Box sx={{ minWidth: 70, textAlign: 'right', color: '#888', fontSize: 14, ml: 2 }}>
              {formatDate(msg.sentAt)}
            </Box>
          </ListItem>
        ))}
        {messages.length === 0 && (
          <ListItem>
            <ListItemText primary="No messages." />
          </ListItem>
        )}
      </List>
    </Paper>
  )
}

export default Inbox