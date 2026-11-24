import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { Icon } from "../../components/Icons";
import type { IconName } from "../../components/Icons";
import { cn } from "../../lib/utils";

interface MenuItem {
  title: string;
  path: string;
  icon: IconName;
  end?: boolean;
}

const teacherMenu: MenuItem[] = [
  { title: "داشبورد", path: "/teacher", icon: "dashboard", end: true },
  { title: "آزمون جدید", path: "/teacher/exams/new", icon: "plus", end: true },
  { title: "مدیریت آزمون‌ها", path: "/teacher/exams", icon: "list" },
  { title: "نتایج", path: "/teacher/results", icon: "chart" },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = teacherMenu;
  const homePath = "/teacher";

  const isItemActive = (item: MenuItem) => {
    if (item.end) return pathname === item.path;
    if (item.path === "/teacher/exams") {
      return (
        pathname === item.path ||
        (pathname.startsWith(`${item.path}/`) &&
          !pathname.startsWith("/teacher/exams/new"))
      );
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    push("با موفقیت از سامانه خارج شدید.", "info");
    navigate("/login", { replace: true });
  };

  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
      isActive
        ? "bg-blue-50 font-semibold text-blue-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-blue-700",
    );

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-72 flex-col border-l border-slate-200 bg-white p-5 transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(homePath);
            }}
            className="text-right"
          >
            <span className="block text-2xl font-extrabold tracking-tight text-blue-900">
              Azmoon<span className="text-amber-500">ix</span>
            </span>
            <span className="mt-1 block text-[11px] text-slate-400">
              سامانه برگزاری آزمون آنلاین
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 md:hidden"
            aria-label="بستن منو"
          >
            <Icon name="close" />
          </button>
        </div>

        {user ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {user.name.trim().charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">{user.name}</p>
              <p className="truncate text-xs text-slate-400">استاد</p>
            </div>
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
          <p className="mb-1 px-1 text-xs font-semibold text-slate-400">منوی اصلی</p>

          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={() => linkClass(isItemActive(item))}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <NavLink
            to="/teacher/settings"
            onClick={onClose}
            className={({ isActive }) => linkClass(isActive)}
          >
            <Icon name="settings" className="h-5 w-5" />
            <span>تنظیمات</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rose-500 transition hover:bg-rose-50"
          >
            <Icon name="logout" className="h-5 w-5" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>
    </>
  );
}
