export type Role = "teacher";

export type ExamStatus = "draft" | "active" | "closed";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
}

export interface PublicQuestion {
  id: string;
  text: string;
  options: string[];
  points: number;
}

export interface Exam {
  id: string;
  publicToken: string;
  teacherId: string;
  title: string;
  subject: string;
  description: string;
  durationMinutes: number;
  startAt: string;
  status: ExamStatus;
  questions: Question[];
  createdAt: string;
}

export type PublicExam = Omit<Exam, "questions"> & {
  questions: PublicQuestion[];
};

export interface Attempt {
  id: string;
  examId: string;
  studentName: string;
  studentNumber: string;
  answers: Record<string, number>;
  score: number;
  total: number;
  startedAt: string;
  submittedAt: string;
}

export interface Draft {
  studentName: string;
  studentNumber: string;
  answers: Record<string, number>;
  startedAt: string;
}

export interface Database {
  version: number;
  users: StoredUser[];
  exams: Exam[];
  attempts: Attempt[];
}

export interface QuestionInput {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
}

export interface ExamInput {
  title: string;
  subject: string;
  description: string;
  durationMinutes: number;
  startAt: string;
  status: ExamStatus;
  questions: QuestionInput[];
}

export interface SubmitAttemptInput {
  studentName: string;
  studentNumber: string;
  answers: Record<string, number>;
  startedAt: string;
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface ProfileInput {
  name: string;
  username: string;
  email: string;
}

export interface ExamSummary {
  exam: Exam;
  questionCount: number;
  totalPoints: number;
  participantCount: number;
  averagePercent: number;
}

export interface ResultRow {
  attempt: Attempt;
  exam: Exam;
}

export interface TeacherStats {
  totalExams: number;
  activeExams: number;
  draftExams: number;
  participants: number;
  attempts: number;
  averagePercent: number;
  recentExams: ExamSummary[];
}
