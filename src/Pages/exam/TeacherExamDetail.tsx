import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Exam, ExamStatus, ResultRow } from "../../lib/types";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  PageLoader,
  ScoreBar,
  StatCard,
  StatusBadge,
} from "../../components/ui";
import { Icon } from "../../components/Icons";
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  isPassed,
  percentOf,
} from "../../lib/format";
import { copyToClipboard, publicExamLink } from "../../lib/utils";

const OPTION_LABELS = ["الف", "ب", "ج", "د"];

export default function TeacherExamDetail() {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!examId || !user) return;
    let active = true;

    api.exams
      .get(examId)
      .then(async (examData) => {
        if (!active) return;
        if (examData.teacherId !== user.id) {
          throw new Error("شما به این آزمون دسترسی ندارید.");
        }
        const resultData = await api.results.forExam(examId);
        if (!active) return;
        setExam(examData);
        setResults(resultData);
        setError("");
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
  }, [examId, user, reloadToken]);

  const reload = () => setReloadToken((value) => value + 1);

  const changeStatus = async (status: ExamStatus) => {
    if (!exam || !user) return;
    setBusy(true);
    try {
      await api.exams.setStatus(exam.id, user.id, status);
      push(status === "active" ? "آزمون فعال شد." : "آزمون به پایان رسید.", "success");
      reload();
    } catch (err) {
      push(err instanceof Error ? err.message : "تغییر وضعیت ناموفق بود.", "error");
    } finally {
      setBusy(false);
    }
  };

  const copyExamLink = async () => {
    if (!exam) return;
    const copied = await copyToClipboard(publicExamLink(exam.publicToken));
    push(
      copied
        ? "لینک عمومی آزمون کپی شد."
        : "کپی خودکار ممکن نشد؛ لینک را دستی انتخاب و کپی کنید.",
      copied ? "success" : "error",
    );
  };

  const regenerateToken = async () => {
    if (!exam || !user) return;
    setTokenOpen(false);
    setBusy(true);
    try {
      await api.exams.regeneratePublicToken(exam.id, user.id);
      push("لینک عمومی جدید ساخته شد؛ لینک قبلی دیگر کار نمی‌کند.", "success");
      reload();
    } catch (err) {
      push(err instanceof Error ? err.message : "ساخت لینک جدید ناموفق بود.", "error");
    } finally {
      setBusy(false);
    }
  };

  const removeExam = async () => {
    if (!exam || !user) return;
    setDeleteOpen(false);
    setBusy(true);
    try {
      await api.exams.remove(exam.id, user.id);
      push("آزمون حذف شد.", "success");
      navigate("/teacher/exams", { replace: true });
    } catch (err) {
      push(err instanceof Error ? err.message : "حذف آزمون ناموفق بود.", "error");
      setBusy(false);
    }
  };

  if (loading) return <PageLoader label="در حال دریافت جزئیات آزمون..." />;

  if (error || !exam) {
    return (
      <EmptyState
        icon="alert"
        title="آزمون پیدا نشد"
        description={error || "آزمون موردنظر وجود ندارد یا حذف شده است."}
        action={
          <Link
            to="/teacher/exams"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            بازگشت به آزمون‌ها
          </Link>
        }
      />
    );
  }

  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
  const average =
    results.length === 0
      ? 0
      : results.reduce(
          (sum, row) => sum + percentOf(row.attempt.score, row.attempt.total),
          0,
        ) / results.length;
  const best =
    results.length === 0
      ? 0
      : Math.max(
          ...results.map((row) => percentOf(row.attempt.score, row.attempt.total)),
        );
  const passed = results.filter((row) => isPassed(row.attempt.score, row.attempt.total));
  const passRate = results.length === 0 ? 0 : (passed.length / results.length) * 100;

  return (
    <div>
      <PageHeader
        title={exam.title}
        description={exam.description || "برای این آزمون توضیحی ثبت نشده است."}
        action={
          <>
            <Link
              to="/teacher/exams"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Icon name="arrowRight" className="h-4 w-4" />
              بازگشت
            </Link>
            <Link
              to={`/teacher/exams/${exam.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <Icon name="edit" className="h-4 w-4" />
              ویرایش
            </Link>
            <button
              type="button"
              onClick={() => void changeStatus(exam.status === "active" ? "closed" : "active")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Icon name={exam.status === "active" ? "check" : "play"} className="h-4 w-4" />
              {exam.status === "active" ? "پایان آزمون" : "فعال‌سازی آزمون"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
            >
              <Icon name="trash" className="h-4 w-4" />
              حذف
            </button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={exam.status} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          <Icon name="book" className="h-3.5 w-3.5" />
          {exam.subject}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {formatDuration(exam.durationMinutes)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          <Icon name="calendar" className="h-3.5 w-3.5" />
          شروع: {formatDateTime(exam.startAt)}
        </span>
      </div>

      <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-sm font-bold text-blue-900">
              <Icon name="link" className="h-4 w-4" />
              لینک عمومی آزمون
            </h2>
            <p className="mt-1 text-xs leading-6 text-blue-800/80">
              این لینک را برای دانشجویان بفرستید. آن‌ها بدون ساخت حساب با نام و
              شماره دانشجویی ۱۰ رقمی وارد می‌شوند و فقط نتیجه را می‌بینند.
            </p>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-blue-700">
            فقط در همین مرورگر قابل استفاده است
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2 lg:flex-row">
          <input
            readOnly
            value={publicExamLink(exam.publicToken)}
            dir="ltr"
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-left text-xs text-slate-600 outline-none focus:border-blue-400"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyExamLink()}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <Icon name="copy" className="h-4 w-4" />
              کپی لینک
            </button>
            <Link
              to={`/e/${exam.publicToken}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Icon name="eye" className="h-4 w-4" />
              پیش‌نمایش و تست
            </Link>
            <button
              type="button"
              onClick={() => setTokenOpen(true)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="spark" className="h-4 w-4" />
              لینک جدید
            </button>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="سؤالات"
          value={formatNumber(exam.questions.length)}
          hint={`مجموع بارم ${formatNumber(totalPoints)}`}
          icon="list"
          tone="blue"
        />
        <StatCard
          label="شرکت‌کنندگان"
          value={formatNumber(results.length)}
          hint="برگه ثبت‌شده"
          icon="user"
          tone="violet"
        />
        <StatCard
          label="میانگین نمرات"
          value={formatPercent(average)}
          hint={`بالاترین: ${formatPercent(best)}`}
          icon="chart"
          tone="amber"
        />
        <StatCard
          label="نرخ قبولی"
          value={formatPercent(passRate)}
          hint={`${formatNumber(passed.length)} نفر قبول`}
          icon="trophy"
          tone="emerald"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">سؤالات آزمون</h2>
              <p className="mt-1 text-xs text-slate-400">
                پاسخ صحیح هر سؤال با رنگ سبز مشخص شده است.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {formatNumber(exam.questions.length)} سؤال
            </span>
          </div>

          <div className="space-y-4">
            {exam.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {formatNumber(index + 1)}
                    </span>
                    <p className="text-sm font-medium leading-7 text-slate-700">
                      {question.text}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs text-slate-500 shadow-sm">
                    {formatNumber(question.points)} بارم
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const correct = optionIndex === question.correctIndex;
                    return (
                      <div
                        key={optionIndex}
                        className={
                          correct
                            ? "flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                            : "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                        }
                      >
                        <span
                          className={
                            correct
                              ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white"
                              : "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500"
                          }
                        >
                          {OPTION_LABELS[optionIndex] ?? optionIndex + 1}
                        </span>
                        <span className="flex-1">{option}</span>
                        {correct ? <Icon name="check" className="h-4 w-4" /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">نتیجه شرکت‌کنندگان</h2>
              <p className="mt-1 text-xs text-slate-400">
                {results.length === 0
                  ? "هنوز کسی در این آزمون شرکت نکرده است."
                  : `${formatNumber(results.length)} برگه ثبت شده است.`}
              </p>
            </div>
            <Link
              to="/teacher/results"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              گزارش کامل
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-400">
              با فعال‌سازی آزمون، دانشجویان می‌توانند در آن شرکت کنند.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((row) => {
                const percent = percentOf(row.attempt.score, row.attempt.total);
                return (
                  <div
                    key={row.attempt.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {row.attempt.studentName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          <span dir="ltr">{row.attempt.studentNumber}</span> •{" "}
                          {formatDate(row.attempt.submittedAt)}
                        </p>
                      </div>
                      <span
                        className={
                          isPassed(row.attempt.score, row.attempt.total)
                            ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600"
                        }
                      >
                        {isPassed(row.attempt.score, row.attempt.total) ? "قبول" : "مردود"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <ScoreBar percent={percent} />
                    </div>
                    <p className="mt-1 text-left text-xs text-slate-500">
                      {formatNumber(row.attempt.score)} از {formatNumber(row.attempt.total)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={tokenOpen}
        danger
        title="ساخت لینک عمومی جدید"
        message="با ساخت لینک جدید، لینک قبلی دیگر برای ورود به آزمون کار نمی‌کند. نتایج ثبت‌شده حفظ می‌شوند."
        confirmLabel="ساخت لینک جدید"
        onConfirm={() => void regenerateToken()}
        onClose={() => setTokenOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        danger
        title="حذف آزمون"
        message={`آزمون «${exam.title}» و ${formatNumber(results.length)} نتیجه ثبت‌شده حذف خواهند شد. این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف آزمون"
        onConfirm={() => void removeExam()}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
