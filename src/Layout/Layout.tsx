
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebars/sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen md:mr-64">
        <Outlet />
      </main>
    </div>
  );
}
