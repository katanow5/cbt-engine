import React, { useState, useEffect, useMemo } from 'react';
import { useCbt } from '../../context/CbtContext';
import {
  Question,
  ViolationType,
  ExamSection,
} from '../../types/cbt.types';
import { formatTime } from '../../lib/utils';
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

export const ExamRunnerView: React.FC = () => {
  const {
    activeAttemptId,
    selectedEventId,
    attempts,
    events,
    packages,
    questions,
    saveAnswer,
    toggleReview,
    logViolation,
    submitAttempt,
    setStudentView,
    showToast,
  } = useCbt();

  // Resilient lookup for active attempt, exam event, and package
  const attempt =
    attempts.find((a) => a.id === activeAttemptId) ||
    attempts.find((a) => a.examEventId === selectedEventId && a.studentId === 'std-current') ||
    attempts.find((a) => a.studentId === 'std-current' && a.status === 'in_progress') ||
    attempts[0];

  const examEvent =
    events.find((e) => e.id === attempt?.examEventId) ||
    events.find((e) => e.id === selectedEventId) ||
    events[0];

  const examPackage =
    packages.find((p) => p.id === examEvent?.packageId) ||
    packages[0];

  // Flatten all questions in the package in section order
  const examQuestions: { question: Question; section: ExamSection }[] = useMemo(() => {
    if (!examPackage) return [];
    const list: { question: Question; section: ExamSection }[] = [];
    if (examPackage.sections && examPackage.sections.length > 0) {
      examPackage.sections.forEach((sec) => {
        sec.questionIds.forEach((qId) => {
          const found = questions.find((q) => q.id === qId);
          if (found) {
            list.push({ question: found, section: sec });
          }
        });
      });
    }

    // Safety fallback: if package references no matching questions, populate from available bank
    if (list.length === 0 && questions.length > 0) {
      const fallbackSec: ExamSection = examPackage.sections?.[0] || {
        id: 'sec-general',
        name: 'Sesi Ujian',
        subject: 'Umum',
        questionIds: questions.map((q) => q.id),
        duration: 45,
        order: 1,
      };
      return questions.slice(0, 10).map((q) => ({ question: q, section: fallbackSec }));
    }

    return list;
  }, [examPackage, questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [violationAlert, setViolationAlert] = useState<{ open: boolean; type: string; count: number } | null>(null);

  // Text size scaling for accessibility
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');

  // Timer: initialized to package duration or default 45 minutes
  const totalSeconds = (examPackage?.totalDuration || 45) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (examPackage?.totalDuration) {
      setSecondsRemaining(examPackage.totalDuration * 60);
    }
  }, [examPackage?.id]);

  // Request fullscreen on start
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
      }
    } catch {
      // Ignore if restricted in iframe
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (secondsRemaining <= 0) {
      // Auto submit when time runs out
      if (attempt) {
        submitAttempt(attempt.id);
        showToast('Waktu ujian telah habis. Lembar jawaban Anda telah dikumpulkan otomatis!', 'warning');
        setStudentView('student-results');
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, attempt?.id]);

  // Anti-Cheating & Integrity detection (Tab switch, Blur, Fullscreen exit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && attempt && attempt.status === 'in_progress') {
        handleViolationTrigger('tab_switch', 'Pindah tab terdeteksi saat ujian berlangsung');
      }
    };

    const handleWindowBlur = () => {
      if (attempt && attempt.status === 'in_progress') {
        handleViolationTrigger('window_blur', 'Jendela ujian kehilangan fokus / aplikasi lain aktif');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen && attempt && attempt.status === 'in_progress') {
        handleViolationTrigger('fullscreen_exit', 'Peserta keluar dari mode layar penuh (Fullscreen)');
        setIsFullscreen(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [attempt?.id, attempt?.status, isFullscreen]);

  const handleViolationTrigger = (type: ViolationType, note: string) => {
    if (!attempt) return;
    const currentViolations = attempt.violations.length;
    const newCount = currentViolations + 1;

    logViolation(attempt.id, type, note);

    setViolationAlert({
      open: true,
      type: type === 'tab_switch' ? 'Pindah Tab' : type === 'window_blur' ? 'Fokus Berpindah' : 'Keluar Layar Penuh',
      count: newCount,
    });

    if (newCount >= 3) {
      setTimeout(() => {
        setStudentView('student-results');
      }, 1000);
    }
  };

  const currentItem = examQuestions[currentIndex];
  const currentQuestion = currentItem?.question;
  const currentSection = currentItem?.section;

  // Student answer for current question
  const currentAnswer = useMemo(() => {
    return (
      attempt?.answers.find((a) => a.questionId === currentQuestion?.id) || {
        questionId: currentQuestion?.id || '',
        selectedOptionId: null,
        selectedOptionIds: [],
        matchingPairs: {},
        shortAnswerText: null,
        isMarkedForReview: false,
        answeredAt: null,
      }
    );
  }, [attempt?.answers, currentQuestion?.id]);

  // Handle single choice option select
  const handleSelectOption = (optId: string) => {
    if (!attempt || !currentQuestion) return;
    saveAnswer(attempt.id, {
      questionId: currentQuestion.id,
      selectedOptionId: optId,
    });
  };

  // Handle multiple complex option toggle
  const handleToggleComplexOption = (optId: string) => {
    if (!attempt || !currentQuestion) return;
    const existing = currentAnswer.selectedOptionIds || [];
    const updated = existing.includes(optId)
      ? existing.filter((id) => id !== optId)
      : [...existing, optId];

    saveAnswer(attempt.id, {
      questionId: currentQuestion.id,
      selectedOptionIds: updated,
    });
  };

  // Handle short answer
  const handleShortAnswerChange = (val: string) => {
    if (!attempt || !currentQuestion) return;
    saveAnswer(attempt.id, {
      questionId: currentQuestion.id,
      shortAnswerText: val,
    });
  };

  // Handle matching pair select
  const handleMatchingPairChange = (optionId: string, matchedTarget: string) => {
    if (!attempt || !currentQuestion) return;
    const existing = currentAnswer.matchingPairs || {};
    saveAnswer(attempt.id, {
      questionId: currentQuestion.id,
      matchingPairs: {
        ...existing,
        [optionId]: matchedTarget,
      },
    });
  };

  // Handle review toggle
  const handleToggleReview = () => {
    if (!attempt || !currentQuestion) return;
    toggleReview(attempt.id, currentQuestion.id);
  };

  // Summary counts for submit confirmation
  const summaryCounts = useMemo(() => {
    let answered = 0;
    let reviewed = 0;
    let unanswered = 0;

    examQuestions.forEach(({ question }) => {
      const ans = attempt?.answers.find((a) => a.questionId === question.id);
      const hasValue =
        ans?.selectedOptionId !== null ||
        ans?.shortAnswerText !== null ||
        (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
        (ans?.matchingPairs && Object.keys(ans.matchingPairs).length > 0);

      if (ans?.isMarkedForReview) reviewed++;
      if (hasValue) answered++;
      else unanswered++;
    });

    return { answered, reviewed, unanswered, total: examQuestions.length };
  }, [examQuestions, attempt?.answers]);

  const confirmFinish = () => {
    if (!attempt) return;
    submitAttempt(attempt.id);
    setStudentView('student-results');
  };

  if (!attempt || examQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="text-center space-y-4 max-w-md">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold">Ujian tidak ditemukan atau belum dimulai</h2>
          <Button
            onClick={() => setStudentView('exam-list')}
            size="sm"
            className="text-xs font-semibold"
          >
            Kembali ke Daftar Tryout
          </Button>
        </div>
      </div>
    );
  }

  // Timer critical check (< 5 mins = 300s)
  const isTimerCritical = secondsRemaining < 300;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      {/* EXAM RUNNER HEADER */}
      <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between shadow-2xs sticky top-0 z-30">
        {/* Left: Exam and Section Context */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            CBT
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base leading-tight text-foreground truncate max-w-xs sm:max-w-md">
              {examEvent?.name || 'Tryout CBT'}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {currentSection?.name || 'Sesi Ujian'} • Subtes {currentIndex + 1} dari {examQuestions.length}
            </p>
          </div>
        </div>

        {/* Right: Timer, Font Size, Fullscreen & Submit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pause / Exit button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPauseConfirm(true)}
            className="h-8 text-xs gap-1"
            title="Keluar sementara ke Daftar Tryout"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Keluar Sesi</span>
          </Button>

          {/* Text Size Scale */}
          <div className="hidden sm:flex items-center bg-input rounded-lg p-0.5 text-xs font-semibold text-muted-foreground border border-border">
            <Button
              variant={textSize === 'normal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTextSize('normal')}
              className="h-7 px-2 text-xs"
            >
              A
            </Button>
            <Button
              variant={textSize === 'large' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTextSize('large')}
              className="h-7 px-2 text-xs font-bold"
            >
              A+
            </Button>
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 text-foreground hidden sm:flex"
            title="Toggle Mode Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {/* Countdown Timer with Red Pulse when < 5 mins */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-extrabold tabular-nums transition-all ${
              isTimerCritical
                ? 'bg-destructive/10 text-destructive border-destructive/40 animate-pulse'
                : 'bg-primary/10 text-primary border-primary/30'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-destructive' : 'text-primary'}`} />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Selesai Ujian Button */}
          <Button
            size="sm"
            onClick={() => setShowSubmitConfirm(true)}
            className="h-8 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            Selesai Ujian
          </Button>
        </div>
      </header>

      {/* MAIN EXAM WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Central Question Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
          <div className="max-w-3xl w-full mx-auto space-y-6">
            {/* Question Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-lg text-foreground">
                  Soal Nomor {currentIndex + 1}
                </span>
                <Badge variant="outline" className="font-mono text-xs font-semibold">
                  {currentQuestion?.code}
                </Badge>
              </div>

              {/* Ragu-ragu Checkbox */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-xs cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
                <Checkbox
                  checked={currentAnswer.isMarkedForReview}
                  onCheckedChange={handleToggleReview}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Flag className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>Ragu-ragu</span>
              </label>
            </div>

            {/* Stem Content with Anti-Slop typography */}
            <div
              className={`text-foreground leading-relaxed font-normal whitespace-pre-line ${
                textSize === 'large' ? 'text-lg md:text-xl' : 'text-base md:text-lg'
              }`}
            >
              {currentQuestion?.content}
            </div>

            {/* Optional Image */}
            {currentQuestion?.imageUrl && (
              <div className="my-4 p-2 rounded-xl border border-border bg-card inline-block">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Ilustrasi Soal"
                  className="max-h-72 rounded-lg object-contain"
                />
              </div>
            )}

            {/* ANSWER INPUT CONTROLS ACCORDING TO QUESTION TYPE */}
            <div className="pt-4 space-y-3">
              {/* 1. Multiple Choice (Radio) */}
              {currentQuestion?.type === 'multiple_choice' && (
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer.selectedOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-foreground shadow-2xs font-semibold'
                            : 'bg-card border-border hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-border'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className="pt-0.5 text-sm leading-relaxed">{opt.content}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Multiple Choice Complex (Checkboxes) */}
              {currentQuestion?.type === 'multiple_choice_complex' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    * Pilih semua opsi yang Anda anggap bernilai benar.
                  </p>
                  {currentQuestion.options.map((opt) => {
                    const isChecked = currentAnswer.selectedOptionIds?.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleToggleComplexOption(opt.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isChecked
                            ? 'bg-primary/10 border-primary text-foreground shadow-2xs font-semibold'
                            : 'bg-card border-border hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          className="mt-0.5 pointer-events-none"
                        />
                        <div className="pt-0.5 text-sm leading-relaxed">
                          <span className="font-bold mr-2">{opt.label}.</span>
                          {opt.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. True / False */}
              {currentQuestion?.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer.selectedOptionId === opt.id;
                    const isBenar = opt.label.toLowerCase() === 'benar';
                    return (
                      <Button
                        key={opt.id}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`h-20 text-base font-extrabold rounded-2xl ${
                          isSelected
                            ? isBenar
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                            : ''
                        }`}
                      >
                        {opt.label.toUpperCase()}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* 4. Matching */}
              {currentQuestion?.type === 'matching' && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    * Pasangkan setiap pernyataan di kolom kiri dengan pilihan pasangan yang tepat di kolom kanan.
                  </p>
                  {currentQuestion.options.map((opt) => {
                    const currentMatch = currentAnswer.matchingPairs?.[opt.id] || '';
                    return (
                      <div
                        key={opt.id}
                        className="p-3.5 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-2 gap-3 items-center"
                      >
                        <span className="font-medium text-xs text-foreground">
                          {opt.content}
                        </span>
                        <select
                          value={currentMatch}
                          onChange={(e) => handleMatchingPairChange(opt.id, e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-semibold"
                        >
                          <option value="">-- Pilih Pasangan --</option>
                          {currentQuestion.options.map((target) => (
                            <option key={target.id} value={target.matchTarget || target.label}>
                              {target.matchTarget || target.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. Short Answer */}
              {currentQuestion?.type === 'short_answer' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Ketikkan Jawaban Singkat Anda:
                  </label>
                  <Input
                    type="text"
                    value={currentAnswer.shortAnswerText || ''}
                    onChange={(e) => handleShortAnswerChange(e.target.value)}
                    placeholder="Tuliskan jawaban persis di sini..."
                    className="font-mono font-bold text-base h-12"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Jawaban otomatis tersimpan saat Anda mengetik.
                  </p>
                </div>
              )}

              {/* 6. Essay */}
              {currentQuestion?.type === 'essay' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Tuliskan Jawaban Uraian / Esai Anda:
                  </label>
                  <Textarea
                    rows={6}
                    value={currentAnswer.shortAnswerText || ''}
                    onChange={(e) => handleShortAnswerChange(e.target.value)}
                    placeholder="Ketikkan uraian jawaban secara runut..."
                    className="text-sm leading-relaxed"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Mendukung teks multi-paragraf</span>
                    <span>
                      {(currentAnswer.shortAnswerText || '').split(/\s+/).filter(Boolean).length} Kata
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM NAVIGATION BAR */}
          <div className="max-w-3xl w-full mx-auto pt-6 mt-6 border-t border-border flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="text-xs font-bold gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Soal Sebelumnya
            </Button>

            <span className="text-xs font-bold text-muted-foreground font-mono">
              {currentIndex + 1} / {examQuestions.length}
            </span>

            {currentIndex < examQuestions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                className="text-xs font-bold gap-2 shadow-xs"
              >
                Soal Berikutnya
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Kumpulkan Ujian
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </main>

        {/* RIGHT: QUESTION NAVIGATOR GRID */}
        <aside className="w-full lg:w-80 bg-card border-t lg:border-t-0 lg:border-l border-border p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Navigasi Nomor Soal
              </h3>
              <span className="text-xs font-mono font-bold text-primary">
                {summaryCounts.answered} / {summaryCounts.total} Terjawab
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2.5 max-h-72 lg:max-h-[500px] overflow-y-auto p-1">
              {examQuestions.map(({ question }, idx) => {
                const ans = attempt.answers.find((a) => a.questionId === question.id);
                const hasAnswer =
                  ans?.selectedOptionId !== null ||
                  ans?.shortAnswerText !== null ||
                  (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                  (ans?.matchingPairs && Object.keys(ans.matchingPairs).length > 0);

                const isReview = ans?.isMarkedForReview;
                const isActive = idx === currentIndex;

                let btnBg = 'bg-input text-foreground border-border hover:bg-muted';
                if (isReview) {
                  btnBg = 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200';
                } else if (hasAnswer) {
                  btnBg = 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700';
                }

                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl font-bold text-xs relative flex items-center justify-center border transition-all cursor-pointer ${btnBg} ${
                      isActive ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-card scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isReview && (
                      <Flag className="w-2.5 h-2.5 absolute top-1 right-1 text-amber-700 dark:text-amber-300 fill-current" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status Legend */}
            <div className="p-3.5 rounded-xl bg-input/40 border border-border text-[11px] space-y-2">
              <span className="font-bold text-muted-foreground block uppercase tracking-wider text-[10px]">
                Keterangan Status:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0" />
                  <span>Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-400 shrink-0" />
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-input border border-border shrink-0" />
                  <span>Belum Diisi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md border-2 border-primary shrink-0" />
                  <span>Soal Aktif</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Selesai & Kumpulkan
            </Button>
          </div>
        </aside>
      </div>

      {/* CONFIRMATION SUBMIT DIALOG using Shadcn Dialog */}
      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-2 pt-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-extrabold text-foreground text-center">
              Kumpulkan Ujian Sekarang?
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Pastikan Anda telah memeriksa seluruh jawaban. Setelah dikumpulkan, lembar jawaban tidak dapat diubah kembali.
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-input/50 border border-border">
            <div>
              <span className="text-[10px] text-muted-foreground block">Terjawab</span>
              <span className="text-base font-extrabold text-emerald-600">
                {summaryCounts.answered}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Ragu-ragu</span>
              <span className="text-base font-extrabold text-amber-600">
                {summaryCounts.reviewed}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Kosong</span>
              <span className="text-base font-extrabold text-destructive">
                {summaryCounts.unanswered}
              </span>
            </div>
          </div>

          {summaryCounts.unanswered > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Masih terdapat {summaryCounts.unanswered} soal yang belum Anda isi!
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowSubmitConfirm(false)}
              className="flex-1 text-xs font-bold"
            >
              Lanjut Mengerjakan
            </Button>
            <Button
              onClick={confirmFinish}
              className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Ya, Kumpulkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PAUSE / EXIT CONFIRMATION MODAL using Shadcn Dialog */}
      <Dialog open={showPauseConfirm} onOpenChange={setShowPauseConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-foreground">
              Jeda Ujian & Kembali ke Beranda?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seluruh jawaban yang telah Anda pilih sudah otomatis tersimpan secara real-time. Anda dapat melanjutkan pengerjaan kembali sebelum batas waktu berakhir.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowPauseConfirm(false)}
              className="flex-1 text-xs font-bold"
            >
              Tetap Mengerjakan
            </Button>
            <Button
              onClick={() => {
                setShowPauseConfirm(false);
                setStudentView('exam-list');
                showToast('Sesi ujian dijeda. Jawaban Anda tersimpan rapi.', 'info');
              }}
              className="flex-1 text-xs font-bold shadow-xs"
            >
              Ya, Keluar Sementara
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIOLATION WARNING MODAL using Shadcn Dialog */}
      <Dialog open={Boolean(violationAlert?.open)} onOpenChange={(open) => !open && setViolationAlert(null)}>
        {violationAlert && (
          <DialogContent className="max-w-md border-2 border-destructive">
            <div className="flex items-center gap-3 text-destructive">
              <ShieldAlert className="w-8 h-8 shrink-0" />
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Peringatan Pelanggaran ({violationAlert.type})
                </DialogTitle>
                <span className="text-xs font-bold text-destructive">
                  Pelanggaran ke-{violationAlert.count} dari batas toleransi 3 kali
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Sistem mendeteksi aktivitas yang melanggar aturan ujian (berpindah tab, jendela tidak aktif, atau keluar mode layar penuh). Mohon tetap berada di lembar soal hingga waktu selesai.
            </p>

            {violationAlert.count >= 3 ? (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive font-bold text-xs">
                Batas pelanggaran telah tercapai! Ujian akan otomatis diselesaikan dan ditandai (Flagged).
              </div>
            ) : (
              <Button
                onClick={() => setViolationAlert(null)}
                variant="destructive"
                className="w-full text-xs font-bold shadow-xs"
              >
                Saya Mengerti & Kembali Mengerjakan
              </Button>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
