"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ValidationError } from "yup";
import { authSchema } from "../../Utils/authschema";

export default function AuthPage() {
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const LoginIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await authSchema.validate(
        { username, password },
        { abortEarly: false }
      );

      setErrors({});
      navigate("/home");

    } catch (error) {
      if (error instanceof ValidationError) {
        const fieldErrors: typeof errors = {};

        error.inner.forEach((err) => {
          if (err.path === "username" || err.path === "password") {
            fieldErrors[err.path] = err.message;
          }
        });

        setErrors(fieldErrors);
      }
    }

  }


  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#edf6ff] px-4 py-10"
    >
      {/* Background decorations */}
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" />

      {/* Auth Card */}
      <section className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_20px_70px_rgba(59,130,246,0.15)] backdrop-blur-xl sm:p-9">
        {/* Logo */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <path d="M12 3 1 8.5 12 14l9-4.5V16h2V8.5L12 3Zm-7 9.5V17c3.5 3.5 8.5 3.5 14 0v-4.5l-7 3.5-7-3.5Z" />
            </svg>
          </div>

          <h1 className="font-jakarta text-3xl font-extrabold tracking-tight text-blue-900">
            azmoonix
          </h1>

          <p className="mt-2 text-sm text-slate-500 font-vazirMatn">
            سامانه آنلاین آزمون دانشگاهی
          </p>

          <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-blue-300" />
        </header>

        {/* Welcome */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-blue-900 font-vazirMatn">
            {isSignUp ? "ایجاد حساب کاربری" : "خوش آمدید!"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isSignUp
              ? "برای عضویت در سامانه، اطلاعات خود را وارد کنید."
              : "برای ورود به سامانه، اطلاعات خود را وارد کنید."}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={LoginIn}>
          {isSignUp && (
            <input
              type="text"
              placeholder="نام و نام خانوادگی"
              className="w-full rounded-2xl border border-blue-100 bg-white/70 px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          )}

          <input
            type="text"
            placeholder="نام کاربری"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-white/70 px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">
              {errors.username}
            </p>
          )}

          {isSignUp && (
            <input
              type="email"
              placeholder="ایمیل"
              className="w-full rounded-2xl border border-blue-100 bg-white/70 px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          )}

          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-white/70 px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password}
            </p>
          )}

          {!isSignUp && (
            <div className="text-left">
              <a
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:text-blue-800 font-vazirMatn"
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </a>
            </div>
          )}
          {/* Submit */}
          <button
            type="submit"
            className=" font-vazirMatn group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-blue-600 to-sky-500 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            {isSignUp ? "ثبت‌نام در سامانه" : "ورود به سامانه"}

            <span className="transition group-hover:-translate-x-1">
              ←
            </span>
          </button>
        </form>

        {/* Sign in / Sign up switch */}
        <div className="mt-6 border-t border-blue-100 pt-5 text-center">
          <p className="text-sm text-slate-500">
            {isSignUp ? "قبلاً حساب کاربری ساخته‌اید؟" : "حساب کاربری ندارید؟"}

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mr-2 font-bold text-blue-600 transition hover:text-blue-800 "
            >
              {isSignUp ? "ورود" : "ثبت‌نام"}
            </button>
          </p>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-400">
          سامانه مدیریت و برگزاری آزمون‌های آنلاین
        </footer>
      </section>
    </main>
  );
}
