import type {
  Attempt,
  Database,
  Draft,
  Exam,
  Question,
  StoredUser,
} from "./types";

const DB_KEY = "azmoonix:db:v1";
const SESSION_KEY = "azmoonix:session:v1";
const DRAFT_PREFIX = "azmoonix:draft:v1";

const DB_VERSION = 2;

function question(
  id: string,
  text: string,
  options: string[],
  correctIndex: number,
  points = 1,
): Question {
  return { id, text, options, correctIndex, points };
}

function buildSeed(): Database {
  const now = Date.now();
  const iso = (timestamp: number) => new Date(timestamp).toISOString();
  const hoursAgo = (hours: number) => iso(now - hours * 3_600_000);
  const daysAgo = (days: number) => iso(now - days * 86_400_000);
  const daysFromNow = (days: number) => iso(now + days * 86_400_000);

  const users: StoredUser[] = [
    {
      id: "u-teacher",
      name: "استاد سارا محمدی",
      username: "teacher",
      email: "teacher@azmoonix.ir",
      role: "teacher",
      password: "123456",
      createdAt: daysAgo(90),
    },
  ];

  const exams: Exam[] = [
    {
      id: "e-data-structures",
      publicToken: "DS2026AB",
      teacherId: "u-teacher",
      title: "آزمون ساختمان داده",
      subject: "مهندسی کامپیوتر",
      description:
        "آزمون میان‌ترم ساختمان داده شامل پشته، صف، درخت جستجوی دودویی و پیچیدگی الگوریتم‌ها.",
      durationMinutes: 30,
      startAt: hoursAgo(2),
      status: "active",
      createdAt: daysAgo(10),
      questions: [
        question(
          "q-ds-1",
          "کدام ساختار داده از نوع LIFO (آخرین ورودی، اولین خروجی) است؟",
          ["صف", "پشته", "درخت", "گراف"],
          1,
        ),
        question(
          "q-ds-2",
          "پیچیدگی زمانی جستجو در یک درخت جستجوی دودویی متعادل چیست؟",
          ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          1,
        ),
        question(
          "q-ds-3",
          "کدام ساختار داده برای پیمایش سطح‌به‌سطح (BFS) گراف مناسب است؟",
          ["پشته", "صف", "درخت", "هیچ‌کدام"],
          1,
        ),
        question(
          "q-ds-4",
          "در یک درخت دودویی کامل با ارتفاع h، حداکثر تعداد گره‌ها کدام است؟",
          ["2^h", "2^(h+1) - 1", "h^2", "2h"],
          1,
          2,
        ),
        question(
          "q-ds-5",
          "عملیات درج در ابتدای یک آرایه چه پیچیدگی زمانی دارد؟",
          ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
          2,
        ),
      ],
    },
    {
      id: "e-web",
      publicToken: "WEB2026X",
      teacherId: "u-teacher",
      title: "آزمون برنامه‌نویسی وب",
      subject: "مهندسی نرم‌افزار",
      description:
        "ارزیابی مفاهیم پایه HTML، CSS، JavaScript و React برای دانشجویان برنامه‌نویسی وب.",
      durationMinutes: 25,
      startAt: hoursAgo(1),
      status: "active",
      createdAt: daysAgo(8),
      questions: [
        question(
          "q-web-1",
          "کدام Hook در React برای مدیریت وضعیت محلی یک کامپوننت استفاده می‌شود؟",
          ["useState", "useEffect", "useRef", "useMemo"],
          0,
        ),
        question(
          "q-web-2",
          "در CSS کدام ویژگی برای چیدمان یک‌بعدی (ردیفی یا ستونی) مناسب‌تر است؟",
          ["grid", "flex", "position", "float"],
          1,
        ),
        question(
          "q-web-3",
          "کدام متد آرایه در JavaScript یک آرایه جدید برمی‌گرداند؟",
          ["push", "pop", "map", "splice"],
          2,
        ),
        question(
          "q-web-4",
          "تگ معنایی مناسب برای نوار ناوبری اصلی صفحه کدام است؟",
          ["<div>", "<nav>", "<section>", "<span>"],
          1,
        ),
      ],
    },
    {
      id: "e-math",
      publicToken: "MATH26AB",
      teacherId: "u-teacher",
      title: "آزمون ریاضی عمومی",
      subject: "ریاضی",
      description:
        "آزمون پایان‌ترم ریاضی عمومی ۱ شامل مشتق، حد، انتگرال و جبر خطی.",
      durationMinutes: 40,
      startAt: daysAgo(9),
      status: "closed",
      createdAt: daysAgo(20),
      questions: [
        question(
          "q-math-1",
          "حاصل مشتق تابع f(x) = x³ در نقطه x = 2 کدام است؟",
          ["۶", "۱۲", "۸", "۴"],
          1,
        ),
        question(
          "q-math-2",
          "مقدار حد (x² - 1) / (x - 1) وقتی x به ۱ میل می‌کند چیست؟",
          ["۰", "۱", "۲", "بی‌نهایت"],
          2,
        ),
        question(
          "q-math-3",
          "اگر A یک ماتریس ۲×۲ با دترمینان صفر باشد، کدام گزینه صحیح است؟",
          ["A وارون‌پذیر است", "A وارون‌پذیر نیست", "A قطری است", "A متقارن است"],
          1,
        ),
        question(
          "q-math-4",
          "انتگرال نامعین 2x dx کدام است؟",
          ["x² + C", "2x² + C", "x + C", "2 + C"],
          0,
        ),
        question(
          "q-math-5",
          "مجموع زوایای داخلی یک پنج‌ضلعی چند درجه است؟",
          ["۳۶۰", "۵۴۰", "۷۲۰", "۱۸۰"],
          1,
        ),
      ],
    },
    {
      id: "e-networks",
      publicToken: "NET26ABC",
      teacherId: "u-teacher",
      title: "آزمون شبکه‌های کامپیوتری",
      subject: "مهندسی کامپیوتر",
      description:
        "آزمون کوتاه شبکه شامل مدل OSI، پروتکل‌های لایه کاربرد و پورت‌های استاندارد.",
      durationMinutes: 35,
      startAt: daysAgo(4),
      status: "closed",
      createdAt: daysAgo(14),
      questions: [
        question(
          "q-net-1",
          "کدام پروتکل برای ترجمه نام دامنه به آدرس IP استفاده می‌شود؟",
          ["DHCP", "DNS", "FTP", "SMTP"],
          1,
        ),
        question(
          "q-net-2",
          "پورت پیش‌فرض پروتکل HTTPS کدام است؟",
          ["80", "443", "21", "25"],
          1,
        ),
        question(
          "q-net-3",
          "کدام لایه از مدل OSI وظیفه مسیریابی بسته‌ها را بر عهده دارد؟",
          ["لایه پیوند داده", "لایه شبکه", "لایه انتقال", "لایه کاربرد"],
          1,
        ),
      ],
    },
    {
      id: "e-database",
      publicToken: "DB26ABCD",
      teacherId: "u-teacher",
      title: "آزمون پایگاه داده",
      subject: "مهندسی کامپیوتر",
      description:
        "آزمون پیش‌روی پایگاه داده شامل دستورات SQL، نرمال‌سازی و مدل رابطه‌ای.",
      durationMinutes: 30,
      startAt: daysFromNow(3),
      status: "draft",
      createdAt: daysAgo(2),
      questions: [
        question(
          "q-db-1",
          "کدام دستور SQL برای بازیابی داده‌ها از جدول استفاده می‌شود؟",
          ["SELECT", "INSERT", "UPDATE", "DELETE"],
          0,
        ),
        question(
          "q-db-2",
          "کدام کلید به‌طور یکتا هر ردیف یک جدول را مشخص می‌کند؟",
          ["کلید خارجی", "کلید اصلی", "کلید نامزد", "ایندکس"],
          1,
        ),
        question(
          "q-db-3",
          "هدف اصلی نرمال‌سازی پایگاه داده چیست؟",
          ["افزایش افزونگی داده", "کاهش افزونگی و ناهنجاری", "حذف ایندکس‌ها", "کاهش امنیت"],
          1,
        ),
      ],
    },
  ];

  const attempts: Attempt[] = [
    {
      id: "a-ds-reza",
      examId: "e-data-structures",
      studentName: "رضا احمدی",
      studentNumber: "0012345678",
      answers: {
        "q-ds-1": 1,
        "q-ds-2": 1,
        "q-ds-3": 0,
        "q-ds-4": 1,
        "q-ds-5": 0,
      },
      score: 4,
      total: 6,
      startedAt: hoursAgo(6),
      submittedAt: hoursAgo(5),
    },
    {
      id: "a-ds-sara",
      examId: "e-data-structures",
      studentName: "سارا کریمی",
      studentNumber: "0012345679",
      answers: {
        "q-ds-1": 1,
        "q-ds-2": 1,
        "q-ds-3": 1,
        "q-ds-4": 1,
        "q-ds-5": 2,
      },
      score: 6,
      total: 6,
      startedAt: hoursAgo(7),
      submittedAt: hoursAgo(6),
    },
    {
      id: "a-math-ali",
      examId: "e-math",
      studentName: "علی محمدی",
      studentNumber: "0012345680",
      answers: {
        "q-math-1": 1,
        "q-math-2": 2,
        "q-math-3": 0,
        "q-math-4": 0,
        "q-math-5": 0,
      },
      score: 3,
      total: 5,
      startedAt: daysAgo(9),
      submittedAt: daysAgo(9),
    },
    {
      id: "a-math-reza",
      examId: "e-math",
      studentName: "رضا احمدی",
      studentNumber: "0012345678",
      answers: {
        "q-math-1": 1,
        "q-math-2": 0,
        "q-math-3": 1,
        "q-math-4": 0,
        "q-math-5": 0,
      },
      score: 2,
      total: 5,
      startedAt: daysAgo(8),
      submittedAt: daysAgo(8),
    },
    {
      id: "a-math-sara",
      examId: "e-math",
      studentName: "سارا کریمی",
      studentNumber: "0012345679",
      answers: {
        "q-math-1": 1,
        "q-math-2": 2,
        "q-math-3": 1,
        "q-math-4": 0,
        "q-math-5": 1,
      },
      score: 5,
      total: 5,
      startedAt: daysAgo(8),
      submittedAt: daysAgo(8),
    },
    {
      id: "a-math-mahdi",
      examId: "e-math",
      studentName: "مهدی رضایی",
      studentNumber: "0012345681",
      answers: {
        "q-math-1": 0,
        "q-math-2": 0,
        "q-math-3": 0,
        "q-math-4": 0,
        "q-math-5": 0,
      },
      score: 1,
      total: 5,
      startedAt: daysAgo(7),
      submittedAt: daysAgo(7),
    },
    {
      id: "a-net-ali",
      examId: "e-networks",
      studentName: "علی محمدی",
      studentNumber: "0012345680",
      answers: {
        "q-net-1": 1,
        "q-net-2": 0,
        "q-net-3": 1,
      },
      score: 2,
      total: 3,
      startedAt: daysAgo(4),
      submittedAt: daysAgo(4),
    },
    {
      id: "a-net-sara",
      examId: "e-networks",
      studentName: "سارا کریمی",
      studentNumber: "0012345679",
      answers: {
        "q-net-1": 1,
        "q-net-2": 1,
        "q-net-3": 1,
      },
      score: 3,
      total: 3,
      startedAt: daysAgo(4),
      submittedAt: daysAgo(4),
    },
  ];

  return { version: DB_VERSION, users, exams, attempts };
}

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function writeDatabase(database: Database) {
  if (!hasStorage()) return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(database));
}

