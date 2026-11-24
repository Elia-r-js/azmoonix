import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { Icon } from "../../components/Icons";

const titles: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (path) => path === "/teacher", title: "داشبورد" },
  { match: (path) => path.startsWith("/teacher/exams/new"), title: "ایجاد آزمون" },
  { match: (path) => path.endsWith("/edit"), title: "ویرایش آزمون" },
  { match: (path) => path.startsWith("/teacher/exams/"), title: "جزئیات آزمون" },
  { match: (path) => path.startsWith("/teacher/exams"), title: "مدیریت آزمون‌ها" },
  { match: (path) => path.startsWith("/teacher/results"), title: "نتایج آزمون‌ها" },
  { match: (path) => path.includes("settings"), title: "تنظیمات حساب" },
];

export default function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const title =
    titles.find((item) => item.match(location.pathname))?.title ?? "آزمون‌ایکس";

  const handleLogout = async () => {
    await logout();
    push("با موفقیت از سامانه خارج شدید.", "info");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const roleLabel = "پنل استاد";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
          aria-label="باز کردن منو"
        >
          <Icon name="menu" />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-slate-400">{roleLabel}</p>
          <h2 className="truncate text-sm font-bold text-slate-800">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/teacher/settings"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 sm:flex"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {user.name.trim().charAt(0)}
          </span>
          <span className="max-w-32 truncate font-medium">{user.name}</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
        >
          <Icon name="logout" className="h-4 w-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
