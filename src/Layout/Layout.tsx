import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebars/sidebar"; 
import Header from "./Header/header"; 

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="mr-64">
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}