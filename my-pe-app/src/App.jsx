// App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './component/Navbar'
import Home from './component/Home'
import Register from './component/Register'
import Login from './component/Login'
import CourseList from './component/CourseList'
import CourseCreate from './component/CourseCreate'
import CourseDetail from './component/CourseDetail'
import CourseJoin from './component/CourseJoin'
import CourseSearch from './component/CourseSearch'
import CourseMaterial from './component/CourseMaterial'
import ExerciseList from './component/ExerciseList'
import ExerciseUpload from './component/ExerciseUpload'
import ExerciseModify from './component/ExerciseModify'
//import ExerciseDelete from './component/ExerciseDelete'
import SolutionSubmit from './component/SolutionSubmit'
import StudentEvaluation from './component/StudentEvaluation'
import ContactInfo from './component/ContactInfo'
import SendMessage from './component/SendMessage'
import CourseModify from './component/CourseModify'
import { Typography } from '@mui/material'
import ExerciseDetail from './component/ExerciseDetail'
import CourseMaterialDetail from './component/CourseMaterialDetail'
import CourseMaterialModify from './component/CourseMaterialModify'
import Inbox from './component/Inbox'
import ComposeMessage from './component/ComposeMessage'
import MessageDetail from './component/MessageDetail'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <Typography
              variant="h2"
              align="center"
              sx={{ color: '#000', mt: 10 }}
            >
              Welcome to LMS
            </Typography>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/create-course" element={<CourseCreate />} />
        <Route path="/join-course" element={<CourseJoin />} />
        <Route path="/search" element={<CourseSearch />} />
        <Route path="/materials/:courseId" element={<CourseMaterial />} />
        <Route path="/exercises/:courseId" element={<ExerciseList />} />
        <Route path="/exercises/:courseId/upload" element={<ExerciseUpload />} />
        <Route path="/exercises/:courseId/modify/:exerciseId" element={<ExerciseModify />} />
        <Route path="/solutions/:exerciseId/submit" element={<SolutionSubmit />} />
        <Route path="/evaluation/:solutionId" element={<StudentEvaluation />} />
        <Route path="/contact" element={<ContactInfo />} />
        <Route path="/message" element={<SendMessage />} />
        <Route path="/courses/:id/modify" element={<CourseModify />} />
        <Route path="/exercises/:courseId/detail/:exerciseId" element={<ExerciseDetail />} />
        <Route path="/materials/:courseId/detail/:materialId" element={<CourseMaterialDetail />} />
        <Route path="/materials/:courseId/modify/:materialId" element={<CourseMaterialModify />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/compose" element={<ComposeMessage />} />
        <Route path="/message/:messageId" element={<MessageDetail />} />
      </Routes>
    </>
  )
}

export default App
