
import { useState } from "react";

const results = [
  {
    id: 1,
    student: "علی محمدی",
    exam: "آزمون ساختمان داده",
    score: 18,
    date: "۱۴۰۵/۰۸/۲۵",
  },
  {
    id: 2,
    student: "رضا احمدی",
    exam: "آزمون ساختمان داده",
    score: 14,
    date: "۱۴۰۵/۰۸/۲۵",
  },
  {
    id: 3,
    student: "سارا کریمی",
    exam: "آزمون برنامه‌نویسی",
    score: 19,
    date: "۱۴۰۵/۰۸/۲۴",
  },
  {
    id: 4,
    student: "مهدی رضایی",
    exam: "آزمون برنامه‌نویسی",
    score: 9,
    date: "۱۴۰۵/۰۸/۲۴",
  },
];

export default function ResultsPage() {
  const [search, setSearch] = useState("");

  const filteredResults = results.filter((result) =>
    result.student.includes(search)
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          نتایج و گزارش‌ها
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          عملکرد دانشجویان و نتایج آزمون‌ها را بررسی کنید.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "تعداد شرکت‌کنندگان", value: "۷۷" },
          { title: "میانگین نمرات", value: "۱۵.۲" },
          { title: "بالاترین نمره", value: "۱۹" },
          { title: "نرخ قبولی", value: "۸۲٪" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-800">
          تحلیل عملکرد دانشجویان
        </h2>
        <div className="flex h-44 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
          نمودار تحلیل نمرات در مرحله بعد اضافه می‌شود.
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-bold text-slate-800">
            لیست نتایج دانشجویان
          </h2>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام دانشجو..."
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <table className="w-full min-w-[650px] text-right">
          <thead>
            <tr className="border-b text-sm text-slate-400">
              <th className="p-4">نام دانشجو</th>
              <th className="p-4">نام آزمون</th>
              <th className="p-4">نمره</th>
              <th className="p-4">تاریخ</th>
              <th className="p-4">وضعیت</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((result) => (
              <tr key={result.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700">
                  {result.student}
                </td>

                <td className="p-4 text-sm text-slate-600">
                  {result.exam}
                </td>

                <td className="p-4 font-semibold text-blue-600">
                  {result.score}/20
                </td>

                <td className="p-4 text-sm text-slate-500">
                  {result.date}
                </td>

                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    result.score >= 10
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}>
                    {result.score >= 10 ? "قبول" : "مردود"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResults.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            نتیجه‌ای پیدا نشد.
          </p>
        )}
      </div>
    </div>
  );
}
