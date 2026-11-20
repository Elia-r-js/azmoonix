
import { useState } from "react";

export default function CreateExam() {
  const [importType, setImportType] = useState<"manual" | "excel">("manual");
  const [file, setFile] = useState<File | null>(null);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-7">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            ایجاد آزمون جدید
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            اطلاعات آزمون را وارد کنید و سؤالات خود را اضافه کنید.
          </p>
        </div>

        {/* Exam information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-800">
            اطلاعات آزمون
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                عنوان آزمون
              </label>
              <input
                type="text"
                placeholder="مثلاً آزمون میان‌ترم برنامه‌نویسی"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                درس
              </label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500">
                <option value="">انتخاب درس</option>
                <option>برنامه‌نویسی</option>
                <option>ساختمان داده</option>
                <option>پایگاه داده</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                تاریخ شروع
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                مدت آزمون (دقیقه)
              </label>
              <input
                type="number"
                min="1"
                placeholder="مثلاً ۶۰"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              افزودن سؤالات
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              روش افزودن سؤالات آزمون را انتخاب کنید.
            </p>
          </div>

          {/* Import tabs */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setImportType("manual")}
              className={`rounded-xl border p-4 text-sm font-semibold transition ${
                importType === "manual"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              ✏️ افزودن دستی سؤال
            </button>

            <button
              type="button"
              onClick={() => setImportType("excel")}
              className={`rounded-xl border p-4 text-sm font-semibold transition ${
                importType === "excel"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              📊 بارگذاری فایل Excel
            </button>
          </div>

          {/* Manual question */}
          {importType === "manual" && (
            <div className="space-y-4">
              <textarea
                rows={3}
                placeholder="متن سؤال را وارد کنید..."
                className="w-full resize-none rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500"
              />

              <div className="grid gap-3 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <input
                    key={item}
                    placeholder={`گزینه ${item}`}
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                ))}
              </div>

              <button
                type="button"
                className="rounded-xl bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                + افزودن سؤال
              </button>
            </div>
          )}

          {/* Excel upload */}
          {importType === "excel" && (
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
              <div className="mb-4 text-4xl">📁</div>

              <h3 className="font-bold text-slate-700">
                فایل سؤالات خود را بارگذاری کنید
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                فرمت‌های مجاز: XLSX، XLS و CSV
              </p>

              <label className="mt-5 inline-flex cursor-pointer items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                انتخاب فایل
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>

              {file && (
                <div className="mx-auto mt-5 max-w-md rounded-xl border border-blue-100 bg-white p-4 text-right">
                  <p className="break-all text-sm font-semibold text-slate-700">
                    📄 {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-2 text-xs text-red-500"
                  >
                    حذف فایل
                  </button>
                </div>
              )}

              <p className="mt-5 text-xs text-slate-400">
                قبل از بارگذاری، فایل را مطابق قالب استاندارد سؤالات آماده کنید.
              </p>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            ذخیره پیش‌نویس
          </button>

          <button
            type="button"
            className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            ایجاد آزمون
          </button>
        </div>

      </div>
    </main>
  );
}
