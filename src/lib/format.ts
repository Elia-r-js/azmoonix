import type { ExamStatus } from "./types";

const numberFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatPercent(value: number) {
  return `${numberFormatter.format(Math.round(value))}٪`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${formatNumber(minutes)} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${formatNumber(hours)} ساعت`
    : `${formatNumber(hours)} ساعت و ${formatNumber(rest)} دقیقه`;
}

export function formatClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return toPersianDigits(`${pad(minutes)}:${pad(seconds)}`);
}

export function percentOf(score: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function isPassed(score: number, total: number) {
  return percentOf(score, total) >= 50;
}

export const EXAM_STATUS_LABEL: Record<ExamStatus, string> = {
  draft: "پیش‌نویس",
  active: "فعال",
  closed: "پایان‌یافته",
};

export function examStatusClass(status: ExamStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "closed") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

export function isFutureStart(startAt: string) {
  return new Date(startAt).getTime() > Date.now();
}

export function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function joinName(first: string, last: string) {
  return `${first} ${last}`.trim();
}
