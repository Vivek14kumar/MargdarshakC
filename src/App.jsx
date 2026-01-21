import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtected from "./components/UserProtected";

/* Layouts */
import StudentLayout from "./layout/StudentLayout";
import DashboardLayout from "./layout/DashboardLayout";

/* Public Pages */
import Home from "./pages/Home";
import About from "./pages/About";
import CoursesPage from "./pages/CoursesPage";
import CourseDetail from "./pages/CourseDetail";
import Contact from "./pages/Contact";

/* Auth Pages */
import Login from "./pages/auth/LoginPage";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminSignup from "./pages/auth/AdminSignup";
import VerifyEmail from "./pages/auth/VerifyEmail";

/* Admin Pages */
import DashboardHome from "./pages/admin/DashboardHome";
import AddCourseForm from "./pages/admin/AddCourse";
import UploadPhoto from "./pages/admin/UploadPhoto";
import UploadPDF from "./pages/admin/UploadNotes";
import UploadResultsForm from "./pages/admin/UploadResultsForm";

/* User Dashboard Pages */
import UserDashboard from "./pages/user/UserDashboard";
import StudentCourses from "./pages/user/StudentCourses";
import StudentNotes from "./pages/user/StudentNotes";
import StudentResults from "./pages/user/StudentResults";
import StudentProfile from "./pages/user/StudentProfile";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* ================= PUBLIC WEBSITE ================= */}
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-secret-signup" element={<AdminSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* ================= ADMIN DASHBOARD ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="add-course" element={<AddCourseForm />} />
          <Route path="upload-photo" element={<UploadPhoto />} />
          <Route path="upload-pdf" element={<UploadPDF sheetName="pdfs" />} />
          <Route path="upload-result" element={<UploadResultsForm />} />
        </Route>

        {/* ================= STUDENT ================= */}
<Route path="/student">
  <Route index element={<Navigate to="dashboard" replace />} />

  <Route
    path="dashboard"
    element={
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="courses"
    element={
      <ProtectedRoute>
        <StudentCourses />
      </ProtectedRoute>
    }
  />

  <Route
    path="notes"
    element={
      <ProtectedRoute>
        <StudentNotes />
      </ProtectedRoute>
    }
  />

  <Route
    path="results"
    element={
      <ProtectedRoute>
        <StudentResults />
      </ProtectedRoute>
    }
  />

  <Route
    path="profile"
    element={
      <ProtectedRoute>
        <StudentProfile />
      </ProtectedRoute>
    }
  />
</Route>

<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />

        {/* ========= BACKWARD COMPAT ========= 
        <Route path="/dashboard/*" element={<Navigate to="/student/dashboard" replace />} />
*/}
      </Routes>
    </BrowserRouter>
  );
}
