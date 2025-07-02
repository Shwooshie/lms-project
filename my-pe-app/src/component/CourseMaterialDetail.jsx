import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMaterial, deleteMaterial } from '../firebase/materialApi'
import { getAuth } from 'firebase/auth'
import { getUser } from '../firebase/userApi'
import { Paper, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useSnackbar } from './SnackbarProvider'

function CourseMaterialDetail() {
  const { courseId, materialId } = useParams()
  const [material, setMaterial] = useState(null)
  const [role, setRole] = useState(null)
  const [canModify, setCanModify] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const navigate = useNavigate()
  const showMessage = useSnackbar()

  useEffect(() => {
    const fetchData = async () => {
      const mat = await getMaterial(materialId)
      setMaterial(mat)
      const auth = getAuth()
      if (auth.currentUser) {
        const userData = await getUser(auth.currentUser.uid)
        setRole(userData?.role)
        setCanModify(userData?.role === 'lecturer' && mat.uploadedBy === auth.currentUser.uid)
      }
    }
    fetchData()
  }, [materialId])

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    await deleteMaterial(materialId)
    showMessage('Material deleted!', 'success')
    setShowDeleteDialog(false)
    navigate(`/courses/${courseId}`)
  }

  if (!material) return <div>Loading...</div>

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, mx: 'auto', mt: 6, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" mb={2}>{material.name}</Typography>
      <Typography variant="subtitle1" mb={2}>
        Course: {material.courseName || courseId}
      </Typography>
      {material.file && (
        <Box mb={3}>
          <Button
            variant="outlined"
            href={material.file}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Attachment
          </Button>
        </Box>
      )}
      {canModify && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            component={Link}
            to={`/materials/${courseId}/modify/${materialId}`}
            variant="contained"
            color="primary"
          >
            Modify
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Box>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Material?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this material? This action cannot be undone.
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
  )
}

export default CourseMaterialDetail