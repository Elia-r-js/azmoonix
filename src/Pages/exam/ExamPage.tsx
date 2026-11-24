import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { ExamStatus, ExamSummary } from "../../lib/types";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  PageLoader,
  ScoreBar,
  StatusBadge,
} from "../../components/ui";
import { Icon } from "../../components/Icons";
import { formatDate, formatNumber } from "../../lib/format";
import { cn } from "../../lib/utils";

type Filter = "all" | ExamStatus;

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "همه" },
  { value: "active", label: "فعال" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "closed", label: "پایان‌یافته" },
];

export default function ExamManagerPage() {
  const { user } = useAuth();
  const { push } = useToast();

  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamSummary | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;

    api.exams
      .listForTeacher(user.id)
      .then((data) => {
        if (active) setExams(data);
      })
      .catch((error: unknown) => {
        if (active) {
          push(
            error instanceof Error ? error.message : "دریافت آزمون‌ها ناموفق بود.",
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
  }, [user, push, reloadToken]);

  const reload = () => setReloadToken((value) => value + 1);

  const filtered = useMemo(() => {
    const term = search.trim();
    return exams.filter((item) => {
      const matchesFilter = filter === "all" || item.exam.status === filter;
      const matchesSearch =
        term.length === 0 ||
        item.exam.title.includes(term) ||
        item.exam.subject.includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [exams, filter, search]);

  const counts = useMemo(
    () => ({
      all: exams.length,
      active: exams.filter((item) => item.exam.status === "active").length,
      draft: exams.filter((item) => item.exam.status === "draft").length,
      closed: exams.filter((item) => item.exam.status === "closed").length,
    }),
    [exams],
  );

  const toggleStatus = async (item: ExamSummary) => {
    if (!user) return;
    setBusyId(item.exam.id);
    try {
      const nextStatus: ExamStatus =
        item.exam.status === "active" ? "closed" : "active";
      await api.exams.setStatus(item.exam.id, user.id, nextStatus);
      push(
        nextStatus === "active" ? "آزمون فعال شد." : "آزمون به پایان رسید.",
        "success",
      );
      reload();
    } catch (error) {
      push(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const removeExam = async () => {
    if (!user || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setBusyId(target.exam.id);
    try {
      await api.exams.remove(target.exam.id, user.id);
      push("آزمون و نتایج مرتبط با آن حذف شد.", "success");
      reload();
    } catch (error) {
      push(error instanceof Error ? error.message : "حذف آزمون ناموفق بود.", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="مدیریت آزمون‌ها"
        description="همه آزمون‌های خود را در یک نگاه ببینید، وضعیت آن‌ها را تغییر دهید و نتایج را بررسی کنید."
        action={
          <Link
            to="/teacher/exams/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            <Icon name="plus" className="h-4 w-4" />
            ایجاد آزمون جدید
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-2xl border p-4 text-right transition",
              filter === item.value
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 bg-white hover:bg-slate-50",
            )}
          >
            <p className="text-xs text-slate-500">{item.label}</p>
            <p
              className={cn(
                "mt-2 text-2xl font-extrabold",
                filter === item.value ? "text-blue-700" : "text-slate-700",
              )}
            >
              {formatNumber(counts[item.value])}
            </p>
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجوی نام آزمون یا درس..."
            className="w-full rounded-xl border border-slate-200 py-3 pr-12 pl-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          title="هنوز آزمونی نساخته‌اید"
          description="اولین آزمون خود را بسازید، سؤالات را اضافه کنید و آن را برای دانشجویان منتشر کنید."
          action={
            <Link
              to="/teacher/exams/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Icon name="plus" className="h-4 w-4" />
              ایجاد آزمون
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">آزمون</th>
                  <th className="px-4 py-3 font-medium">سؤالات</th>
                  <th className="px-4 py-3 font-medium">شرکت‌کننده</th>
                  <th className="px-4 py-3 font-medium">میانگین</th>
                  <th className="px-4 py-3 font-medium">تاریخ شروع</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="px-5 py-3 font-medium">عملیات</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const busy = busyId === item.exam.id;
                  return (
                    <tr
                      key={item.exam.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
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
                        <span className="mr-1 text-xs text-slate-400">
                          ({formatNumber(item.totalPoints)} بارم)
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatNumber(item.participantCount)}
                      </td>
                      <td className="w-40 px-4 py-4">
                        <ScoreBar percent={Math.round(item.averagePercent)} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(item.exam.startAt)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.exam.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <Link
                            to={`/teacher/exams/${item.exam.id}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                            title="مشاهده جزئیات"
                          >
                            <Icon name="eye" className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/teacher/exams/${item.exam.id}/edit`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-amber-600"
                            title="ویرایش آزمون"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => void toggleStatus(item)}
                            disabled={busy}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                          >
                            {busy
                              ? "..."
                              : item.exam.status === "active"
                                ? "پایان آزمون"
                                : "فعال‌سازی"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            disabled={busy}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            title="حذف آزمون"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              آزمونی با این مشخصات پیدا نشد.
            </p>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        danger
        title="حذف آزمون"
        message={
          deleteTarget
            ? `آزمون «${deleteTarget.exam.title}» و همه نتایج مرتبط با آن حذف می‌شوند. این عمل قابل بازگشت نیست.`
            : ""
        }
        confirmLabel="حذف آزمون"
        onConfirm={() => void removeExam()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
