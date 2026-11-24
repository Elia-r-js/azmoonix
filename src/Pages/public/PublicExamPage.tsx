import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Attempt, Draft, Exam, Question, User } from "../../lib/types";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import {
  ConfirmDialog,
  EmptyState,
  PageLoader,
  Spinner,
  StatusBadge,
} from "../../components/ui";
import { Icon } from "../../components/Icons";
import {
  formatClock,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  isPassed,
  percentOf,
  toPersianDigits,
} from "../../lib/format";
import {
  cn,
  copyToClipboard,
  normalizeFullName,
  normalizeStudentNumber,
  publicExamLink,
} from "../../lib/utils";

type Phase =
  | "loading"
  | "gate"
  | "preview"
  | "taking"
  | "result"
  | "unavailable"
  | "error";

type RunnerQuestion = Omit<Question, "correctIndex"> & {
  correctIndex?: number;
};

type ExamView = Omit<Exam, "questions"> & {
  questions: RunnerQuestion[];
};

interface Participant {
  name: string;
  studentNumber: string;
}

const OPTION_LABELS = ["الف", "ب", "ج", "د"];

function ExamShell({ children, user }: { children: ReactNode; user: User | null }) {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f9ff] text-slate-800">
      <header className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-blue-900">
            Azmoon<span className="text-amber-500">ix</span>
          </Link>

          {user ? (
            <Link
              to="/teacher"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Icon name="dashboard" className="h-4 w-4" />
              بازگشت به پنل استاد
            </Link>
          ) : (
            <span className="text-xs font-medium text-slate-400">آزمون آنلاین</span>
          )}
        </div>
      </header>

      {children}
    </main>
  );
}

