import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { TeacherStats } from "../../lib/types";
import { useAuth } from "../../context/useAuth";
import {
  EmptyState,
  PageHeader,
  PageLoader,
  ScoreBar,
  StatCard,
  StatusBadge,
} from "../../components/ui";
import { Icon } from "../../components/Icons";
import { formatDate, formatNumber, formatPercent } from "../../lib/format";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;

    api.stats
      .teacher(user.id)
      .then((result) => {
        if (active) {
          setStats(result);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "دریافت اطلاعات ناموفق بود.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return null;
  if (loading) return <PageLoader />;

  if (error || !stats) {
    return (
      <EmptyState
        icon="alert"
        title="بارگذاری داشبورد ناموفق بود"
        description={error || "لطفاً دوباره تلاش کنید."}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="داشبورد"
        description="به پنل مدیریت آزمون‌های خود خوش آمدید. وضعیت آزمون‌ها و عملکرد دانشجویان را از اینجا پیگیری کنید."
        action={
          <>
            <Link
              to="/teacher/exams/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              <Icon name="plus" className="h-4 w-4" />
              ایجاد آزمون جدید
            </Link>
            <Link
              to="/teacher/results"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Icon name="chart" className="h-4 w-4" />
              گزارش نتایج
            </Link>
          </>
        }
      />

      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-l from-blue-800 via-blue-700 to-sky-600 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-blue-100">خوش آمدید</p>
            <h2 className="mt-1 text-2xl font-extrabold">{user.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              {stats.activeExams > 0
                ? `${formatNumber(stats.activeExams)} آزمون فعال دارید و ${formatNumber(
                    stats.attempts,
                  )} پاسخ ثبت شده است.`
                : "در حال حاضر آزمون فعالی ندارید. یک آزمون جدید بسازید و آن را منتشر کنید."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-6 py-5 backdrop-blur">
            <p className="text-xs text-blue-100">میانگین درصد نمرات</p>
            <p className="mt-2 text-3xl font-extrabold">
              {formatPercent(stats.averagePercent)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="کل آزمون‌ها"
          value={formatNumber(stats.totalExams)}
          hint="آزمون‌های ساخته‌شده"
          icon="list"
          tone="blue"
        />
        <StatCard
          label="آزمون‌های فعال"
          value={formatNumber(stats.activeExams)}
          hint={`${formatNumber(stats.draftExams)} پیش‌نویس منتشرنشده`}
          icon="play"
          tone="emerald"
        />
        <StatCard
          label="شرکت‌کنندگان"
          value={formatNumber(stats.participants)}
          hint="دانشجویان یکتا"
          icon="user"
          tone="violet"
        />
        <StatCard
          label="پاسخ‌های ثبت‌شده"
          value={formatNumber(stats.attempts)}
          hint="برگه‌های تصحیح‌شده"
          icon="clipboard"
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">آخرین آزمون‌ها</h2>
              <p className="mt-1 text-xs text-slate-400">
                پنج آزمون اخیر شما و وضعیت شرکت‌کنندگان
              </p>
            </div>
            <Link
              to="/teacher/exams"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              مشاهده همه
              <Icon name="arrowLeft" className="h-4 w-4" />
            </Link>
          </div>

          {stats.recentExams.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="هنوز آزمونی نساخته‌اید"
                description="اولین آزمون خود را بسازید تا آمار و نتایج اینجا نمایش داده شود."
                action={
                  <Link
                    to="/teacher/exams/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    ایجاد آزمون
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="px-6 py-3 font-medium">آزمون</th>
                    <th className="px-4 py-3 font-medium">سؤالات</th>
                    <th className="px-4 py-3 font-medium">شرکت‌کننده</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-6 py-3 font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentExams.map((item) => (
                    <tr
                      key={item.exam.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/teacher/exams/${item.exam.id}`}
                          className="font-semibold text-slate-700 hover:text-blue-700"
                        >
                          {item.exam.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-400">{item.exam.subject}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatNumber(item.questionCount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatNumber(item.participantCount)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.exam.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(item.exam.startAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">میانگین عملکرد آزمون‌ها</h2>
            <p className="mt-1 text-xs text-slate-400">درصد نمره دانشجویان در هر آزمون</p>

            <div className="mt-5 space-y-4">
              {stats.recentExams.length === 0 ? (
                <p className="text-sm text-slate-400">داده‌ای برای نمایش نیست.</p>
              ) : (
                stats.recentExams.slice(0, 4).map((item) => (
                  <div key={item.exam.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-slate-600">
                        {item.exam.title}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatNumber(item.participantCount)} نفر
                      </span>
                    </div>
                    <ScoreBar percent={Math.round(item.averagePercent)} />
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Icon name="spark" />
            </span>
            <h2 className="mt-3 text-base font-bold text-amber-900">پیشنهاد سریع</h2>
            <p className="mt-2 text-sm leading-7 text-amber-800">
              قبل از انتشار آزمون، پاسخ صحیح و بارم هر سؤال را بررسی کنید. پس از
              اولین شرکت‌کننده، تغییر سؤالات باعث ناهماهنگی نمرات می‌شود.
            </p>
            <Link
              to="/teacher/exams"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 hover:text-amber-700"
            >
              مدیریت آزمون‌ها
              <Icon name="arrowLeft" className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
