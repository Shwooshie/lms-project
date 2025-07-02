import React, { useState } from 'react'
import { listUsers } from '../firebase/userApi'
import { Button, List, ListItem, ListItemText, Typography, Paper } from '@mui/material'

function ContactInfo() {
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    const us = await listUsers()
    setUsers(us)
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Contact Information</Typography>
      <Button variant="contained" color="primary" onClick={fetchUsers} sx={{ mb: 2 }}>
        Load Contacts
      </Button>
      <List>
        {users.map((u, i) => (
          <ListItem key={i}>
            <ListItemText primary={`${u.name} (${u.role})`} secondary={u.email} />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default ContactInfo