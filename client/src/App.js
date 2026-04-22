import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Teacher
import TeacherLayout from "./layouts/TeacherLayout";
import Courses from "./pages/teacher/Courses";
import TeachingSchedule from "./pages/teacher/TeachingSchedule";
import TeachingClass from "./pages/teacher/TeachingClass";
import TeachingClassDetails from "./pages/teacher/TeachingClassDetails";
import TeachingGradeDetails from "./pages/teacher/TeachingGradeDetails";

// Student
import StudentLayout from "./layouts/StudentLayout";
import StudentSchedule from "./pages/student/StudentSchedule";

import RegisterClass from "./pages/student/RegisterClass";
import MyClasses from "./pages/student/MyClasses";
import ClassDetails from "./pages/student/ClassDetails";

import StudentGrades from "./pages/student/Grades";
import GradeDetails from "./pages/student/GradeDetails";
import StudentDashboard from "./pages/student/StudentDashboard";

// Admin
import Dashboard from "./pages/admin/DashBoard";
import CourseManagement from "./pages/admin/CourseManagement";
import ClassesManagement from "./pages/admin/ClassesManagement";
import ClassForm from "./pages/admin/ClassForm";
import RoomManagement from "./pages/admin/RoomManagement";
import GradesOverview from "./pages/admin/GradesOverview";
import UserManagement from "./pages/admin/UserManagement";
import LoginPage from "./Login/Login";
import ForgotPassword from "./Login/ForgotPassword";
import ResetPassword from "./Login/ResetPassword";
import ProtectedRoute from "./Login/ProtectedRoute";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Teacher Layout */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="courses" element={<Courses />} />
          <Route path="schedule" element={<TeachingSchedule />} />
          <Route path="classes" element={<TeachingClass />} />
          <Route
            path=":teacherId/classes/:classId"
            element={<TeachingClassDetails />}
          />
          <Route
            path="grades/class/:classId/student/:studentId"
            element={<TeachingGradeDetails />}
          />
        </Route>

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <CourseManagement />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute>
              <ClassesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/add"
          element={
            <ProtectedRoute>
              <ClassForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/edit/:id"
          element={
            <ProtectedRoute>
              <ClassForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <RoomManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/grades"
          element={
            <ProtectedRoute>
              <GradesOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Student Layout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="my-classes" element={<MyClasses />} />
          <Route path="register-class" element={<RegisterClass />} />
          <Route path="my-classes/:classId" element={<ClassDetails />} />

          <Route path="grade" element={<StudentGrades />} />
          <Route path="grade/:classId" element={<GradeDetails />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
