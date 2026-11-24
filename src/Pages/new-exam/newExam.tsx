import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { ExamInput, ExamStatus } from "../../lib/types";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { EmptyState, PageHeader, PageLoader, Spinner } from "../../components/ui";
import { Icon } from "../../components/Icons";
import { formatNumber, toDateTimeLocal } from "../../lib/format";
import { cn, uid } from "../../lib/utils";

interface FormQuestion {
  key: string;
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: string;
}

interface FormState {
  title: string;
  subject: string;
  description: string;
  durationMinutes: string;
  startAt: string;
  status: ExamStatus;
  questions: FormQuestion[];
}

const OPTION_LABELS = ["الف", "ب", "ج", "د"];

function emptyQuestion(): FormQuestion {
  return {
    key: uid("question"),
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    points: "1",
  };
}

function initialForm(): FormState {
  return {
    title: "",
    subject: "",
    description: "",
    durationMinutes: "30",
    startAt: toDateTimeLocal(new Date(Date.now() + 3_600_000).toISOString()),
    status: "draft",
    questions: [emptyQuestion()],
  };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function CreateExam() {
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const isEditing = Boolean(examId);

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState<ExamStatus | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!examId || !user) return;
    let active = true;

    api.exams
      .get(examId)
      .then((exam) => {
        if (!active) return;
        if (exam.teacherId !== user.id) {
          setLoadError("شما به این آزمون دسترسی ندارید.");
          return;
        }
        setForm({
          title: exam.title,
          subject: exam.subject,
          description: exam.description,
          durationMinutes: String(exam.durationMinutes),
          startAt: toDateTimeLocal(exam.startAt),
          status: exam.status,
          questions: exam.questions.map((question) => ({
            key: question.id,
            id: question.id,
            text: question.text,
            options: [...question.options],
            correctIndex: question.correctIndex,
            points: String(question.points),
          })),
        });
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "دریافت آزمون ناموفق بود.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [examId, user]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateQuestion = (key: string, patch: Partial<FormQuestion>) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.key === key ? { ...question, ...patch } : question,
      ),
    }));
  };

  const updateOption = (key: string, index: number, value: string) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.key !== key) return question;
        const options = [...question.options];
        options[index] = value;
        return { ...question, options };
      }),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = (key: string) => {
    setForm((current) => {
      if (current.questions.length <= 1) return current;
      return {
        ...current,
        questions: current.questions.filter((question) => question.key !== key),
      };
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) nextErrors.title = "عنوان آزمون را وارد کنید.";
    if (!form.subject.trim()) nextErrors.subject = "درس آزمون را وارد کنید.";

    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      nextErrors.durationMinutes = "مدت آزمون باید بیشتر از صفر باشد.";
    }

    if (!form.startAt || Number.isNaN(new Date(form.startAt).getTime())) {
      nextErrors.startAt = "تاریخ و ساعت شروع را مشخص کنید.";
    }

    if (form.questions.length === 0) {
      nextErrors.questions = "حداقل یک سؤال اضافه کنید.";
    }

    form.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        nextErrors[`${question.key}-text`] = `متن سؤال ${formatNumber(index + 1)} را وارد کنید.`;
      }

      question.options.forEach((option, optionIndex) => {
        if (!option.trim()) {
          nextErrors[`${question.key}-option-${optionIndex}`] =
            `گزینه ${OPTION_LABELS[optionIndex]} سؤال ${formatNumber(index + 1)} خالی است.`;
        }
      });

      const points = Number(question.points);
      if (!Number.isFinite(points) || points <= 0) {
        nextErrors[`${question.key}-points`] = "بارم سؤال باید بیشتر از صفر باشد.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async (statusOverride?: ExamStatus) => {
    if (!user) return;
    setFormError("");

    if (!validate()) {
      setFormError("لطفاً خطاهای مشخص‌شده را برطرف کنید.");
      return;
    }

    const status = statusOverride ?? form.status;
    setSaving(status);

    try {
      const payload: ExamInput = {
        title: form.title,
        subject: form.subject,
        description: form.description,
        durationMinutes: Number(form.durationMinutes),
        startAt: new Date(form.startAt).toISOString(),
        status,
        questions: form.questions.map((question) => ({
          id: question.id,
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
          points: Number(question.points),
        })),
      };

      if (examId) {
        await api.exams.update(examId, user.id, payload);
        push("تغییرات آزمون ذخیره شد.", "success");
      } else {
        await api.exams.create(user.id, payload);
        push(
          status === "active" ? "آزمون ساخته و فعال شد." : "پیش‌نویس آزمون ذخیره شد.",
          "success",
        );
      }
      navigate("/teacher/exams");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ذخیره آزمون ناموفق بود.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <PageLoader label="در حال دریافت اطلاعات آزمون..." />;

  if (loadError) {
    return (
      <EmptyState
        icon="alert"
        title="دسترسی به آزمون ممکن نیست"
        description={loadError}
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

  const totalPoints = form.questions.reduce(
    (sum, question) => sum + (Number(question.points) || 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title={isEditing ? "ویرایش آزمون" : "ایجاد آزمون جدید"}
        description={
          isEditing
            ? "اطلاعات آزمون و سؤالات را ویرایش کنید. توجه کنید تغییر سؤالات پس از برگزاری می‌تواند نمرات قبلی را ناهماهنگ کند."
            : "اطلاعات آزمون را وارد کنید و سؤالات خود را با تعیین پاسخ صحیح و بارم اضافه کنید."
        }
        action={
          <Link
            to="/teacher/exams"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Icon name="arrowRight" className="h-4 w-4" />
            بازگشت
          </Link>
        }
      />

      {formError ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {formError}
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon name="clipboard" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">اطلاعات آزمون</h2>
              <p className="text-xs text-slate-400">مشخصات کلی و زمان‌بندی برگزاری</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                عنوان آزمون <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="مثلاً آزمون میان‌ترم برنامه‌نویسی"
                className={cn(inputClass, errors.title && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
              />
              {errors.title ? (
                <p className="mt-1 text-xs text-rose-500">{errors.title}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                درس <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="مثلاً برنامه‌نویسی پیشرفته"
                className={cn(inputClass, errors.subject && "border-rose-300")}
              />
              {errors.subject ? (
                <p className="mt-1 text-xs text-rose-500">{errors.subject}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                مدت آزمون (دقیقه) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(event) => updateField("durationMinutes", event.target.value)}
                className={cn(inputClass, errors.durationMinutes && "border-rose-300")}
              />
              {errors.durationMinutes ? (
                <p className="mt-1 text-xs text-rose-500">{errors.durationMinutes}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                تاریخ و ساعت شروع <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(event) => updateField("startAt", event.target.value)}
                className={cn(inputClass, errors.startAt && "border-rose-300")}
              />
              {errors.startAt ? (
                <p className="mt-1 text-xs text-rose-500">{errors.startAt}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                وضعیت آزمون
              </label>
              {isEditing ? (
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as ExamStatus)
                  }
                  className={inputClass}
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="active">فعال</option>
                  <option value="closed">پایان‌یافته</option>
                </select>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  پیش‌نویس ذخیره می‌شود؛ با دکمه انتشار، آزمون فعال خواهد شد.
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                توضیحات آزمون
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="توضیح کوتاهی درباره محتوا و شرایط آزمون..."
                className={cn(inputClass, "resize-none leading-7")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Icon name="list" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800">سؤالات آزمون</h2>
                <p className="text-xs text-slate-400">
                  {formatNumber(form.questions.length)} سؤال • مجموع بارم {formatNumber(totalPoints)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <Icon name="plus" className="h-4 w-4" />
              افزودن سؤال
            </button>
          </div>

          {errors.questions ? (
            <p className="mb-4 text-sm text-rose-500">{errors.questions}</p>
          ) : null}

          <div className="space-y-5">
            {form.questions.map((question, questionIndex) => (
              <div
                key={question.key}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs text-white">
                      {formatNumber(questionIndex + 1)}
                    </span>
                    سؤال {formatNumber(questionIndex + 1)}
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      بارم
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={question.points}
                        onChange={(event) =>
                          updateQuestion(question.key, { points: event.target.value })
                        }
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm outline-none focus:border-blue-500"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.key)}
                      disabled={form.questions.length <= 1}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                      title="حذف سؤال"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {errors[`${question.key}-points`] ? (
                  <p className="mb-2 text-xs text-rose-500">
                    {errors[`${question.key}-points`]}
                  </p>
                ) : null}

                <textarea
                  rows={2}
                  value={question.text}
                  onChange={(event) =>
                    updateQuestion(question.key, { text: event.target.value })
                  }
                  placeholder="متن سؤال را وارد کنید..."
                  className={cn(
                    "w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    errors[`${question.key}-text`] && "border-rose-300",
                  )}
                />
                {errors[`${question.key}-text`] ? (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors[`${question.key}-text`]}
                  </p>
                ) : null}

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-xl border bg-white px-3 py-2 transition",
                          question.correctIndex === optionIndex
                            ? "border-emerald-400 ring-2 ring-emerald-100"
                            : "border-slate-200",
                          errors[`${question.key}-option-${optionIndex}`] &&
                            "border-rose-300",
                        )}
                      >
                        <label className="flex shrink-0 cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.key}`}
                            checked={question.correctIndex === optionIndex}
                            onChange={() =>
                              updateQuestion(question.key, { correctIndex: optionIndex })
                            }
                            className="h-4 w-4 accent-emerald-600"
                            title="انتخاب به‌عنوان پاسخ صحیح"
                          />
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                            {OPTION_LABELS[optionIndex]}
                          </span>
                        </label>
                        <input
                          value={option}
                          onChange={(event) =>
                            updateOption(question.key, optionIndex, event.target.value)
                          }
                          placeholder={`گزینه ${OPTION_LABELS[optionIndex]}`}
                          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                      </div>
                      {errors[`${question.key}-option-${optionIndex}`] ? (
                        <p className="mt-1 text-xs text-rose-500">
                          {errors[`${question.key}-option-${optionIndex}`]}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  گزینه‌ای که کنار آن انتخاب شده باشد به‌عنوان پاسخ صحیح در نظر
                  گرفته می‌شود.
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/teacher/exams"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            انصراف
          </Link>

          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-70"
              >
                {saving ? <Spinner className="h-4 w-4 border-white/50 border-t-white" /> : null}
                ذخیره تغییرات
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void save("draft")}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-70"
                >
                  {saving === "draft" ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Icon name="edit" className="h-4 w-4" />
                  )}
                  ذخیره پیش‌نویس
                </button>
                <button
                  type="button"
                  onClick={() => void save("active")}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-70"
                >
                  {saving === "active" ? (
                    <Spinner className="h-4 w-4 border-white/50 border-t-white" />
                  ) : (
                    <Icon name="check" className="h-4 w-4" />
                  )}
                  انتشار و فعال‌سازی آزمون
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
