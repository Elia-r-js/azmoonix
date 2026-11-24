import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../Layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { PageLoader } from "../components/ui";
import { useAuth } from "../context/useAuth";

import HomePage from "../Pages/home/HomePage";
import LoginPage from "../Pages/login/Loginpage";
import NotFound from "../Pages/NotFound";

import TeacherDashboard from "../Pages/dashboard/dashbaord";
import ExamManagerPage from "../Pages/exam/ExamPage";
import TeacherExamDetail from "../Pages/exam/TeacherExamDetail";
import CreateExam from "../Pages/new-exam/newExam";
import TeacherResults from "../Pages/results/resutlsOfExam";
import PublicExamPage from "../Pages/public/PublicExamPage";
import SettingProfile from "../Pages/setting/settingProfile";

function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/teacher" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/e/:token" element={<PublicExamPage />} />
      <Route path="/auth/login" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="/exam" element={<RoleRedirect />} />
      <Route path="/exams" element={<RoleRedirect />} />
      <Route path="/student/*" element={<Navigate to="/" replace />} />

      <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
        <Route element={<Layout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="exams" element={<ExamManagerPage />} />
          <Route path="exams/new" element={<CreateExam />} />
          <Route path="exams/:examId" element={<TeacherExamDetail />} />
          <Route path="exams/:examId/edit" element={<CreateExam />} />
          <Route path="results" element={<TeacherResults />} />
          <Route path="settings" element={<SettingProfile />} />
          <Route
            path="New-exams"
            element={<Navigate to="/teacher/exams/new" replace />}
          />
          <Route
            path="new-exam"
            element={<Navigate to="/teacher/exams/new" replace />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
