import React, { useState } from 'react';
import { useCbt } from '../../context/CbtContext';
import { formatTime } from '../../lib/utils';
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowLeft,
  BookOpen,
  ShieldAlert,
  BarChart2,
  Check,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export const StudentResultView: React.FC = () => {
  const {
    activeAttemptId,
    attempts,
    events,
    packages,
    questions,
    setStudentView,
  } = useCbt();

  const attempt = attempts.find((a) => a.id === activeAttemptId) || attempts[0];
  const examEvent = events.find((e) => e.id === attempt?.examEventId);
  const examPackage = packages.find((p) => p.id === examEvent?.packageId);

  const [showExplanation, setShowExplanation] = useState(false);

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-muted-foreground text-sm">Tidak ada riwayat hasil pengerjaan aktif.</p>
        <Button
          onClick={() => setStudentView('exam-list')}
          size="sm"
          className="text-xs font-semibold"
        >
          Kembali ke Daftar Tryout
        </Button>
      </div>
    );
  }

  const isPassed =
    examPackage?.passingScore
      ? (attempt.score || 0) >= examPackage.passingScore
      : (attempt.score || 0) >= 500;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top navigation back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setStudentView('exam-list')}
        className="text-xs font-bold text-muted-foreground hover:text-foreground gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda Tryout
      </Button>

      {/* Main Score Hero Card */}
      <Card className="shadow-md text-center p-8 space-y-6 relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-2">
          <Badge variant="accent" className="text-[10px] uppercase font-mono mb-1">
            Hasil Ujian CBT • {examEvent?.name || 'Simulasi UTBK'}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            {attempt.score !== null ? attempt.score : 0}{' '}
            <span className="text-xl text-muted-foreground font-normal">/ 1000</span>
          </h1>

          {/* Passing grade badge */}
          <div className="pt-2">
            {isPassed ? (
              <Badge variant="success" className="text-xs px-3 py-1 gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Lulus Ambang Batas (Passing Grade: {examPackage?.passingScore || 600})
              </Badge>
            ) : (
              <Badge variant="warning" className="text-xs px-3 py-1 gap-1.5 font-bold">
                Belum Memenuhi Ambang Batas (Target: {examPackage?.passingScore || 600})
              </Badge>
            )}
          </div>
        </div>

        {/* Flagged alert if violations triggered */}
        {attempt.status === 'flagged' && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Catatan Pengawas: Ujian ini dihentikan lebih awal atau ditandai karena melewati ambang batas integritas.
            </span>
          </div>
        )}

        {/* Breakdown Stats 4 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4 border-t border-border text-left">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block">
              Jawaban Benar
            </span>
            <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-100">
              {attempt.correctCount} Soal
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30">
            <span className="text-[10px] text-destructive font-bold uppercase block">
              Jawaban Salah
            </span>
            <span className="text-xl font-extrabold text-destructive">
              {attempt.wrongCount} Soal
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-input border border-border">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block">
              Tidak Dijawab
            </span>
            <span className="text-xl font-extrabold text-foreground">
              {attempt.unansweredCount} Soal
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30">
            <span className="text-[10px] text-primary font-bold uppercase block">
              Waktu Pengerjaan
            </span>
            <span className="text-xl font-extrabold text-foreground font-mono">
              {attempt.timeSpent ? formatTime(attempt.timeSpent) : '18:45'}
            </span>
          </div>
        </div>
      </Card>

      {/* Subtests Breakdown Table */}
      <Card className="shadow-2xs">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Capaian Nilai Per Subtes Ujian
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-3 px-2">Nama Subtes</th>
                  <th className="pb-3 px-2 text-center">Jumlah Soal</th>
                  <th className="pb-3 px-2 text-center">Benar</th>
                  <th className="pb-3 px-2 text-center">Salah</th>
                  <th className="pb-3 px-2 text-right">Skor Estimasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {examPackage?.sections.map((sec) => (
                  <tr key={sec.id} className="hover:bg-muted/20">
                    <td className="py-3 px-2 font-bold text-foreground">{sec.name}</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">
                      {sec.questionIds.length} Butir
                    </td>
                    <td className="py-3 px-2 text-center text-emerald-600 font-semibold">
                      {Math.min(sec.questionIds.length, attempt.correctCount)}
                    </td>
                    <td className="py-3 px-2 text-center text-destructive font-semibold">
                      {sec.questionIds.length > attempt.correctCount ? 1 : 0}
                    </td>
                    <td className="py-3 px-2 text-right font-extrabold text-primary">
                      {Math.round(
                        (attempt.score || 650) *
                          (sec.questionIds.length / (examPackage?.totalQuestions || 1))
                      )}{' '}
                      Poin
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Toggle View Pembahasan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-foreground">Pembahasan Butir Soal</h3>
            <p className="text-xs text-muted-foreground">
              Pelajari kunci jawaban resmi dan ulasan penyelesaian untuk setiap nomor.
            </p>
          </div>

          <Button
            onClick={() => setShowExplanation(!showExplanation)}
            className="font-bold text-xs shadow-xs gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {showExplanation ? 'Sembunyikan Pembahasan' : 'Buka Pembahasan Lengkap'}
          </Button>
        </div>

        {/* Detailed Question Review List */}
        {showExplanation && (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const studentAns = attempt.answers.find((a) => a.questionId === q.id);
              const selectedOpt = q.options.find((o) => o.id === studentAns?.selectedOptionId);
              const isCorrect = selectedOpt?.isCorrect;
              const hasAnswered = !!(
                studentAns?.selectedOptionId ||
                studentAns?.shortAnswerText ||
                (studentAns?.selectedOptionIds && studentAns.selectedOptionIds.length > 0)
              );

              return (
                <Card key={q.id} className="shadow-2xs">
                  <CardHeader className="p-6 pb-3 border-b border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary">
                          Nomor {idx + 1} • [{q.code}] {q.subject}
                        </span>
                        <h4 className="text-xs font-medium text-muted-foreground mt-0.5">
                          Tipe: {q.type.replace('_', ' ').toUpperCase()} • Bobot: {q.points} Poin
                        </h4>
                      </div>

                      <div>
                        {!hasAnswered ? (
                          <Badge variant="secondary" className="text-[11px]">
                            Kosong
                          </Badge>
                        ) : isCorrect ? (
                          <Badge variant="success" className="text-[11px] gap-1">
                            <Check className="w-3.5 h-3.5" /> Jawaban Benar
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[11px] gap-1">
                            <X className="w-3.5 h-3.5" /> Jawaban Salah
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    {/* Question Stem */}
                    <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                      {q.content}
                    </div>

                    {/* Options with correct/incorrect indicators */}
                    <div className="space-y-2 text-xs">
                      {q.options.map((opt) => {
                        const isStudentPick = studentAns?.selectedOptionId === opt.id;
                        let rowStyle = 'bg-input/40 border-border text-foreground';

                        if (opt.isCorrect) {
                          rowStyle =
                            'bg-emerald-500/10 border-emerald-500 font-semibold text-emerald-950 dark:text-emerald-100';
                        } else if (isStudentPick && !opt.isCorrect) {
                          rowStyle =
                            'bg-destructive/10 border-destructive/50 text-destructive';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${rowStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-5">{opt.label}.</span>
                              <span>{opt.content}</span>
                            </div>
                            {opt.isCorrect && (
                              <Badge variant="success" className="text-[10px] uppercase shrink-0">
                                Kunci Jawaban
                              </Badge>
                            )}
                            {isStudentPick && !opt.isCorrect && (
                              <Badge variant="destructive" className="text-[10px] uppercase shrink-0">
                                Pilihan Anda
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-xs space-y-1">
                        <span className="font-bold text-primary block">
                          Ulasan & Pembahasan:
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
