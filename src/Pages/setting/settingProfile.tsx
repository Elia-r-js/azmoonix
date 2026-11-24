import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { ConfirmDialog, PageHeader, Spinner } from "../../components/ui";
import { Icon } from "../../components/Icons";
import { formatDate } from "../../lib/format";
import { cn } from "../../lib/utils";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function SettingProfile() {
  const { user, refresh, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!user) return null;

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (profile.name.trim().length < 3) {
      nextErrors.name = "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد.";
    }
    if (!/^[a-zA-Z0-9_]{3,}$/.test(profile.username.trim())) {
      nextErrors.username =
        "نام کاربری باید حداقل ۳ کاراکتر و شامل حروف انگلیسی، عدد یا _ باشد.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      nextErrors.email = "ایمیل وارد شده معتبر نیست.";
    }

    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingProfile(true);
    try {
      await api.profile.update(user.id, {
        name: profile.name,
        username: profile.username,
        email: profile.email,
      });
      await refresh();
      push("اطلاعات حساب ذخیره شد.", "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "ذخیره اطلاعات ناموفق بود.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!passwords.current) nextErrors.current = "رمز عبور فعلی را وارد کنید.";
    if (passwords.next.length < 6) {
      nextErrors.next = "رمز عبور جدید باید حداقل ۶ کاراکتر باشد.";
    }
    if (passwords.next !== passwords.confirm) {
      nextErrors.confirm = "تکرار رمز عبور جدید مطابقت ندارد.";
    }

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingPassword(true);
    try {
      await api.profile.changePassword(user.id, passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      push("رمز عبور با موفقیت تغییر کرد.", "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "تغییر رمز عبور ناموفق بود.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const resetDemo = async () => {
    setResetOpen(false);
    setResetting(true);
    try {
      await api.demo.reset();
      await logout();
      push("داده‌های نمونه بازنشانی شد. دوباره وارد شوید.", "info");
      navigate("/login", { replace: true });
    } catch (error) {
      push(error instanceof Error ? error.message : "بازنشانی داده‌ها ناموفق بود.", "error");
      setResetting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="تنظیمات حساب"
        description="اطلاعات شخصی و رمز عبور خود را مدیریت کنید."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Icon name="alert" className="h-4 w-4" />
        </span>
        <p className="text-xs leading-6 text-amber-800">
          در نسخه فعلی، داده‌ها به‌صورت موقت در حافظه مرورگر (localStorage) نگهداری
          می‌شوند و بین دستگاه‌ها همگام نمی‌شوند. پس از آماده‌شدن بک‌اند، این بخش
          به‌صورت خودکار به API واقعی متصل خواهد شد.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon name="user" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800">اطلاعات شخصی</h2>
                <p className="text-xs text-slate-400">نام، نام کاربری و ایمیل شما</p>
              </div>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={saveProfile} noValidate>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  نام و نام خانوادگی
                </label>
                <input
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                  className={cn(inputClass, profileErrors.name && "border-rose-300")}
                />
                {profileErrors.name ? (
                  <p className="mt-1 text-xs text-rose-500">{profileErrors.name}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  نام کاربری
                </label>
                <input
                  dir="ltr"
                  value={profile.username}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  className={cn(
                    inputClass,
                    "text-left",
                    profileErrors.username && "border-rose-300",
                  )}
                />
                {profileErrors.username ? (
                  <p className="mt-1 text-xs text-rose-500">{profileErrors.username}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  ایمیل
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, email: event.target.value }))
                  }
                  className={cn(
                    inputClass,
                    "text-left",
                    profileErrors.email && "border-rose-300",
                  )}
                />
                {profileErrors.email ? (
                  <p className="mt-1 text-xs text-rose-500">{profileErrors.email}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-70"
                >
                  {savingProfile ? <Spinner className="h-4 w-4 border-white/50 border-t-white" /> : null}
                  ذخیره اطلاعات
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800">تغییر رمز عبور</h2>
                <p className="text-xs text-slate-400">
                  برای امنیت بیشتر، رمز عبور دوره‌ای را تغییر دهید.
                </p>
              </div>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={savePassword} noValidate>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  رمز عبور فعلی
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      current: event.target.value,
                    }))
                  }
                  className={cn(inputClass, passwordErrors.current && "border-rose-300")}
                  autoComplete="current-password"
                />
                {passwordErrors.current ? (
                  <p className="mt-1 text-xs text-rose-500">{passwordErrors.current}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  رمز عبور جدید
                </label>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, next: event.target.value }))
                  }
                  className={cn(inputClass, passwordErrors.next && "border-rose-300")}
                  autoComplete="new-password"
                />
                {passwordErrors.next ? (
                  <p className="mt-1 text-xs text-rose-500">{passwordErrors.next}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  تکرار رمز عبور جدید
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      confirm: event.target.value,
                    }))
                  }
                  className={cn(inputClass, passwordErrors.confirm && "border-rose-300")}
                  autoComplete="new-password"
                />
                {passwordErrors.confirm ? (
                  <p className="mt-1 text-xs text-rose-500">{passwordErrors.confirm}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
                >
                  {savingPassword ? <Spinner className="h-4 w-4" /> : null}
                  تغییر رمز عبور
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-2xl font-extrabold text-white shadow-lg shadow-blue-200">
                {user.name.trim().charAt(0)}
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-800">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-400">@{user.username}</p>
              <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                استاد
              </span>
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">ایمیل</dt>
                <dd className="truncate text-slate-600" dir="ltr">
                  {user.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">تاریخ عضویت</dt>
                <dd className="text-slate-600">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">نقش کاربری</dt>
                <dd className="text-slate-600">
                  استاد
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Icon name="alert" className="h-5 w-5" />
              </span>
              <h2 className="text-base font-bold text-rose-800">بازنشانی داده‌های نمونه</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-rose-700">
              همه کاربران، آزمون‌ها و نتایج ساخته‌شده در این مرورگر پاک می‌شوند و
              داده‌های اولیه بازمی‌گردند. شما از حساب خارج می‌شوید.
            </p>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              disabled={resetting}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
            >
              {resetting ? <Spinner className="h-4 w-4 border-white/50 border-t-white" /> : null}
              بازنشانی داده‌ها
            </button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        danger
        title="بازنشانی داده‌های نمونه"
        message="تمام تغییرات شما در این مرورگر پاک می‌شود و داده‌های اولیه بازمی‌گردد. آیا مطمئن هستید؟"
        confirmLabel="بله، بازنشانی کن"
        onConfirm={() => void resetDemo()}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}
