
import { Link } from "react-router-dom";

const stats = [
  { title: "کل آزمون‌ها", value: "۱۲", color: "text-blue-600" },
  { title: "آزمون‌های فعال", value: "۸", color: "text-green-600" },
  { title: "شرکت‌کنندگان", value: "۲۴۸", color: "text-purple-600" },
  { title: "آزمون‌های تکمیل‌شده", value: "۱۸۵", color: "text-orange-600" },
];

const exams = [
  { title: "آزمون ساختمان داده", date: "۱۴۰۵/۰۸/۲۵", status: "فعال" },
  { title: "آزمون برنامه‌نویسی", date: "۱۴۰۵/۰۸/۲۰", status: "پایان‌یافته" },
  { title: "آزمون ریاضی", date: "۱۴۰۵/۰۸/۱۸", status: "پیش‌نویس" },
];

export default function Dashboard() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            داشبورد
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            به پنل مدیریت آزمون‌های خود خوش آمدید.
          </p>
        </div>

        <Link
          to="/teacher/New-exams"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + ایجاد آزمون جدید
        </Link>
      </div>

      {/* Welcome */}
      <div className="mb-8 rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 p-6 text-white">
        <h2 className="text-xl font-bold">
          سلام، استاد عزیز 👋
        </h2>
        <p className="mt-2 text-sm text-blue-100">
          از این قسمت می‌توانید آزمون‌ها و عملکرد دانشجویان را مدیریت کنید.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {item.title}
            </p>
            <h3 className={`mt-3 text-3xl font-bold ${item.color}`}>
              {item.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Exams */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            آخرین آزمون‌ها
          </h2>
          <Link
            to="/teacher/exams"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            مشاهده همه
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-right">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-400">
                <th className="pb-4 font-medium">نام آزمون</th>
                <th className="pb-4 font-medium">تاریخ</th>
                <th className="pb-4 font-medium">وضعیت</th>
              </tr>
            </thead>

            <tbody>
              {exams.map((exam) => (
                <tr
                  key={exam.title}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-5 font-medium text-slate-700">
                    {exam.title}
                  </td>
                  <td className="py-5 text-sm text-slate-500">
                    {exam.date}
                  </td>
                  <td className="py-5">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {exam.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
