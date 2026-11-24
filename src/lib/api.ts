import {
  clearSessionUserId,
  getDatabase,
  getSessionUserId,
  mutateDatabase,
  readDraft,
  removeDraft,
  removeDraftsForExam,
  resetDatabase,
  setSessionUserId,
  writeDraft,
} from "./storage";
import { formatNumber, percentOf } from "./format";
import {
  createPublicToken,
  normalizeFullName,
  normalizeStudentNumber,
  uid,
} from "./utils";
import type {
  Attempt,
  Database,
  Draft,
  Exam,
  ExamInput,
  ExamSummary,
  ProfileInput,
  PublicExam,
  Question,
  RegisterInput,
  ResultRow,
  StoredUser,
  SubmitAttemptInput,
  TeacherStats,
  User,
} from "./types";

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function findUserByUsername(db: Database, username: string) {
  const normalized = normalizeUsername(username);
  return db.users.find((user) => normalizeUsername(user.username) === normalized);
}

function getPublicUserById(userId: string): User | null {
  const user = getDatabase().users.find((item) => item.id === userId);
  return user ? toPublicUser(user) : null;
}

function requireExam(examId: string): Exam {
  const exam = getDatabase().exams.find((item) => item.id === examId);
  if (!exam) throw new Error("آزمون موردنظر پیدا نشد.");
  return exam;
}

function requireExamByToken(token: string): Exam {
  const exam = getDatabase().exams.find((item) => item.publicToken === token);
  if (!exam) {
    throw new Error("آزمون موردنظر پیدا نشد یا لینک آن معتبر نیست.");
  }
  return exam;
}

function toPublicExam(exam: Exam): PublicExam {
  return {
    ...exam,
    questions: exam.questions.map(({ id, text, options, points }) => ({
      id,
      text,
      options,
      points,
    })),
  };
}

function uniquePublicToken(db: Database) {
  let token = createPublicToken();
  while (db.exams.some((exam) => exam.publicToken === token)) {
    token = createPublicToken();
  }
  return token;
}

function normalizeQuestions(questions: ExamInput["questions"]): Question[] {
  return questions.map((item) => ({
    id: item.id ?? uid("q"),
    text: item.text.trim(),
    options: item.options.map((option) => option.trim()),
    correctIndex: item.correctIndex,
    points: item.points > 0 ? item.points : 1,
  }));
}

function validateExamInput(input: ExamInput) {
  if (!input.title.trim()) throw new Error("عنوان آزمون را وارد کنید.");
  if (!input.subject.trim()) throw new Error("درس آزمون را وارد کنید.");
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("مدت آزمون باید بیشتر از صفر باشد.");
  }
  if (input.questions.length === 0) {
    throw new Error("حداقل یک سؤال برای آزمون اضافه کنید.");
  }

  input.questions.forEach((question, index) => {
    if (!question.text.trim()) {
      throw new Error(`متن سؤال ${formatNumber(index + 1)} خالی است.`);
    }
    if (question.options.length < 2 || question.options.some((option) => !option.trim())) {
      throw new Error(`گزینه‌های سؤال ${formatNumber(index + 1)} را کامل کنید.`);
    }
    if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
      throw new Error(`پاسخ صحیح سؤال ${formatNumber(index + 1)} را مشخص کنید.`);
    }
  });
}

function summarizeExam(exam: Exam): ExamSummary {
  const attempts = getDatabase().attempts.filter(
    (attempt) => attempt.examId === exam.id,
  );
  const participantCount = new Set(attempts.map((attempt) => attempt.studentNumber))
    .size;
  const averagePercent =
    attempts.length === 0
      ? 0
      : attempts.reduce(
          (sum, attempt) => sum + percentOf(attempt.score, attempt.total),
          0,
        ) / attempts.length;

  return {
    exam,
    questionCount: exam.questions.length,
    totalPoints: exam.questions.reduce((sum, question) => sum + question.points, 0),
    participantCount,
    averagePercent,
  };
}

function buildResultRows(attempts: Attempt[]): ResultRow[] {
  const db = getDatabase();
  const rows: ResultRow[] = [];

  attempts.forEach((attempt) => {
    const exam = db.exams.find((item) => item.id === attempt.examId);
    if (!exam) return;
    rows.push({ attempt, exam });
  });

  return rows.sort(
    (first, second) =>
      new Date(second.attempt.submittedAt).getTime() -
      new Date(first.attempt.submittedAt).getTime(),
  );
}

