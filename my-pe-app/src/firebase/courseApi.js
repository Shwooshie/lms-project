import { db } from './firebase'
import { collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where, arrayUnion, arrayRemove } from 'firebase/firestore'

// Generate a random 6-letter string
function randomCourseId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a unique course ID (not in use)
export async function generateUniqueCourseId() {
  let id
  let exists = true
  while (exists) {
    id = randomCourseId()
    const docRef = doc(db, 'courses', id)
    const docSnap = await getDoc(docRef)
    exists = docSnap.exists()
  }
  return id
}

// Create a new course with a custom ID
export async function createCourse(data) {
  const courseId = await generateUniqueCourseId()
  await setDoc(doc(db, 'courses', courseId), {
    ...data,
    students: [], // <-- use students, not studentIds
    createdAt: serverTimestamp(),
  })
  return courseId
}

// Get a course by ID
export async function getCourse(courseId) {
  const snap = await getDoc(doc(db, 'courses', courseId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// List all courses (optionally filter by lecturer or student)
export async function listCourses({ lecturerId, studentId } = {}) {
  let q = collection(db, 'courses')
  if (lecturerId) q = query(q, where('lecturerId', '==', lecturerId))
  const qs = await getDocs(q)
  let courses = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  if (studentId) {
    courses = courses.filter(course =>
      Array.isArray(course.students) &&
      course.students.some(s => s.id === studentId)
    )
  }
  return courses
}

// Update a course
export async function updateCourse(courseId, data) {
  await updateDoc(doc(db, 'courses', courseId), data)
}

// Delete a course
export async function deleteCourse(courseId) {
  await deleteDoc(doc(db, 'courses', courseId))
}

// Enroll a student in a course (store id, name, email)
export async function enrollStudent(courseId, student) {
  // student: { id, name, email }
  await updateDoc(doc(db, 'courses', courseId), {
    students: arrayUnion(student),
  });
}

// Remove a student from a course by id
export async function unenrollStudent(courseId, studentId) {
  const courseSnap = await getDoc(doc(db, 'courses', courseId))
  if (!courseSnap.exists()) return
  const course = courseSnap.data()
  if (!course.students) return
  const studentObj = course.students.find(s => s.id === studentId)
  if (!studentObj) return
  await updateDoc(doc(db, 'courses', courseId), {
    students: arrayRemove(studentObj),
  })
}

// Search courses by name (case-insensitive, prefix match)
export async function searchCoursesByName(name) {
  // Firestore doesn't support case-insensitive search natively.
  // This will do a prefix search (case-sensitive).
  const q = query(
    collection(db, 'courses'),
    where('name', '>=', name),
    where('name', '<=', name + '\uf8ff')
  );
  const qs = await getDocs(q);
  return qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get course details and materials by courseId
export async function getCourseWithMaterials(courseId) {
  const courseSnap = await getDoc(doc(db, 'courses', courseId))
  if (!courseSnap.exists()) return null
  const course = { id: courseSnap.id, ...courseSnap.data() }

  const materialsSnap = await getDocs(collection(db, 'materials'))
  const materials = materialsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(m => m.courseId === courseId)

  return { course, materials }
}

// Duplicate course and its materials
export async function duplicateCourseAndMaterials(sourceCourseId, newCourseData, lecturerId) {
  // 1. Get source course and materials
  const { course, materials } = await getCourseWithMaterials(sourceCourseId)
  if (!course) throw new Error('Source course not found')

  // 2. Create new course
  const newCourseRef = await addDoc(collection(db, 'courses'), {
    ...newCourseData,
    lecturerId,
    students: [], // <-- use students, not studentIds
    createdAt: serverTimestamp(),
  })
  const newCourseId = newCourseRef.id

  // 3. Duplicate materials
  for (const material of materials) {
    const { id, ...materialData } = material // Remove id field
    await addDoc(collection(db, 'materials'), {
      ...materialData,
      courseId: newCourseId,
      uploadedBy: lecturerId,
      dateCreated: serverTimestamp()
    })
  }

  return newCourseId
}