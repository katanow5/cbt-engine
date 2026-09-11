import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Question,
  ExamPackage,
  ExamEvent,
  ExamAttempt,
  AttemptStatus,
  StudentAnswer,
  ViolationType,
  ViolationLog,
} from '../types/cbt.types';
import {
  INITIAL_QUESTIONS,
  INITIAL_PACKAGES,
  INITIAL_EVENTS,
  INITIAL_ATTEMPTS,
} from '../mocks/initialData';

export type UserRole = 'admin' | 'student';
export type AppMode = 'landing' | 'app';
export type AdminView = 'dashboard' | 'questions' | 'packages' | 'events' | 'monitoring' | 'results';
export type StudentView = 'exam-list' | 'exam-runner' | 'student-results';

interface ToastInfo {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

interface CbtContextValue {
  // State
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  role: UserRole;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  studentView: StudentView;
  setStudentView: (view: StudentView) => void;

  questions: Question[];
  packages: ExamPackage[];
  events: ExamEvent[];
  attempts: ExamAttempt[];

  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  activeAttemptId: string | null;
  setActiveAttemptId: (id: string | null) => void;

  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  // Actions
  addQuestion: (q: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  simulateImportQuestions: () => void;

  savePackage: (pkg: ExamPackage) => void;
  deletePackage: (id: string) => void;

  saveEvent: (event: ExamEvent) => void;
  deleteEvent: (id: string) => void;

  // Student & Exam Actions
  startAttempt: (eventId: string, studentName?: string) => string;
  saveAnswer: (attemptId: string, answer: Partial<StudentAnswer> & { questionId: string }) => void;
  toggleReview: (attemptId: string, questionId: string) => void;
  logViolation: (attemptId: string, type: ViolationType, note?: string) => void;
  submitAttempt: (attemptId: string, options?: { auto?: boolean; flagged?: boolean }) => void;

  // Simulation
  simulatePeriodicProgress: () => void;
  resetAllData: () => void;
}

const CbtContext = createContext<CbtContextValue | null>(null);

export const CbtProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbt_theme', newTheme);
      } catch {}
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cbt_theme');
        if (saved === 'dark' || saved === 'light') {
          setTheme(saved);
          return;
        }
      } catch {}
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setTheme(hasDarkClass ? 'dark' : 'light');
    }
  }, []);

  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [role, setRole] = useState<UserRole>('admin');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [studentView, setStudentView] = useState<StudentView>('exam-list');

  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [packages, setPackages] = useState<ExamPackage[]>(INITIAL_PACKAGES);
  const [events, setEvents] = useState<ExamEvent[]>(INITIAL_EVENTS);
  const [attempts, setAttempts] = useState<ExamAttempt[]>(INITIAL_ATTEMPTS);

  const [selectedEventId, setSelectedEventId] = useState<string>('evt-ongoing-01');
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>('att-user-01');

  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Question CRUD
  const addQuestion = (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newQuestion: Question = {
      ...data,
      id: `q-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setQuestions((prev) => [newQuestion, ...prev]);
    showToast(`Soal baru [${newQuestion.code}] berhasil ditambahkan ke Bank Soal!`, 'success');
  };

  const updateQuestion = (q: Question) => {
    const now = new Date().toISOString();
    const updated = { ...q, updatedAt: now };
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? updated : item)));
    showToast(`Soal [${q.code}] berhasil diperbarui.`, 'success');
  };

  const deleteQuestion = (id: string) => {
    const target = questions.find((q) => q.id === id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showToast(`Soal ${target ? '[' + target.code + ']' : ''} telah dihapus dari bank soal.`, 'info');
  };

  const simulateImportQuestions = () => {
    const newBatch: Question[] = [
      {
        id: `q-imp-${Date.now()}-1`,
        code: 'TPS-IND-09',
        subject: 'Pemahaman Bacaan & Menulis',
        type: 'multiple_choice',
        difficulty: 'medium',
        content: 'Konjungsi yang tepat untuk menghubungkan klausa pertentangan pada kalimat majemuk adalah...',
        imageUrl: null,
        options: [
          { id: 'opt-imp-1', label: 'A', content: 'sehingga', isCorrect: false },
          { id: 'opt-imp-2', label: 'B', content: 'sedangkan', isCorrect: true },
          { id: 'opt-imp-3', label: 'C', content: 'karena', isCorrect: false },
          { id: 'opt-imp-4', label: 'D', content: 'kemudian', isCorrect: false },
          { id: 'opt-imp-5', label: 'E', content: 'agar', isCorrect: false },
        ],
        correctAnswer: 'opt-imp-2',
        explanation: 'Konjungsi "sedangkan" menyatakan hubungan pertentangan antar klausa setara.',
        points: 4,
        tags: ['PUEBI', 'Konjungsi'],
        itemStats: { timesUsed: 12, correctRate: 0.85, discriminationIndex: 0.35 },
        createdBy: 'Import Excel/Word (Mock)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `q-imp-${Date.now()}-2`,
        code: 'TIU-NUM-10',
        subject: 'Penalaran Numerik',
        type: 'short_answer',
        difficulty: 'easy',
        content: 'Berapakah kelanjutan dari deret angka berikut: 2, 4, 8, 16, 32, ...?',
        imageUrl: null,
        options: [],
        correctAnswer: '64',
        explanation: 'Pola deret dikalikan 2 pada setiap suku berikutnya: 32 x 2 = 64.',
        points: 3,
        tags: ['Deret Angka', 'TIU'],
        itemStats: { timesUsed: 25, correctRate: 0.92, discriminationIndex: 0.2 },
        createdBy: 'Import Excel/Word (Mock)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setQuestions((prev) => [...newBatch, ...prev]);
    showToast('Simulasi Import Berhasil: 24 butir soal berhasil diimpor dari file dokumen!', 'success');
  };

  // Package Actions
  const savePackage = (pkg: ExamPackage) => {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = pkg;
        return next;
      }
      return [pkg, ...prev];
    });
    showToast(`Paket Ujian "${pkg.name}" berhasil disimpan!`, 'success');
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    showToast('Paket ujian berhasil dihapus.', 'info');
  };

  // Event Actions
  const saveEvent = (evt: ExamEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === evt.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = evt;
        return next;
      }
      return [evt, ...prev];
    });
    showToast(`Jadwal Tryout "${evt.name}" berhasil disimpan.`, 'success');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Jadwal tryout dihapus.', 'info');
  };

  // Student Attempt Logic
  const startAttempt = (eventId: string, studentName = 'Ahmad Faiz (Demo Siswa)'): string => {
    // Check if attempt exists for this event
    let attempt = attempts.find((a) => a.examEventId === eventId && a.studentId === 'std-current');
    if (!attempt) {
      const newAttempt: ExamAttempt = {
        id: `att-user-${Date.now()}`,
        examEventId: eventId,
        studentId: 'std-current',
        studentName,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        submittedAt: null,
        timeSpent: 0,
        answers: [],
        violations: [],
        score: null,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        rank: null,
      };
      setAttempts((prev) => [newAttempt, ...prev]);
      setActiveAttemptId(newAttempt.id);
      setSelectedEventId(eventId);
      return newAttempt.id;
    } else {
      // Transition to in_progress if not_started or restart if already finished
      if (attempt.status === 'not_started') {
        const updated = {
          ...attempt,
          status: 'in_progress' as const,
          startedAt: new Date().toISOString(),
        };
        setAttempts((prev) => prev.map((a) => (a.id === attempt!.id ? updated : a)));
      } else if (attempt.status === 'submitted' || attempt.status === 'auto_submitted' || attempt.status === 'flagged') {
        const freshAttempt: ExamAttempt = {
          ...attempt,
          id: `att-user-${Date.now()}`,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          submittedAt: null,
          timeSpent: 0,
          answers: [],
          violations: [],
          score: null,
          correctCount: 0,
          wrongCount: 0,
          unansweredCount: 0,
          rank: null,
        };
        setAttempts((prev) => [freshAttempt, ...prev.filter((a) => a.id !== attempt!.id)]);
        setActiveAttemptId(freshAttempt.id);
        setSelectedEventId(eventId);
        return freshAttempt.id;
      }
      setActiveAttemptId(attempt.id);
      setSelectedEventId(eventId);
      return attempt.id;
    }
  };

  const saveAnswer = (attemptId: string, newAns: Partial<StudentAnswer> & { questionId: string }) => {
    setAttempts((prev) =>
      prev.map((att) => {
        if (att.id !== attemptId) return att;
        const now = new Date().toISOString();
        const existingAnsIdx = att.answers.findIndex((a) => a.questionId === newAns.questionId);
        let updatedAnswers: StudentAnswer[];

        if (existingAnsIdx >= 0) {
          const current = att.answers[existingAnsIdx];
          const merged: StudentAnswer = {
            ...current,
            ...newAns,
            answeredAt: now,
          };
          updatedAnswers = [...att.answers];
          updatedAnswers[existingAnsIdx] = merged;
        } else {
          const fresh: StudentAnswer = {
            questionId: newAns.questionId,
            selectedOptionId: newAns.selectedOptionId ?? null,
            selectedOptionIds: newAns.selectedOptionIds,
            matchingPairs: newAns.matchingPairs,
            shortAnswerText: newAns.shortAnswerText ?? null,
            isMarkedForReview: newAns.isMarkedForReview ?? false,
            answeredAt: now,
          };
          updatedAnswers = [...att.answers, fresh];
        }

        return {
          ...att,
          answers: updatedAnswers,
        };
      })
    );
  };

  const toggleReview = (attemptId: string, questionId: string) => {
    setAttempts((prev) =>
      prev.map((att) => {
        if (att.id !== attemptId) return att;
        const idx = att.answers.findIndex((a) => a.questionId === questionId);
        let updatedAnswers = [...att.answers];
        if (idx >= 0) {
          updatedAnswers[idx] = {
            ...updatedAnswers[idx],
            isMarkedForReview: !updatedAnswers[idx].isMarkedForReview,
          };
        } else {
          updatedAnswers.push({
            questionId,
            selectedOptionId: null,
            shortAnswerText: null,
            isMarkedForReview: true,
            answeredAt: null,
          });
        }
        return {
          ...att,
          answers: updatedAnswers,
        };
      })
    );
  };

  const logViolation = (attemptId: string, type: ViolationType, note?: string) => {
    const violation: ViolationLog = {
      id: `v-${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      note: note || 'Terdeteksi aktivitas mencurigakan pada jendela ujian',
    };

    setAttempts((prev) =>
      prev.map((att) => {
        if (att.id !== attemptId || att.status !== 'in_progress') return att;
        const newViolations = [...att.violations, violation];
        const THRESHOLD = 3;
        if (newViolations.length >= THRESHOLD) {
          // auto submit with flagged
          setTimeout(() => {
            submitAttempt(attemptId, { auto: true, flagged: true });
          }, 300);
        }
        return {
          ...att,
          violations: newViolations,
        };
      })
    );

    const typeLabels: Record<ViolationType, string> = {
      tab_switch: 'Pindah Tab Browser',
      window_blur: 'Jendela Tidak Fokus',
      fullscreen_exit: 'Keluar Layar Penuh',
      copy_paste: 'Mencoba Copy/Paste',
      multiple_face: 'Terdeteksi Lebih dari 1 Orang',
      no_face: 'Wajah Tidak Terdeteksi',
    };

    showToast(`Peringatan Pelanggaran: ${typeLabels[type]} tercatat!`, 'warning');
  };

  const submitAttempt = (attemptId: string, options?: { auto?: boolean; flagged?: boolean }) => {
    setAttempts((prev) =>
      prev.map((att) => {
        if (att.id !== attemptId) return att;
        if (att.status === 'submitted' || att.status === 'auto_submitted' || att.status === 'flagged') {
          return att;
        }

        const evt = events.find((e) => e.id === att.examEventId);
        const pkg = evt ? packages.find((p) => p.id === evt.packageId) : null;

        // Calculate score
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;

        const allQuestionIds = pkg ? pkg.sections.flatMap((s) => s.questionIds) : [];
        const total = allQuestionIds.length || 7;

        allQuestionIds.forEach((qId) => {
          const q = questions.find((item) => item.id === qId);
          const studentAns = att.answers.find((a) => a.questionId === qId);

          if (!studentAns || (!studentAns.selectedOptionId && !studentAns.shortAnswerText && (!studentAns.selectedOptionIds || studentAns.selectedOptionIds.length === 0))) {
            unanswered++;
            return;
          }

          if (q) {
            if (q.type === 'multiple_choice' || q.type === 'true_false') {
              const opt = q.options.find((o) => o.id === studentAns.selectedOptionId);
              if (opt && opt.isCorrect) correct++;
              else wrong++;
            } else if (q.type === 'short_answer') {
              if (
                studentAns.shortAnswerText &&
                q.correctAnswer &&
                studentAns.shortAnswerText.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
              ) {
                correct++;
              } else {
                wrong++;
              }
            } else if (q.type === 'multiple_choice_complex') {
              const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
              const userIds = studentAns.selectedOptionIds || [];
              const isMatch =
                correctIds.length === userIds.length &&
                correctIds.every((id) => userIds.includes(id));
              if (isMatch) correct++;
              else wrong++;
            } else {
              // matching or essay mock
              correct++;
            }
          }
        });

        // Scoring computation (IRT-style simulation: base 400 + scaled correct)
        let finalScore = 0;
        if (pkg?.scoringSystem === 'irt') {
          finalScore = Math.round(420 + (correct / Math.max(total, 1)) * 430 - wrong * 15);
          if (finalScore < 200) finalScore = 200;
          if (finalScore > 1000) finalScore = 1000;
        } else {
          // standard
          const correctVal = pkg?.scoringRule?.correct ?? 4;
          const wrongVal = pkg?.scoringRule?.wrong ?? 0;
          finalScore = Math.max(0, correct * correctVal + wrong * wrongVal);
        }

        const now = new Date().toISOString();
        const started = att.startedAt ? new Date(att.startedAt).getTime() : Date.now() - 1800000;
        const timeSpent = Math.max(1, Math.round((Date.now() - started) / 1000));

        let finalStatus: AttemptStatus = 'submitted';
        if (options?.flagged) finalStatus = 'flagged';
        else if (options?.auto) finalStatus = 'auto_submitted';

        return {
          ...att,
          status: finalStatus,
          submittedAt: now,
          timeSpent,
          score: finalScore,
          correctCount: correct,
          wrongCount: wrong,
          unansweredCount: unanswered,
          rank: 3, // mock rank
        };
      })
    );

    if (options?.flagged) {
      showToast('Ujian otomatis diselesaikan dan ditandai (Flagged) karena akumulasi pelanggaran!', 'error');
    } else if (options?.auto) {
      showToast('Waktu ujian telah berakhir. Jawaban Anda berhasil dikumpulkan otomatis!', 'info');
    } else {
      showToast('Selamat! Ujian Anda telah berhasil dikumpulkan.', 'success');
    }
  };

  // Periodic monitoring simulation: occasionally ticks peer progress
  const simulatePeriodicProgress = () => {
    setAttempts((prev) =>
      prev.map((att) => {
        if (att.status === 'in_progress' && att.studentId !== 'std-current') {
          // simulated incremental progress
          const randomQ = questions[Math.floor(Math.random() * questions.length)];
          const already = att.answers.some((a) => a.questionId === randomQ.id);
          if (!already) {
            return {
              ...att,
              timeSpent: (att.timeSpent || 600) + 15,
              answers: [
                ...att.answers,
                {
                  questionId: randomQ.id,
                  selectedOptionId: randomQ.options[0]?.id || null,
                  shortAnswerText: null,
                  isMarkedForReview: Math.random() > 0.8,
                  answeredAt: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return att;
      })
    );
  };

  const resetAllData = () => {
    setQuestions(INITIAL_QUESTIONS);
    setPackages(INITIAL_PACKAGES);
    setEvents(INITIAL_EVENTS);
    setAttempts(INITIAL_ATTEMPTS);
    setSelectedEventId('evt-ongoing-01');
    setActiveAttemptId('att-user-01');
    showToast('Data demo berhasil di-reset ke pengaturan awal.', 'info');
  };

  return (
    <CbtContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        appMode,
        setAppMode,
        role,
        currentRole: role,
        setRole,
        adminView,
        setAdminView,
        studentView,
        setStudentView,
        questions,
        packages,
        events,
        attempts,
        selectedEventId,
        setSelectedEventId,
        activeAttemptId,
        setActiveAttemptId,
        toasts,
        showToast,
        dismissToast,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        simulateImportQuestions,
        savePackage,
        deletePackage,
        saveEvent,
        deleteEvent,
        startAttempt,
        saveAnswer,
        toggleReview,
        logViolation,
        submitAttempt,
        simulatePeriodicProgress,
        resetAllData,
      }}
    >
      {children}
    </CbtContext.Provider>
  );
};

export function useCbt() {
  const ctx = useContext(CbtContext);
  if (!ctx) throw new Error('useCbt must be used within a CbtProvider');
  return ctx;
}
