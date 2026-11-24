import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { ExamSummary, ResultRow } from "../../lib/types";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import {
  EmptyState,
  PageHeader,
  PageLoader,
  ScoreBar,
  StatCard,
} from "../../components/ui";
import { Icon } from "../../components/Icons";
import {
  formatDate,
  formatNumber,
  formatPercent,
  isPassed,
  percentOf,
} from "../../lib/format";
import { cn } from "../../lib/utils";

type PassFilter = "all" | "pass" | "fail";

export default function TeacherResults() {
  const { user } = useAuth();
  const { push } = useToast();

  const [results, setResults] = useState<ResultRow[]>([]);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [passFilter, setPassFilter] = useState<PassFilter>("all");

  useEffect(() => {
    if (!user) return;
    let active = true;

    Promise.all([api.results.forTeacher(user.id), api.exams.listForTeacher(user.id)])
      .then(([resultData, examData]) => {
        if (!active) return;
        setResults(resultData);
        setExams(examData);
      })
      .catch((error: unknown) => {
        if (active) {
          push(
            error instanceof Error ? error.message : "دریافت نتایج ناموفق بود.",
            "error",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, push]);

  const filtered = useMemo(() => {
    const term = search.trim();
    return results.filter((row) => {
      const passed = isPassed(row.attempt.score, row.attempt.total);
      const matchesExam = examFilter === "all" || row.exam.id === examFilter;
      const matchesPass =
        passFilter === "all" || (passFilter === "pass" ? passed : !passed);
      const matchesSearch =
        term.length === 0 ||
        row.attempt.studentName.includes(term) ||
        row.attempt.studentNumber.includes(term) ||
        row.exam.title.includes(term);
      return matchesExam && matchesPass && matchesSearch;
    });
  }, [results, search, examFilter, passFilter]);

  const stats = useMemo(() => {
    const percentages = filtered.map((row) =>
      percentOf(row.attempt.score, row.attempt.total),
    );
    const passed = filtered.filter((row) =>
      isPassed(row.attempt.score, row.attempt.total),
    ).length;

    return {
      count: filtered.length,
      average:
        percentages.length === 0
          ? 0
          : percentages.reduce((sum, value) => sum + value, 0) / percentages.length,
      best: percentages.length === 0 ? 0 : Math.max(...percentages),
      passRate: filtered.length === 0 ? 0 : (passed / filtered.length) * 100,
    };
  }, [filtered]);

  const exportCsv = () => {
    if (filtered.length === 0) {
      push("نتیجه‌ای برای خروجی گرفتن وجود ندارد.", "info");
      return;
    }

    const header = [
      "نام دانشجو",
      "شماره دانشجویی",
      "نام آزمون",
      "نمره",
      "مجموع",
      "درصد",
      "وضعیت",
      "تاریخ",
    ];

    const rows = filtered.map((row) => [
      row.attempt.studentName,
      row.attempt.studentNumber,
      row.exam.title,
      String(row.attempt.score),
      String(row.attempt.total),
      String(percentOf(row.attempt.score, row.attempt.total)),
      isPassed(row.attempt.score, row.attempt.total) ? "قبول" : "مردود",
      new Date(row.attempt.submittedAt).toISOString(),
    ]);

    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [header, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "azmoonix-results.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    push("فایل نتایج دانلود شد.", "success");
  };

  if (loading) return <PageLoader label="در حال دریافت نتایج..." />;

  return (
    <div>
      <PageHeader
        title="نتایج و گزارش‌ها"
        description="عملکرد دانشجویان را بررسی کنید، بر اساس آزمون یا وضعیت فیلتر کنید و خروجی بگیرید."
        action={
          <>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Icon name="download" className="h-4 w-4" />
              خروجی CSV
            </button>
            <Link
              to="/teacher/exams"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              <Icon name="list" className="h-4 w-4" />
              مدیریت آزمون‌ها
            </Link>
          </>
        }
      />

      {results.length === 0 ? (
        <EmptyState
          icon="chart"
          title="هنوز نتیجه‌ای ثبت نشده است"
          description="پس از شرکت دانشجویان در آزمون‌های فعال، نتایج و تحلیل عملکرد آن‌ها در این بخش نمایش داده می‌شود."
          action={
            <Link
              to="/teacher/exams"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Icon name="list" className="h-4 w-4" />
              مشاهده آزمون‌ها
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="تعداد برگه‌ها"
              value={formatNumber(stats.count)}
              hint="بر اساس فیلتر فعلی"
              icon="clipboard"
              tone="blue"
            />
            <StatCard
              label="میانگین نمرات"
              value={formatPercent(stats.average)}
              hint="درصد میانگین"
              icon="chart"
              tone="amber"
            />
            <StatCard
              label="بالاترین نمره"
              value={formatPercent(stats.best)}
              hint="بهترین عملکرد"
              icon="trophy"
              tone="emerald"
            />
            <StatCard
              label="نرخ قبولی"
              value={formatPercent(stats.passRate)}
              hint="نمره ۵۰ به بالا"
              icon="check"
              tone="violet"
            />
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_auto]">
              <div className="relative">
                <Icon
                  name="search"
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجوی نام دانشجو یا آزمون..."
                  className="w-full rounded-xl border border-slate-200 py-3 pr-12 pl-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={examFilter}
                onChange={(event) => setExamFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">همه آزمون‌ها</option>
                {exams.map((item) => (
                  <option key={item.exam.id} value={item.exam.id}>
                    {item.exam.title}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "all", label: "همه" },
                    { value: "pass", label: "قبول" },
                    { value: "fail", label: "مردود" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPassFilter(item.value)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium transition",
                      passFilter === item.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-right">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-400">
                    <th className="px-5 py-3 font-medium">دانشجو</th>
                    <th className="px-4 py-3 font-medium">آزمون</th>
                    <th className="px-4 py-3 font-medium">نمره</th>
                    <th className="px-4 py-3 font-medium">درصد</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-5 py-3 font-medium">تاریخ ثبت</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const percent = percentOf(row.attempt.score, row.attempt.total);
                    const passed = isPassed(row.attempt.score, row.attempt.total);
                    return (
                      <tr
                        key={row.attempt.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {row.attempt.studentName.charAt(0)}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-700">
                                {row.attempt.studentName}
                              </p>
                              <p className="text-xs text-slate-400" dir="ltr">
                                {row.attempt.studentNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/teacher/exams/${row.exam.id}`}
                            className="text-sm text-slate-600 hover:text-blue-700"
                          >
                            {row.exam.title}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {formatNumber(row.attempt.score)}
                          <span className="text-xs font-normal text-slate-400">
                            {" "}
                            از {formatNumber(row.attempt.total)}
                          </span>
                        </td>
                        <td className="w-40 px-4 py-4">
                          <ScoreBar percent={percent} />
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-600",
                            )}
                          >
                            {passed ? "قبول" : "مردود"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {formatDate(row.attempt.submittedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                نتیجه‌ای با این فیلترها پیدا نشد.
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
