const menuItems = [
    { title: "داشبورد", },
    { title: "آزمون جدید", },
    { title: "آزمون‌ها", },
    { title: "سوالات", },
    { title: "نتایج", },
];

export default function Sidebar() {
    return (
        <aside dir="rtl" className="fixed right-0 top-0 flex h-screen w-64 flex-col border-l border-slate-200 bg-white p-5">

            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-blue-900">
                    Azmoon<span className="text-yellow-600">X</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-2">
                <p className="mb-2 text-xs font-semibold text-slate-400">
                    منوی اصلی
                </p>

                {menuItems.map((item, index) => {
                    const active = index === 0;

                    return (
                        <a
                            key={item.title}
                            href="#"
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${active
                                    ? "bg-blue-50 text-yellow-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"
                                }`}
                        >
                            <span className="font-medium">{item.title}</span>
                        </a>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
                <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 hover:bg-slate-50">
                    تنظیمات
                </a>

                <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-red-500 hover:bg-red-50">
                    خروج
                </a>
            </div>
        </aside>
    );
}
