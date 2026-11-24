import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "./ui";
import { useAuth } from "../context/useAuth";
import type { Role } from "../lib/types";

export default function ProtectedRoute({ role }: { role: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageLoader label="در حال بررسی دسترسی..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}
