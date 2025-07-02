import { db } from './firebase'
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'

// Add exercise to a course
export async function addExercise(data) {
  return await addDoc(collection(db, 'exercises'), {
    ...data,
    dateCreated: serverTimestamp(),
  })
}

// Get exercise by ID
export async function getExercise(exerciseId) {
  const snap = await getDoc(doc(db, 'exercises', exerciseId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// List exercises for a course
export async function listExercises(courseId) {
  const q = query(collection(db, 'exercises'), where('courseId', '==', courseId))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Update exercise
export async function updateExercise(exerciseId, data) {
  await updateDoc(doc(db, 'exercises', exerciseId), data)
}

// Delete exercise
export async function deleteExercise(exerciseId) {
  await deleteDoc(doc(db, 'exercises', exerciseId))
}