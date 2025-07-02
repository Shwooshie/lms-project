import { db } from './firebase'
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore'

// Create or update a user
export async function createOrUpdateUser(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

// Get a user by UID
export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// List all users (optionally filter by role)
export async function listUsers(role) {
  let q = collection(db, 'users')
  if (role) q = query(q, where('role', '==', role))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}