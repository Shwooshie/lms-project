import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { deleteMessage } from '../firebase/messageApi'
import { Paper, Typography, Box, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import { format } from 'date-fns'
import { useSnackbar } from './SnackbarProvider'

function MessageDetail() {
  const { messageId } = useParams()
  const [message, setMessage] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const navigate = useNavigate()
  const showMessage = useSnackbar()

  useEffect(() => {
    const fetchMessage = async () => {
      const snap = await getDoc(doc(db, 'messages', messageId))
      if (snap.exists()) {
        setMessage({ id: snap.id, ...snap.data() })
      }
    }
    fetchMessage()
  }, [messageId])

  const handleDelete = () => setShowDeleteDialog(true)
  const confirmDelete = async () => {
    await deleteMessage(messageId)
    showMessage('Message deleted!', 'success')
    setShowDeleteDialog(false)
    navigate('/inbox')
  }

  if (!message) return <div>Loading...</div>

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4, position: 'relative' }}>
        {/* Top bar with Back and Delete */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/inbox')}
            sx={{ mb: 0 }}
          >
            Back to Inbox
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ mb: 0 }}
          >
            Delete
          </Button>
        </Box>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {message.subject || '(No Subject)'}
        </Typography>
        <Box sx={{ mb: 2, color: '#555' }}>
          <Typography variant="subtitle1">
            <strong>From:</strong> {message.fromUserName || message.fromUserId} ({message.fromUserEmail || ''})
          </Typography>
          <Typography variant="subtitle1">
            <strong>To:</strong> {message.toUserName || message.toUserEmail || message.toUserId}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#888' }}>
            {message.sentAt?.toDate ? format(message.sentAt.toDate(), 'EEEE, d MMMM yyyy, h:mm a') : ''}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-line', fontSize: 18 }}
        >
          {message.content}
        </Typography>
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Delete Message?</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  )
}

export default MessageDetail