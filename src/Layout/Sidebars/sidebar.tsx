import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
    { title: "داشبورد", path: "/teacher" },
    { title: "آزمون جدید", path: "/teacher/New-exams" },
    { title: "مدیریت آزمون‌ها", path: "/teacher/exams" },
    { title: "نتایج", path: "/teacher/results" },
];

export default function Sidebar() {
    const Navigation = useNavigate()

    const quit = () => {
        Navigation("/")
    }
    const home = () => {
        Navigation("/home")
    }
    return (
        <aside dir="rtl" className="fixed right-0 top-0 flex h-screen w-64 flex-col border-l border-slate-200 bg-white p-5">

            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
                <a onClick={home} className="text-2xl font-bold text-blue-900 cursor-pointer">
                    Azmoon<span className="text-yellow-600">X</span>
                </a>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-2">
                <p className="mb-2 text-xs font-semibold text-slate-400">
                    منوی اصلی
                </p>

                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/teacher"}
                        className={({ isActive }) =>
                            `rounded-xl px-4 py-3 transition-colors ${isActive
                                ? "bg-blue-50 text-yellow-700 font-semibold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"
                            }`
                        }
                    >
                        {item.title}
                    </NavLink>
                ))}
            </nav>
            {/* Bottom */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
                <NavLink
                    to="/teacher/settings"
                    className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 transition-colors ${isActive
                            ? "bg-blue-50 text-yellow-700 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"
                        }`
                    }
                >
                    تنظیمات
                </NavLink>

                <a onClick={quit} href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-red-500 hover:bg-red-50">
                    خروج
                </a>
            </div>
        </aside>
    );
}
