import { Navigate, Route, Routes } from "react-router-dom";
import LoginPageView from "../Pages/login/view/LoginPageView";
import HomePage from "../Pages/home/HomePage";
import ExamPage from "../Pages/exam/ExamPage";
import DashboardLayout from "../Layout/Layout";
import Dashboard from "../Pages/dashboard/dashbaord";
import CreateExam from "../Pages/new-exam/newExam";
import ResutlsOfExam from "../Pages/results/resutlsOfExam";
import SettingProfile from "../Pages/setting/settingProfile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route path="/auth/login" element={<LoginPageView />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/exam" element={<ExamPage />} />
    
          <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/exams" element={<ExamPage />} />
        {/* <Route path="/questions" element={<Questions />} /> */}
        </Route>
        <Route path="/teacher" element={<Dashboard/>}/>
        <Route path="/teacher/New-exams" element={<CreateExam/>}/>
        <Route path="/teacher/exams" element={<ExamPage/>}/>
        <Route path="/teacher/results" element={<ResutlsOfExam/>}/>
        <Route path="/teacher/settings" element={<SettingProfile/>}/>

    </Routes>
  )
}
