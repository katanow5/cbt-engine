export type QuestionType =
  | 'multiple_choice'
  | 'multiple_choice_complex'
  | 'true_false'
  | 'matching'
  | 'short_answer'
  | 'essay';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ScoringSystem = 'standard' | 'irt' | 'custom';
export type ExamCategory = 'utbk' | 'cpns' | 'try_out_sekolah' | 'custom';
export type ExamEventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type AttemptStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'auto_submitted'
  | 'flagged';
export type ViolationType =
  | 'tab_switch'
  | 'window_blur'
  | 'copy_paste'
  | 'fullscreen_exit'
  | 'multiple_face'
  | 'no_face';

export interface QuestionOption {
  id: string;
  label: string; // e.g. "A", "B", "C", "D", "E"
  content: string;
  isCorrect: boolean;
  matchTarget?: string; // For 'matching' type
}

export interface Question {
  id: string;
  code: string;
  subject: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  content: string;
  imageUrl: string | null;
  options: QuestionOption[];
  correctAnswer: string | null; // For short answer / essay reference
  explanation?: string; // Pembahasan
  points: number;
  tags: string[];
  itemStats: {
    timesUsed: number;
    correctRate: number | null;
    discriminationIndex: number | null;
  } | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSection {
  id: string;
  name: string;
  subject: string;
  questionIds: string[];
  duration: number; // in minutes
  order: number;
}

export interface ExamPackage {
  id: string;
  name: string;
  category: ExamCategory;
  description: string;
  sections: ExamSection[];
  totalQuestions: number;
  totalDuration: number; // in minutes
  scoringSystem: ScoringSystem;
  scoringRule: { correct: number; wrong: number; unanswered: number } | null;
  passingScore: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultImmediately: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ExamEvent {
  id: string;
  packageId: string;
  name: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  accessCode: string | null;
  assignedBatch: string[];
  maxAttempts: number;
  status: ExamEventStatus;
  participantCount: number;
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionId: string | null;
  selectedOptionIds?: string[]; // for multiple_choice_complex
  matchingPairs?: Record<string, string>; // for matching questions
  shortAnswerText: string | null;
  isMarkedForReview: boolean;
  answeredAt: string | null;
}

export interface ViolationLog {
  id: string;
  type: ViolationType;
  timestamp: string;
  note: string | null;
}

export interface ExamAttempt {
  id: string;
  examEventId: string;
  studentId: string;
  studentName: string;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  timeSpent: number | null; // in seconds
  answers: StudentAnswer[];
  violations: ViolationLog[];
  score: number | null;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  rank: number | null;
}
