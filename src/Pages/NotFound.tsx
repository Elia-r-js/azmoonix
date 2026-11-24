import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center"
    >
      <p className="text-7xl font-extrabold text-blue-600">۴۰۴</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">صفحه پیدا نشد</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
        آدرسی که وارد کرده‌اید وجود ندارد یا جابه‌جا شده است.
      </p>
      <div className="mt-6 flex gap-2">
        <Link
          to={user ? "/teacher" : "/"}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {user ? "بازگشت به داشبورد" : "بازگشت به صفحه اصلی"}
        </Link>
        {!user ? (
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            ورود به سامانه
          </Link>
        ) : null}
      </div>
    </main>
  );
}
