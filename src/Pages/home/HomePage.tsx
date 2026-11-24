import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Icon } from "../../components/Icons";
import { formatNumber } from "../../lib/format";
import type { IconName } from "../../components/Icons";

const features: Array<{ title: string; description: string; icon: IconName }> = [
  {
    title: "مدیریت کامل آزمون‌ها",
    description: "ساخت، ویرایش، انتشار و بایگانی آزمون‌ها در یک پنل ساده و یکپارچه.",
    icon: "list",
  },
  {
    title: "برگزاری با تایمر هوشمند",
    description: "دانشجو آزمون را در زمان مشخص می‌بیند و پاسخ‌ها به‌صورت خودکار ذخیره می‌شوند.",
    icon: "clock",
  },
  {
    title: "تصحیح و تحلیل آنی",
    description: "نمره‌دهی خودکار، نمایش درصد قبولی و گزارش عملکرد در لحظه.",
    icon: "chart",
  },
  {
    title: "لینک اختصاصی هر آزمون",
    description: "لینک آزمون را برای دانشجویان بفرستید؛ ورود فقط با نام و شماره دانشجویی است.",
    icon: "shield",
  },
  {
    title: "سؤالات چندگزینه‌ای",
    description: "افزودن دستی سؤال و گزینه‌ها همراه با تعیین پاسخ صحیح و بارم.",
    icon: "clipboard",
  },
  {
    title: "تجربه واکنش‌گرا",
    description: "استفاده راحت از سامانه روی موبایل، تبلت و کامپیوتر.",
    icon: "spark",
  },
];

const steps = [
  "استاد وارد پنل می‌شود و آزمون را می‌سازد.",
  "لینک اختصاصی آزمون را برای دانشجویان می‌فرستد.",
  "دانشجو با نام و شماره دانشجویی وارد آزمون می‌شود.",
  "نتیجه بلافاصله پس از ثبت نمایش داده می‌شود.",
];

export default function HomePage() {
  const { user } = useAuth();
  const dashboardPath = user ? "/teacher" : "/login";

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-[#f4f9ff] text-slate-800">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-blue-900">
          Azmoon<span className="text-amber-500">ix</span>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="#features"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 sm:block"
          >
            امکانات
          </a>
          <a
            href="#how-it-works"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 sm:block"
          >
            نحوه کار
          </a>
          <Link
            to={dashboardPath}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            {user ? "ورود به داشبورد" : "ورود به سامانه"}
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-24 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Icon name="spark" className="h-4 w-4" />
            سامانه آنلاین برگزاری آزمون دانشگاهی
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.25] text-slate-900 sm:text-5xl">
            آزمون‌هایتان را
            <span className="text-blue-600"> هوشمند </span>
            برگزار کنید
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            آزمون‌ایکس محیطی ساده و مدرن برای ساخت آزمون و ارسال لینک آن به
            دانشجویان است. دانشجو فقط با نام و شماره دانشجویی وارد می‌شود و
            نتیجه را بلافاصله می‌بیند؛ بدون ساخت حساب، بدون کاغذ.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-blue-700 to-sky-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {user ? "رفتن به داشبورد" : "شروع کنید"}
              <Icon name="arrowLeft" className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              نحوه کار سامانه
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              { value: "لینک", label: "ورود بدون حساب" },
              { value: "۲۴/۷", label: "دسترسی آنلاین" },
              { value: "فارسی", label: "رابط کاملاً بومی" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white bg-white/70 px-4 py-4 text-center shadow-sm backdrop-blur"
              >
                <dt className="text-lg font-extrabold text-blue-700">{item.value}</dt>
                <dd className="mt-1 text-xs text-slate-500">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -right-4 -top-4 h-full w-full rounded-[2rem] bg-blue-200/40" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-[0_25px_80px_rgba(37,99,235,0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">آزمون در حال برگزاری</p>
                <h2 className="mt-1 text-lg font-bold text-slate-800">ساختمان داده</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                فعال
              </span>
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-l from-blue-700 to-sky-500 p-5 text-white">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-100">زمان باقی‌مانده</span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Icon name="clock" className="h-4 w-4" />
                  ۲۴:۱۸
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
                <div className="h-full w-2/3 rounded-full bg-white" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "کدام ساختار داده LIFO است؟",
                "پیچیدگی جستجو در BST متعادل؟",
                "پیمایش سطح‌به‌سطح با کدام ساختار؟",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                    {formatNumber(index + 1)}
                  </span>
                  <p className="text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs text-slate-500">پیشرفت پاسخ‌دهی</span>
              <span className="text-sm font-bold text-blue-700">۳ از ۵</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            همه‌چیز برای یک آزمون بی‌دغدغه
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            از ساخت سؤال تا اعلام نتیجه، ابزارهای لازم در یک سامانه یکپارچه گرد
            آمده‌اند.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <Icon name={feature.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-800">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-l from-blue-800 to-sky-600 p-8 text-white sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">در چهار قدم ساده</h2>
              <p className="mt-3 text-sm leading-7 text-blue-100">
                ساخت آزمون، ارسال لینک، شرکت دانشجو و دیدن نتیجه؛ به همین سادگی.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                همین حالا شروع کنید
                <Icon name="arrowLeft" className="h-4 w-4" />
              </Link>
            </div>

            <ol className="grid gap-3">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-blue-700">
                    {formatNumber(index + 1)}
                  </span>
                  <span className="text-sm text-blue-50">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-slate-400 sm:flex-row">
        <p>© آزمون‌ایکس — سامانه برگزاری و مدیریت آزمون آنلاین</p>
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800">
          ورود به سامانه
        </Link>
      </footer>
    </main>
  );
}