export const api = {
  auth: {
    async login(username: string, password: string): Promise<User> {
      const db = getDatabase();
      const user = findUserByUsername(db, username);
      if (!user || user.password !== password) {
        throw new Error("نام کاربری یا رمز عبور اشتباه است.");
      }
      setSessionUserId(user.id);
      return toPublicUser(user);
    },

    async register(input: RegisterInput): Promise<User> {
      const result = mutateDatabase((db) => {
        if (findUserByUsername(db, input.username)) {
          throw new Error("این نام کاربری قبلاً ثبت شده است.");
        }
        if (
          db.users.some(
            (user) => user.email.toLowerCase() === input.email.trim().toLowerCase(),
          )
        ) {
          throw new Error("این ایمیل قبلاً ثبت شده است.");
        }

        const user: StoredUser = {
          id: uid("u"),
          name: input.name.trim(),
          username: input.username.trim(),
          email: input.email.trim(),
          role: "teacher",
          password: input.password,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        return user;
      });

      setSessionUserId(result.id);
      return toPublicUser(result);
    },

    async me(): Promise<User | null> {
      const userId = getSessionUserId();
      if (!userId) return null;
      const user = getPublicUserById(userId);
      if (!user) clearSessionUserId();
      return user;
    },

    async logout(): Promise<void> {
      clearSessionUserId();
    },
  },

  profile: {
    async update(userId: string, input: ProfileInput): Promise<User> {
      return mutateDatabase((db) => {
        const user = db.users.find((item) => item.id === userId);
        if (!user) throw new Error("کاربر پیدا نشد.");

        const normalized = normalizeUsername(input.username);
        const duplicate = db.users.find(
          (item) => item.id !== userId && normalizeUsername(item.username) === normalized,
        );
        if (duplicate) throw new Error("این نام کاربری قبلاً ثبت شده است.");

        user.name = input.name.trim();
        user.username = input.username.trim();
        user.email = input.email.trim();
        return toPublicUser(user);
      });
    },

    async changePassword(userId: string, currentPassword: string, nextPassword: string) {
      mutateDatabase((db) => {
        const user = db.users.find((item) => item.id === userId);
        if (!user) throw new Error("کاربر پیدا نشد.");
        if (user.password !== currentPassword) {
          throw new Error("رمز عبور فعلی صحیح نیست.");
        }
        if (nextPassword.length < 6) {
          throw new Error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
        }
        user.password = nextPassword;
      });
    },
  },

  exams: {
    async listForTeacher(teacherId: string): Promise<ExamSummary[]> {
      const db = getDatabase();
      return db.exams
        .filter((exam) => exam.teacherId === teacherId)
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        )
        .map((exam) => summarizeExam(exam));
    },

    async get(examId: string): Promise<Exam> {
      return requireExam(examId);
    },

    async create(teacherId: string, input: ExamInput): Promise<Exam> {
      validateExamInput(input);
      return mutateDatabase((db) => {
        const exam: Exam = {
          id: uid("e"),
          publicToken: uniquePublicToken(db),
          teacherId,
          title: input.title.trim(),
          subject: input.subject.trim(),
          description: input.description.trim(),
          durationMinutes: input.durationMinutes,
          startAt: input.startAt,
          status: input.status,
          questions: normalizeQuestions(input.questions),
          createdAt: new Date().toISOString(),
        };
        db.exams.push(exam);
        return exam;
      });
    },

    async update(examId: string, teacherId: string, input: ExamInput): Promise<Exam> {
      validateExamInput(input);
      return mutateDatabase((db) => {
        const exam = db.exams.find((item) => item.id === examId);
        if (!exam) throw new Error("آزمون موردنظر پیدا نشد.");
        if (exam.teacherId !== teacherId) {
          throw new Error("شما به این آزمون دسترسی ندارید.");
        }

        exam.title = input.title.trim();
        exam.subject = input.subject.trim();
        exam.description = input.description.trim();
        exam.durationMinutes = input.durationMinutes;
        exam.startAt = input.startAt;
        exam.status = input.status;
        exam.questions = normalizeQuestions(input.questions);
        return exam;
      });
    },

    async setStatus(examId: string, teacherId: string, status: Exam["status"]) {
      mutateDatabase((db) => {
        const exam = db.exams.find((item) => item.id === examId);
        if (!exam) throw new Error("آزمون موردنظر پیدا نشد.");
        if (exam.teacherId !== teacherId) {
          throw new Error("شما به این آزمون دسترسی ندارید.");
        }
        exam.status = status;
      });
    },

    async regeneratePublicToken(examId: string, teacherId: string) {
      return mutateDatabase((db) => {
        const exam = db.exams.find((item) => item.id === examId);
        if (!exam) throw new Error("آزمون موردنظر پیدا نشد.");
        if (exam.teacherId !== teacherId) {
          throw new Error("شما به این آزمون دسترسی ندارید.");
        }
        exam.publicToken = uniquePublicToken(db);
        return exam.publicToken;
      });
    },

    async remove(examId: string, teacherId: string) {
      mutateDatabase((db) => {
        const exam = db.exams.find((item) => item.id === examId);
        if (!exam) throw new Error("آزمون موردنظر پیدا نشد.");
        if (exam.teacherId !== teacherId) {
          throw new Error("شما به این آزمون دسترسی ندارید.");
        }
        db.exams = db.exams.filter((item) => item.id !== examId);
        db.attempts = db.attempts.filter((attempt) => attempt.examId !== examId);
      });
      removeDraftsForExam(examId);
    },
  },

  publicExams: {
    async getByToken(token: string): Promise<PublicExam> {
      return toPublicExam(requireExamByToken(token));
    },

    async getPreviewByToken(token: string, teacherId: string): Promise<Exam> {
      const exam = requireExamByToken(token);
      if (exam.teacherId !== teacherId) {
        throw new Error("این لینک آزمون به استاد دیگری تعلق دارد.");
      }
      return exam;
    },
  },

  attempts: {
    async getForParticipant(
      examId: string,
      studentNumber: string,
    ): Promise<Attempt | null> {
      const normalized = normalizeStudentNumber(studentNumber);
      return (
        getDatabase().attempts.find(
          (attempt) =>
            attempt.examId === examId && attempt.studentNumber === normalized,
        ) ?? null
      );
    },

    async getDraft(examId: string, studentNumber: string): Promise<Draft | null> {
      return readDraft(examId, normalizeStudentNumber(studentNumber));
    },

    async saveDraft(examId: string, studentNumber: string, draft: Draft) {
      const normalized = normalizeStudentNumber(studentNumber);
      writeDraft(examId, normalized, {
        ...draft,
        studentName: normalizeFullName(draft.studentName),
        studentNumber: normalized,
      });
    },

    async clearDraft(examId: string, studentNumber: string) {
      removeDraft(examId, normalizeStudentNumber(studentNumber));
    },

    async submit(examId: string, input: SubmitAttemptInput): Promise<Attempt> {
      const studentName = normalizeFullName(input.studentName);
      const studentNumber = normalizeStudentNumber(input.studentNumber);

      if (studentName.length < 3) {
        throw new Error("نام و نام خانوادگی را کامل وارد کنید.");
      }
      if (!/^\d{10}$/.test(studentNumber)) {
        throw new Error("شماره دانشجویی باید ۱۰ رقم باشد.");
      }

      const attempt = mutateDatabase((db) => {
        const exam = db.exams.find((item) => item.id === examId);
        if (!exam) throw new Error("آزمون موردنظر پیدا نشد.");
        if (exam.status === "draft") {
          throw new Error("این آزمون هنوز منتشر نشده است.");
        }

        const previous = db.attempts.find(
          (item) =>
            item.examId === examId && item.studentNumber === studentNumber,
        );
        if (previous) {
          throw new Error("این شماره دانشجویی قبلاً در این آزمون شرکت کرده است.");
        }

        const cleanAnswers: Record<string, number> = {};
        let score = 0;
        let total = 0;

        exam.questions.forEach((question) => {
          const selected = input.answers[question.id];
          const valid =
            typeof selected === "number" &&
            selected >= 0 &&
            selected < question.options.length;

          if (valid) cleanAnswers[question.id] = selected;
          total += question.points;
          if (valid && selected === question.correctIndex) {
            score += question.points;
          }
        });

        const result: Attempt = {
          id: uid("a"),
          examId,
          studentName,
          studentNumber,
          answers: cleanAnswers,
          score,
          total,
          startedAt: input.startedAt,
          submittedAt: new Date().toISOString(),
        };

        db.attempts.push(result);
        return result;
      });

      removeDraft(examId, studentNumber);
      return attempt;
    },
  },

  results: {
    async forTeacher(teacherId: string): Promise<ResultRow[]> {
      const db = getDatabase();
      const examIds = new Set(
        db.exams.filter((exam) => exam.teacherId === teacherId).map((exam) => exam.id),
      );
      return buildResultRows(
        db.attempts.filter((attempt) => examIds.has(attempt.examId)),
      );
    },

    async forExam(examId: string): Promise<ResultRow[]> {
      return buildResultRows(
        getDatabase().attempts.filter((attempt) => attempt.examId === examId),
      );
    },
  },

  stats: {
    async teacher(teacherId: string): Promise<TeacherStats> {
      const db = getDatabase();
      const exams = db.exams.filter((exam) => exam.teacherId === teacherId);
      const examIds = new Set(exams.map((exam) => exam.id));
      const attempts = db.attempts.filter((attempt) => examIds.has(attempt.examId));

      return {
        totalExams: exams.length,
        activeExams: exams.filter((exam) => exam.status === "active").length,
        draftExams: exams.filter((exam) => exam.status === "draft").length,
        participants: new Set(attempts.map((attempt) => attempt.studentNumber)).size,
        attempts: attempts.length,
        averagePercent:
          attempts.length === 0
            ? 0
            : attempts.reduce(
                (sum, attempt) => sum + percentOf(attempt.score, attempt.total),
                0,
              ) / attempts.length,
        recentExams: exams
          .slice()
          .sort(
            (first, second) =>
              new Date(second.createdAt).getTime() -
              new Date(first.createdAt).getTime(),
          )
          .slice(0, 5)
          .map((exam) => summarizeExam(exam)),
      };
    },
  },

  demo: {
    async reset() {
      resetDatabase();
    },
  },
};
