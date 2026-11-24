import { useMemo, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { ValidationError } from "yup";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { loginSchema, registerSchema } from "../../Utils/authschema";
import { cn } from "../../lib/utils";
import { Icon } from "../../components/Icons";
import { Spinner } from "../../components/ui";

type Mode = "login" | "register";

interface FormState {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: FormState = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const inputClass =
  "w-full rounded-2xl border border-blue-100 bg-white/80 px-5 py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-500">{message}</p>;
}

export default function LoginPage() {
  const { user, loading, login, register } = useAuth();
  const { push } = useToast();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const destination = useMemo(() => {
    if (!user) return "/login";
    const from = (location.state as { from?: string } | null)?.from;
    if (from && from.startsWith(`/${user.role}`)) return from;
    return `/${user.role}`;
  }, [user, location.state]);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setErrors({});
    setFormError("");
    setForm((current) => ({
      ...current,
      password: "",
      confirmPassword: "",
    }));
  };

  const fillDemo = () => {
    setMode("login");
    setErrors({});
    setFormError("");
    setForm({ ...emptyForm, username: "teacher", password: "123456" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await loginSchema.validate(form, { abortEarly: false });
        const current = await login(form.username.trim(), form.password);
        push(`خوش آمدید، ${current.name}`, "success");
      } else {
        await registerSchema.validate(form, { abortEarly: false });
        const current = await register({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        });
        push("حساب کاربری شما با موفقیت ساخته شد.", "success");
        void current;
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        const fieldErrors: Record<string, string> = {};
        error.inner.forEach((item) => {
          if (item.path) fieldErrors[item.path] = item.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("خطای نامشخصی رخ داد. دوباره تلاش کنید.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef6ff]">
        <Spinner className="h-8 w-8" />
      </main>
    );
  }

  if (user) return <Navigate to={destination} replace />;

  const isRegister = mode === "register";

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef6ff] px-4 py-10"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_25px_80px_rgba(59,130,246,0.18)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden flex-col justify-between bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 p-10 text-white lg:flex">
          <div>
            <Link to="/" className="text-2xl font-extrabold tracking-tight">
              Azmoon<span className="text-amber-300">ix</span>
            </Link>
            <h2 className="mt-12 text-3xl font-extrabold leading-snug">
              آزمونی منظم،
              <br />
              نتیجه‌ای شفاف
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100">
              با آزمون‌ایکس آزمون‌ها را بسازید، دانشجویان را همراهی کنید و
              نتایج را در همان لحظه ببینید.
            </p>
          </div>

          <ul className="mt-10 space-y-4">
            {[
              { icon: "clock" as const, text: "برگزاری زمان‌دار با ذخیره خودکار پاسخ‌ها" },
              { icon: "chart" as const, text: "نمره‌دهی خودکار و گزارش‌های دقیق" },
              { icon: "shield" as const, text: "پنل استاد و ورود دانشجو با لینک آزمون" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-xs text-blue-200">
            سامانه مدیریت و برگزاری آزمون‌های آنلاین
          </p>
        </section>

        <section className="p-6 sm:p-9">
          <div className="mb-6 text-center lg:text-right">
            <Link
              to="/"
              className="text-xl font-extrabold tracking-tight text-blue-900 lg:hidden"
            >
              Azmoon<span className="text-amber-500">ix</span>
            </Link>

            <h1 className="mt-3 text-2xl font-extrabold text-slate-800">
              {isRegister ? "ایجاد حساب کاربری" : "ورود به سامانه"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isRegister
                ? "این سامانه برای استادان است؛ برای عضویت، اطلاعات خود را تکمیل کنید."
                : "برای ادامه، نام کاربری و رمز عبور خود را وارد کنید. دانشجویان از لینک آزمون وارد می‌شوند."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "rounded-xl py-2.5 text-sm font-semibold transition",
                mode === "login"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              ورود
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "rounded-xl py-2.5 text-sm font-semibold transition",
                mode === "register"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              ثبت‌نام
            </button>
          </div>

          {formError ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {formError}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {isRegister ? (
              <>
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-600">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="مثلاً علی محمدی"
                    className={inputClass}
                    autoComplete="name"
                  />
                  <FieldError message={errors.name} />
                </div>

              </>
            ) : null}

            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-600">
                نام کاربری
              </label>
              <input
                id="username"
                value={form.username}
                onChange={(event) => update("username", event.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                className={inputClass}
                autoComplete="username"
              />
              <FieldError message={errors.username} />
            </div>

            {isRegister ? (
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-600">
                  ایمیل
                </label>
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="name@example.com"
                  className={cn(inputClass, "text-left")}
                  autoComplete="email"
                />
                <FieldError message={errors.email} />
              </div>
            ) : null}

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-600">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  className={cn(inputClass, "pl-12")}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? "پنهان" : "نمایش"}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            {isRegister ? (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-slate-600"
                >
                  تکرار رمز عبور
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => update("confirmPassword", event.target.value)}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  className={inputClass}
                  autoComplete="new-password"
                />
                <FieldError message={errors.confirmPassword} />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-700 to-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Spinner className="h-4 w-4 border-white/50 border-t-white" /> : null}
              {isRegister ? "ثبت‌نام در سامانه" : "ورود به سامانه"}
              {!submitting ? (
                <Icon name="arrowLeft" className="h-4 w-4 transition group-hover:-translate-x-1" />
              ) : null}
            </button>
          </form>

          {!isRegister ? (
            <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
              <p className="text-xs font-semibold text-blue-800">
                ورود سریع با حساب نمونه استاد
              </p>
              <p className="mt-1 text-[11px] leading-5 text-blue-600">
                این داده‌ها به‌صورت موقت در مرورگر ذخیره می‌شوند و با اتصال
                بک‌اند قابل جایگزینی هستند. دانشجویان حساب کاربری ندارند و فقط
                از لینک آزمون وارد می‌شوند.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillDemo}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50"
                >
                  پر کردن حساب استاد
                </button>
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-center text-xs text-slate-400">
            {isRegister ? "قبلاً حساب دارید؟" : "حساب کاربری ندارید؟"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? "login" : "register")}
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              {isRegister ? "وارد شوید" : "ثبت‌نام کنید"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
