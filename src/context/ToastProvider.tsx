import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn, uid } from "../lib/utils";
import { ToastContext } from "./toast-context";
import type { ToastItem, ToastType } from "./toast-context";

const styles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = uid("toast");
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed left-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg shadow-slate-200/60",
              styles[toast.type],
            )}
          >
            <span className="leading-6">{toast.message}</span>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="text-lg leading-none opacity-60 transition hover:opacity-100"
              aria-label="بستن"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
