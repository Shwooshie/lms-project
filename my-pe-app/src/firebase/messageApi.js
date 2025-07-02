import { db } from './firebase'
import { collection, doc, addDoc, getDocs, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'

// Send a message
export async function sendMessage(data) {
  return await addDoc(collection(db, 'messages'), {
    ...data,
    sentAt: serverTimestamp(),
  })
}

// List messages sent to a user
export async function listMessages(user) {
  // user: { id, email }
  const q = query(
    collection(db, 'messages'),
    where('toUserId', '==', user.id)
  )
  const q2 = query(
    collection(db, 'messages'),
    where('toUserEmail', '==', user.email)
  )
  const [qs1, qs2] = await Promise.all([getDocs(q), getDocs(q2)])
  // Merge and deduplicate
  const all = [...qs1.docs, ...qs2.docs]
  const seen = new Set()
  return all
    .filter(doc => {
      if (seen.has(doc.id)) return false
      seen.add(doc.id)
      return true
    })
    .map(doc => ({ id: doc.id, ...doc.data() }))
}

// List messages sent from a user
export async function listSentMessages(userId) {
  const q = query(collection(db, 'messages'), where('fromUserId', '==', userId))
  const qs = await getDocs(q)
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Delete a message
export async function deleteMessage(messageId) {
  await deleteDoc(doc(db, 'messages', messageId))
}