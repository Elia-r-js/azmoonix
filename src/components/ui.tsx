import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { EXAM_STATUS_LABEL, examStatusClass, formatPercent } from "../lib/format";
import type { ExamStatus } from "../lib/types";
import { Icon } from "./Icons";
import type { IconName } from "./Icons";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

const statTones = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone = "blue",
  icon = "chart",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: keyof typeof statTones;
  icon?: IconName;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{value}</p>
          {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            statTones[tone],
          )}
        >
          <Icon name={icon} />
        </span>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: ExamStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
        examStatusClass(status),
      )}
    >
      {EXAM_STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = "clipboard",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-700">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function PageLoader({ label = "در حال بارگذاری..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <Spinner className="h-8 w-8" />
      <p>{label}</p>
    </div>
  );
}

export function ScoreBar({ percent }: { percent: number }) {
  const safe = Math.min(100, Math.max(0, percent));
  const color =
    safe >= 75 ? "bg-emerald-500" : safe >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full min-w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${safe}%` }} />
      </div>
      <span className="w-10 shrink-0 text-left text-xs font-semibold text-slate-600">
        {formatPercent(safe)}
      </span>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تایید",
  cancelLabel = "انصراف",
  onConfirm,
  onClose,
  danger = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              danger ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600",
            )}
          >
            <Icon name={danger ? "alert" : "shield"} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
              danger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
