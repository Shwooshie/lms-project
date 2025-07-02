import { db } from './firebase'
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'

// Submit a solution for an exercise
export async function submitSolution(data) {
  return await addDoc(collection(db, 'solutions'), {
    ...data,
    dateCreated: serverTimestamp(),
  })
}

// Get solution by ID
export async function getSolution(solutionId) {
  const snap = await getDoc(doc(db, 'solutions', solutionId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// List solutions for an exercise
export async function listSolutions(exerciseId) {
  const q = query(collection(db, 'solutions'), where('exerciseId', '==', exerciseId))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// List solutions by student
export async function listStudentSolutions(studentId) {
  const q = query(collection(db, 'solutions'), where('studentId', '==', studentId))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Grade a solution
export async function gradeSolution(solutionId, grade, feedback) {
  await updateDoc(doc(db, 'solutions', solutionId), { grade, feedback })
}

// Delete a solution
export async function deleteSolution(solutionId) {
  await deleteDoc(doc(db, 'solutions', solutionId))
}