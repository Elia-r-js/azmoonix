
import { useState } from "react";
import { Link } from "react-router-dom";

const exams = [
  {
    id: 1,
    title: "آزمون ساختمان داده",
    subject: "مهندسی کامپیوتر",
    questions: 20,
    participants: 35,
    date: "۱۴۰۵/۰۸/۲۵",
    status: "فعال",
  },
  {
    id: 2,
    title: "آزمون برنامه‌نویسی",
    subject: "برنامه‌نویسی",
    questions: 15,
    participants: 42,
    date: "۱۴۰۵/۰۸/۲۰",
    status: "پایان‌یافته",
  },
  {
    id: 3,
    title: "آزمون ریاضی",
    subject: "ریاضی عمومی",
    questions: 25,
    participants: 0,
    date: "۱۴۰۵/۰۸/۱۸",
    status: "پیش‌نویس",
  },
];

const filters = ["همه", "فعال", "پایان‌یافته", "پیش‌نویس"];

export default function ExamManager() {
  const [activeFilter, setActiveFilter] = useState("همه");
  const [search, setSearch] = useState("");

  const filteredExams = exams.filter((exam) => {
    const matchesFilter =
      activeFilter === "همه" || exam.status === activeFilter;

    const matchesSearch = exam.title.includes(search);

    return matchesFilter && matchesSearch;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            مدیریت آزمون‌ها
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            تمام آزمون‌های خود را مدیریت کنید.
          </p>
        </div>

        <Link
          to="/teacher/New-exams"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + ایجاد آزمون جدید
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام آزمون..."
          className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 font-bold text-slate-800">
          فهرست آزمون‌ها
        </h2>

        <table className="w-full min-w-[750px] text-right">
          <thead>
            <tr className="border-b text-sm text-slate-400">
              <th className="p-4">نام آزمون</th>
              <th className="p-4">تعداد سؤالات</th>
              <th className="p-4">شرکت‌کنندگان</th>
              <th className="p-4">تاریخ</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {filteredExams.map((exam) => (
              <tr key={exam.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-semibold text-slate-700">
                    {exam.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {exam.subject}
                  </p>
                </td>

                <td className="p-4 text-sm text-slate-600">
                  {exam.questions}
                </td>

                <td className="p-4 text-sm text-slate-600">
                  {exam.participants}
                </td>

                <td className="p-4 text-sm text-slate-500">
                  {exam.date}
                </td>

                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    exam.status === "فعال"
                      ? "bg-green-50 text-green-700"
                      : exam.status === "پایان‌یافته"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-orange-50 text-orange-700"
                  }`}>
                    {exam.status}
                  </span>
                </td>

                <td className="p-4">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    مشاهده
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredExams.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            آزمونی پیدا نشد.
          </p>
        )}
      </div>
    </div>
  );
}
