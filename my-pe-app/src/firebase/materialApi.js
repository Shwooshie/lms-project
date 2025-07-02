import { db } from './firebase'
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'

// Add material to a course
export async function addMaterial(data) {
  return await addDoc(collection(db, 'materials'), {
    ...data,
    dateCreated: serverTimestamp(),
  })
}

// Get material by ID
export async function getMaterial(materialId) {
  const snap = await getDoc(doc(db, 'materials', materialId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// List materials for a course
export async function listMaterials(courseId) {
  const q = query(collection(db, 'materials'), where('courseId', '==', courseId))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Update material
export async function updateMaterial(materialId, data) {
  await updateDoc(doc(db, 'materials', materialId), data)
}

// Delete material
export async function deleteMaterial(materialId) {
  await deleteDoc(doc(db, 'materials', materialId))
}