export function getDatabase(): Database {
  if (!hasStorage()) return buildSeed();

  const raw = window.localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Database;
      if (parsed.version === DB_VERSION && Array.isArray(parsed.users)) {
        return parsed;
      }
    } catch {
      // corrupted data: fall through and reseed
    }
  }

  const seeded = buildSeed();
  writeDatabase(seeded);
  return seeded;
}

/**
 * Temporary persistence layer. Every write goes through here so the whole
 * data layer can be replaced with real HTTP calls without touching the UI.
 */
export function mutateDatabase<T>(mutator: (database: Database) => T): T {
  const database = getDatabase();
  const result = mutator(database);
  writeDatabase(database);
  return result;
}

export function resetDatabase() {
  if (!hasStorage()) return;
  writeDatabase(buildSeed());
  window.localStorage.removeItem(SESSION_KEY);
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(DRAFT_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
}

export function getSessionUserId(): string | null {
  if (!hasStorage()) return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId: string) {
  if (!hasStorage()) return;
  window.localStorage.setItem(SESSION_KEY, userId);
}

export function clearSessionUserId() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

function draftKey(examId: string, studentNumber: string) {
  return `${DRAFT_PREFIX}:${examId}:${studentNumber}`;
}

export function readDraft(examId: string, studentNumber: string): Draft | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(draftKey(examId, studentNumber));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Draft;
    if (!parsed.startedAt || typeof parsed.answers !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(examId: string, studentNumber: string, draft: Draft) {
  if (!hasStorage()) return;
  window.localStorage.setItem(draftKey(examId, studentNumber), JSON.stringify(draft));
}

export function removeDraft(examId: string, studentNumber: string) {
  if (!hasStorage()) return;
  window.localStorage.removeItem(draftKey(examId, studentNumber));
}

export function removeDraftsForExam(examId: string) {
  if (!hasStorage()) return;
  const prefix = `${DRAFT_PREFIX}:${examId}:`;
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => window.localStorage.removeItem(key));
}