export default function PublicExamPage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const { push } = useToast();

  const [phase, setPhase] = useState<Phase>("loading");
  const [exam, setExam] = useState<ExamView | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState("");
  const [gateName, setGateName] = useState("");
  const [gateNumber, setGateNumber] = useState("");
  const [gateError, setGateError] = useState("");
  const [gateBusy, setGateBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const submittedRef = useRef(false);
  const autoSubmitTriedRef = useRef(false);

  useEffect(() => {
    if (!token || authLoading) return;
    let active = true;

    const load = async () => {
      const publicExam = await api.publicExams.getByToken(token);
      if (!active) return;

      if (user) {
        if (publicExam.teacherId !== user.id) {
          setMessage("این لینک آزمون به استاد دیگری تعلق دارد.");
          setPhase("unavailable");
          return;
        }

        const fullExam = await api.publicExams.getPreviewByToken(token, user.id);
        if (!active) return;
        setExam(fullExam);
        setPhase("preview");
        return;
      }

      setExam(publicExam);
      if (publicExam.status === "draft") {
        setMessage("این آزمون هنوز توسط استاد منتشر نشده است.");
        setPhase("unavailable");
        return;
      }

      setPhase("gate");
    };

    load().catch((error: unknown) => {
      if (!active) return;
      setMessage(
        error instanceof Error ? error.message : "دریافت آزمون ناموفق بود.",
      );
      setPhase("error");
    });

    return () => {
      active = false;
    };
  }, [token, authLoading, user]);

  const doSubmit = useCallback(
    async (auto: boolean) => {
      if (!exam || !startedAt || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      setSubmitError("");
      setConfirmOpen(false);

      try {
        if (isPreview) {
          const cleanAnswers: Record<string, number> = {};
          let score = 0;
          let total = 0;

          exam.questions.forEach((question) => {
            const selected = answers[question.id];
            const valid =
              typeof selected === "number" &&
              selected >= 0 &&
              selected < question.options.length;

            if (valid) cleanAnswers[question.id] = selected;
            total += question.points;
            if (
              valid &&
              question.correctIndex !== undefined &&
              selected === question.correctIndex
            ) {
              score += question.points;
            }
          });

          const previewResult: Attempt = {
            id: `preview-${Date.now()}`,
            examId: exam.id,
            studentName: "پیش‌نمایش استاد",
            studentNumber: "",
            answers: cleanAnswers,
            score,
            total,
            startedAt,
            submittedAt: new Date().toISOString(),
          };

          setAttempt(previewResult);
          setAnswers(cleanAnswers);
          setPhase("result");
          push(
            auto ? "زمان آزمون آزمایشی به پایان رسید." : "آزمون آزمایشی ثبت شد.",
            "info",
          );
          return;
        }

        if (!participant) {
          throw new Error("اطلاعات شرکت‌کننده پیدا نشد. از ابتدا تلاش کنید.");
        }

        const result = await api.attempts.submit(exam.id, {
          studentName: participant.name,
          studentNumber: participant.studentNumber,
          answers,
          startedAt,
        });

        setAttempt(result);
        setAnswers(result.answers);
        setPhase("result");
        push(
          auto
            ? "زمان آزمون به پایان رسید و پاسخ‌های شما ثبت شد."
            : "پاسخ‌های شما با موفقیت ثبت شد.",
          auto ? "info" : "success",
        );
      } catch (error) {
        submittedRef.current = false;
        const text =
          error instanceof Error ? error.message : "ثبت پاسخ‌ها ناموفق بود.";
        setSubmitError(text);
        push(text, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [exam, startedAt, answers, isPreview, participant, push],
  );

  useEffect(() => {
    if (phase !== "gate") return;

    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "taking" || !exam || !startedAt) return;

    const tick = () => {
      const end = new Date(startedAt).getTime() + exam.durationMinutes * 60_000;
      const milliseconds = end - Date.now();
      setRemaining(milliseconds);
      if (milliseconds <= 0 && !autoSubmitTriedRef.current) {
        autoSubmitTriedRef.current = true;
        void doSubmit(true);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [phase, exam, startedAt, doSubmit]);

  useEffect(() => {
    if (phase !== "taking" || isPreview) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase, isPreview]);

  const handleGateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!exam) return;

    setGateError("");
    const name = normalizeFullName(gateName);
    const studentNumber = normalizeStudentNumber(gateNumber);

    if (name.length < 3) {
      setGateError("نام و نام خانوادگی را کامل وارد کنید.");
      return;
    }
    if (!/^\d{10}$/.test(studentNumber)) {
      setGateError("شماره دانشجویی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    setGateName(name);
    setGateNumber(studentNumber);
    setGateBusy(true);

    try {
      const existing = await api.attempts.getForParticipant(exam.id, studentNumber);
      if (existing) {
        if (normalizeFullName(existing.studentName) !== name) {
          setGateError(
            "این شماره دانشجویی قبلاً با نام دیگری در این آزمون ثبت شده است.",
          );
          return;
        }

        setParticipant({
          name: existing.studentName,
          studentNumber: existing.studentNumber,
        });
        setAttempt(existing);
        setAnswers(existing.answers);
        setIsPreview(false);
        setPhase("result");
        return;
      }

      const draft = await api.attempts.getDraft(exam.id, studentNumber);
      if (draft) {
        if (normalizeFullName(draft.studentName) !== name) {
          setGateError(
            "این شماره دانشجویی قبلاً با نام دیگری آزمون را شروع کرده است.",
          );
          return;
        }

        const remainingMs =
          exam.durationMinutes * 60_000 -
          (Date.now() - new Date(draft.startedAt).getTime());
        const firstUnanswered = exam.questions.findIndex(
          (question) => draft.answers[question.id] === undefined,
        );

        setParticipant({ name, studentNumber });
        setAnswers(draft.answers);
        setStartedAt(draft.startedAt);
        setRemaining(Math.max(0, remainingMs));
        setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
        submittedRef.current = false;
        autoSubmitTriedRef.current = false;
        setIsPreview(false);
        setPhase("taking");
        push("آزمون از همان‌جا که رها کرده بودید ادامه یافت.", "info");
        return;
      }

      if (exam.status !== "active") {
        setMessage("این آزمون به پایان رسیده و شما در آن شرکت نکرده‌اید.");
        setPhase("unavailable");
        return;
      }

      if (new Date(exam.startAt).getTime() > Date.now()) {
        setMessage(
          `این آزمون در تاریخ ${formatDateTime(exam.startAt)} آغاز می‌شود.`,
        );
        setPhase("unavailable");
        return;
      }

      const now = new Date().toISOString();
      const draftData: Draft = {
        studentName: name,
        studentNumber,
        answers: {},
        startedAt: now,
      };

      await api.attempts.saveDraft(exam.id, studentNumber, draftData);
      setParticipant({ name, studentNumber });
      setAnswers({});
      setStartedAt(now);
      setRemaining(exam.durationMinutes * 60_000);
      setIndex(0);
      setSubmitError("");
      submittedRef.current = false;
      autoSubmitTriedRef.current = false;
      setIsPreview(false);
      setPhase("taking");
    } catch (error) {
      setGateError(
        error instanceof Error ? error.message : "ورود به آزمون ناموفق بود.",
      );
    } finally {
      setGateBusy(false);
    }
  };

  const startPreview = () => {
    if (!exam) return;
    submittedRef.current = false;
    autoSubmitTriedRef.current = false;
    setIsPreview(true);
    setParticipant(null);
    setAttempt(null);
    setAnswers({});
    setStartedAt(new Date().toISOString());
    setRemaining(exam.durationMinutes * 60_000);
    setIndex(0);
    setSubmitError("");
    setConfirmOpen(false);
    setPhase("taking");
  };

  const leavePreviewRun = () => {
    setPhase("preview");
    setIsPreview(false);
    setAttempt(null);
    setAnswers({});
    setStartedAt(null);
    setConfirmOpen(false);
  };

  const selectOption = (questionId: string, optionIndex: number) => {
    if (!exam || !startedAt || phase !== "taking") return;
    const next = { ...answers, [questionId]: optionIndex };
    setAnswers(next);

    if (!isPreview && participant) {
      void api.attempts
        .saveDraft(exam.id, participant.studentNumber, {
          studentName: participant.name,
          studentNumber: participant.studentNumber,
          answers: next,
          startedAt,
        })
        .catch(() => undefined);
    }
  };

  const copyLink = async () => {
    if (!exam) return;
    const copied = await copyToClipboard(publicExamLink(exam.publicToken));
    push(
      copied
        ? "لینک آزمون کپی شد."
        : "کپی خودکار ممکن نشد؛ لینک را به‌صورت دستی انتخاب و کپی کنید.",
      copied ? "success" : "error",
    );
  };

  const answeredCount = useMemo(() => {
    if (!exam) return 0;
    return exam.questions.filter((question) => answers[question.id] !== undefined)
      .length;
  }, [exam, answers]);

  if (phase === "loading") {
    return (
      <ExamShell user={user}>
        <PageLoader label="در حال آماده‌سازی آزمون..." />
      </ExamShell>
    );
  }

  if (phase === "error" || !exam) {
    return (
      <ExamShell user={user}>
        <div className="mx-auto max-w-2xl px-4 py-16">
          <EmptyState
            icon="alert"
            title="آزمون پیدا نشد"
            description={message || "آزمون موردنظر وجود ندارد یا لینک آن معتبر نیست."}
            action={
              <Link
                to={user ? "/teacher" : "/"}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {user ? "بازگشت به پنل" : "بازگشت به صفحه اصلی"}
              </Link>
            }
          />
        </div>
      </ExamShell>
    );
  }

  if (phase === "unavailable") {
    return (
      <ExamShell user={user}>
        <div className="mx-auto max-w-2xl px-4 py-16">
          <EmptyState
            icon="clock"
            title="امکان شرکت در آزمون وجود ندارد"
            description={message}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to={user ? "/teacher" : "/"}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {user ? "بازگشت به پنل" : "بازگشت به صفحه اصلی"}
                </Link>
                {user ? (
                  <Link
                    to={`/e/${exam.publicToken}`}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    تلاش دوباره
                  </Link>
                ) : null}
              </div>
            }
          />
        </div>
      </ExamShell>
    );
  }

  const totalPoints = exam.questions.reduce(
    (sum, question) => sum + question.points,
    0,
  );

  if (phase === "gate") {
    const startsInFuture = new Date(exam.startAt).getTime() > now;
    const notActive = exam.status !== "active";
    const buttonLabel = notActive
      ? "بررسی وضعیت / مشاهده نتیجه"
      : startsInFuture
        ? "بررسی زمان شروع"
        : "ورود و شروع آزمون";

    return (
      <ExamShell user={user}>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-l from-blue-800 via-blue-700 to-sky-600 p-7 text-white sm:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={exam.status} />
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-blue-50">
                  {exam.subject}
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                {exam.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
                {exam.description || "برای این آزمون توضیحی ثبت نشده است."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 sm:p-8">
              {[
                {
                  label: "تعداد سؤال",
                  value: formatNumber(exam.questions.length),
                  icon: "list" as const,
                },
                {
                  label: "مدت آزمون",
                  value: formatDuration(exam.durationMinutes),
                  icon: "clock" as const,
                },
                {
                  label: "مجموع بارم",
                  value: formatNumber(totalPoints),
                  icon: "chart" as const,
                },
                {
                  label: "شروع آزمون",
                  value: formatDateOnly(exam.startAt),
                  icon: "calendar" as const,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center"
                >
                  <Icon name={item.icon} className="mx-auto h-5 w-5 text-blue-500" />
                  <p className="mt-2 text-[11px] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-6 sm:p-8">
              {notActive || startsInFuture ? (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-7 text-amber-800">
                  {notActive
                    ? "این آزمون به پایان رسیده است. اگر قبلاً در آن شرکت کرده‌اید، با همان نام و شماره دانشجویی وارد شوید تا نتیجه‌تان نمایش داده شود."
                    : `این آزمون در تاریخ ${formatDateTime(exam.startAt)} آغاز می‌شود.`}
                </div>
              ) : null}

              <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-6 text-blue-800">
                <p className="font-semibold">ورود بدون ساخت حساب</p>
                <p className="mt-1">
                  نام و شماره دانشجویی خود را وارد کنید. هر شماره دانشجویی فقط
                  یک بار می‌تواند در آزمون شرکت کند و در پایان فقط نتیجه را
                  می‌بینید، نه پاسخ‌های صحیح را.
                </p>
              </div>

              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleGateSubmit} noValidate>
                <div>
                  <label htmlFor="student-name" className="mb-1.5 block text-sm font-medium text-slate-600">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="student-name"
                    value={gateName}
                    onChange={(event) => {
                      setGateName(event.target.value);
                      setGateError("");
                    }}
                    placeholder="مثلاً علی محمدی"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="student-number" className="mb-1.5 block text-sm font-medium text-slate-600">
                    شماره دانشجویی (۱۰ رقم)
                  </label>
                  <input
                    id="student-number"
                    value={gateNumber}
                    onChange={(event) => {
                      setGateNumber(
                        normalizeStudentNumber(event.target.value).slice(0, 10),
                      );
                      setGateError("");
                    }}
                    placeholder="0012345678"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={10}
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {gateError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 sm:col-span-2">
                    {gateError}
                  </div>
                ) : null}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={gateBusy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-70 sm:w-auto"
                  >
                    {gateBusy ? <Spinner className="h-4 w-4 border-white/50 border-t-white" /> : <Icon name="play" className="h-4 w-4" />}
                    {buttonLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </ExamShell>
    );
  }

  if (phase === "preview") {
    return (
      <ExamShell user={user}>
        <div className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6">
          <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <Icon name="eye" className="h-4 w-4" />
                  حالت پیش‌نمایش استاد
                </p>
                <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                  {exam.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  این صفحه فقط برای شماست. دانشجویان لینک را با فرم نام و شماره
                  دانشجویی می‌بینند و پاسخ صحیح را مشاهده نمی‌کنند.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  <Icon name="copy" className="h-4 w-4" />
                  کپی لینک
                </button>
                <button
                  type="button"
                  onClick={startPreview}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  <Icon name="play" className="h-4 w-4" />
                  تست آزمون
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={exam.status} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {exam.subject}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {formatNumber(exam.questions.length)} سؤال
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {formatDuration(exam.durationMinutes)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              مجموع بارم {formatNumber(totalPoints)}
            </span>
          </div>

          <div className="space-y-4">
            {exam.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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
                  <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                    {formatNumber(question.points)} بارم
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const correct = optionIndex === question.correctIndex;
                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                          correct
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-600",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                            correct
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500",
                          )}
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
        </div>
      </ExamShell>
    );
  }

  if (phase === "result" && attempt) {
    const percent = percentOf(attempt.score, attempt.total);
    const passed = isPassed(attempt.score, attempt.total);

    return (
      <ExamShell user={user}>
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6 sm:py-12">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div
              className={cn(
                "p-7 text-white sm:p-9",
                passed
                  ? "bg-gradient-to-l from-emerald-700 to-emerald-500"
                  : "bg-gradient-to-l from-rose-700 to-rose-500",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-sm text-white/80">
                    {isPreview ? "نتیجه آزمون آزمایشی" : "نتیجه آزمون"}
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold">{exam.title}</h1>
                  {isPreview ? (
                    <p className="mt-2 text-sm text-white/80">
                      این نتیجه ذخیره نشده و در گزارش‌های آزمون ثبت نمی‌شود.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-white/80">
                      ثبت‌شده در {formatDateTime(attempt.submittedAt)}
                    </p>
                  )}
                </div>

                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <span className="text-3xl font-extrabold">
                    {formatPercent(percent)}
                  </span>
                  <span className="mt-1 text-xs text-white/80">
                    {passed ? "قبول" : "مردود"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {!isPreview && participant ? (
                <div className="mb-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">نام</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {participant.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">شماره دانشجویی</p>
                    <p className="mt-1 font-semibold text-slate-700" dir="ltr">
                      {toPersianDigits(participant.studentNumber)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">نمره</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {formatNumber(attempt.score)} از {formatNumber(attempt.total)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-400">نمره آزمون آزمایشی</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-700">
                    {formatNumber(attempt.score)} از {formatNumber(attempt.total)}
                  </p>
                </div>
              )}

              <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs leading-6 text-blue-800">
                {isPreview
                  ? "برای دیدن پاسخ صحیح هر سؤال، به صفحه پیش‌نمایش برگردید."
                  : "نتیجه شما ثبت شد. پاسخ‌های صحیح نمایش داده نمی‌شوند. برای دیدن دوباره همین نتیجه، لینک آزمون و شماره دانشجویی خود را نگه دارید."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {isPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={leavePreviewRun}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Icon name="eye" className="h-4 w-4" />
                      بازگشت به پیش‌نمایش
                    </button>
                    <button
                      type="button"
                      onClick={startPreview}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Icon name="play" className="h-4 w-4" />
                      تست دوباره
                    </button>
                  </>
                ) : (
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Icon name="arrowRight" className="h-4 w-4" />
                    بازگشت به صفحه اصلی
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </ExamShell>
    );
  }

  if (!startedAt) {
    return (
      <ExamShell user={user}>
        <PageLoader label="در حال آماده‌سازی آزمون..." />
      </ExamShell>
    );
  }

  const currentQuestion = exam.questions[Math.min(index, exam.questions.length - 1)];
  const isLast = index === exam.questions.length - 1;
  const unansweredCount = exam.questions.length - answeredCount;
  const urgent = remaining <= 60_000;
  const lowTime = remaining <= 5 * 60_000;

  return (
    <ExamShell user={user}>
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            {isPreview ? (
              <button
                type="button"
                onClick={leavePreviewRun}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-blue-600"
                title="خروج از آزمون آزمایشی"
              >
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-blue-600"
                title="خروج (پاسخ‌ها ذخیره می‌شوند)"
              >
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            )}

            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">
                {isPreview ? "پیش‌نمایش و تست آزمون" : "برگه آزمون"}
              </p>
              <h1 className="truncate text-sm font-bold text-slate-800">
                {exam.title}
              </h1>
              <p className="text-xs text-slate-400">
                {exam.subject} • {formatNumber(exam.questions.length)} سؤال
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
              پاسخ‌داده: {formatNumber(answeredCount)} از{" "}
              {formatNumber(exam.questions.length)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold",
                urgent
                  ? "animate-pulse bg-rose-50 text-rose-600"
                  : lowTime
                    ? "bg-amber-50 text-amber-700"
                    : "bg-blue-50 text-blue-700",
              )}
            >
              <Icon name="clock" className="h-4 w-4" />
              {formatClock(remaining)}
            </span>
          </div>
        </div>

        {isPreview ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs text-blue-800">
            حالت تست استاد فعال است؛ پاسخ‌ها ذخیره نمی‌شوند و در نتایج ثبت
            نخواهند شد.
          </div>
        ) : null}

        {submitError ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => {
                submittedRef.current = false;
                void doSubmit(false);
              }}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200"
            >
              تلاش دوباره
            </button>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">
                  سؤال {formatNumber(index + 1)} از{" "}
                  {formatNumber(exam.questions.length)}
                </p>
                <p className="mt-1 text-xs font-medium text-blue-600">
                  {formatNumber(currentQuestion.points)} بارم
                </p>
              </div>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${((index + 1) / exam.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-base font-semibold leading-8 text-slate-800 sm:text-lg">
              {currentQuestion.text}
            </p>

            <div className="mt-6 space-y-2.5">
              {currentQuestion.options.map((option, optionIndex) => {
                const selected = answers[currentQuestion.id] === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => selectOption(currentQuestion.id, optionIndex)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition",
                      selected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {OPTION_LABELS[optionIndex] ?? optionIndex + 1}
                    </span>
                    <span className="flex-1 pt-1.5 text-sm leading-6 text-slate-700">
                      {option}
                    </span>
                    {selected ? (
                      <Icon
                        name="check"
                        className="mt-2 h-4 w-4 shrink-0 text-blue-600"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setIndex((current) => Math.max(0, current - 1))}
                disabled={index === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="arrowRight" className="h-4 w-4" />
                سؤال قبل
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Icon name="check" className="h-4 w-4" />
                  پایان و ثبت آزمون
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setIndex((current) =>
                      Math.min(exam.questions.length - 1, current + 1),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  سؤال بعد
                  <Icon name="arrowLeft" className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">زمان باقی‌مانده</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-lg font-extrabold",
                    urgent
                      ? "text-rose-600"
                      : lowTime
                        ? "text-amber-600"
                        : "text-blue-700",
                  )}
                >
                  <Icon name="clock" className="h-4 w-4" />
                  {formatClock(remaining)}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    urgent
                      ? "bg-rose-500"
                      : lowTime
                        ? "bg-amber-500"
                        : "bg-blue-500",
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (answeredCount / exam.questions.length) * 100,
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {formatNumber(answeredCount)} از{" "}
                {formatNumber(exam.questions.length)} سؤال پاسخ داده شده
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold text-slate-500">
                مرور سؤالات
              </p>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((question, questionIndex) => {
                  const answered = answers[question.id] !== undefined;
                  const current = questionIndex === index;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setIndex(questionIndex)}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-lg text-xs font-bold transition",
                        current
                          ? "bg-blue-700 text-white ring-2 ring-blue-300 ring-offset-1"
                          : answered
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {formatNumber(questionIndex + 1)}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Icon name="check" className="h-4 w-4" />
                پایان و ثبت آزمون
              </button>

              {unansweredCount > 0 ? (
                <p className="mt-3 text-center text-xs text-amber-600">
                  {formatNumber(unansweredCount)} سؤال بدون پاسخ باقی مانده است.
                </p>
              ) : (
                <p className="mt-3 text-center text-xs text-emerald-600">
                  همه سؤالات پاسخ داده شده‌اند.
                </p>
              )}
            </div>
          </aside>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title={isPreview ? "پایان آزمون آزمایشی" : "ثبت نهایی آزمون"}
          message={
            isPreview
              ? "این آزمون آزمایشی است و نتیجه آن در گزارش‌ها ذخیره نمی‌شود. آیا به پایان می‌رسانید؟"
              : unansweredCount > 0
                ? `${formatNumber(unansweredCount)} سؤال بدون پاسخ دارید. پس از ثبت، امکان تغییر پاسخ‌ها وجود ندارد. آیا آزمون را به پایان می‌رسانید؟`
                : "همه سؤالات پاسخ داده شده‌اند. پس از ثبت، امکان تغییر پاسخ‌ها وجود ندارد. آیا آزمون را به پایان می‌رسانید؟"
          }
          confirmLabel={submitting ? "در حال ثبت..." : "بله، ثبت کن"}
          onConfirm={() => void doSubmit(false)}
          onClose={() => setConfirmOpen(false)}
        />

        {submitting ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-lg">
              <Spinner />
              در حال ثبت پاسخ‌ها...
            </div>
          </div>
        ) : null}
      </div>
    </ExamShell>
  );
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
