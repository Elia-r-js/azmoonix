import { Navigate, Route, Routes } from "react-router-dom";
import LoginPageView from "../Pages/login/view/LoginPageView";
import HomePage from "../Pages/home/HomePage";
import ExamPage from "../Pages/exam/ExamPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route path="/auth/login" element={<LoginPageView />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/exam" element={<ExamPage />} />
    </Routes>
  )
}
