import { db } from './firebase'
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy } from 'firebase/firestore'

// Log an activity (e.g., login, submit, view, etc.)
export async function logActivity(data) {
  return await addDoc(collection(db, 'activities'), {
    ...data,
    timestamp: serverTimestamp(),
  })
}

// List activities for a user
export async function listActivities(userId) {
  const q = query(collection(db, 'activities'), where('userId', '==', userId), orderBy('timestamp', 'desc'))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}