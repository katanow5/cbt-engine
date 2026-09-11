import React, { useState, useMemo } from 'react';
import { useCbt } from '../../context/CbtContext';
import { ExamAttempt } from '../../types/cbt.types';
import { formatTime } from '../../lib/utils';
import {
  Award,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  BarChart2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export const ResultsView: React.FC = () => {
  const { events, packages, attempts, questions, selectedEventId, setSelectedEventId, showToast } =
    useCbt();

  const [search, setSearch] = useState('');
  const [selectedAttemptForDetail, setSelectedAttemptForDetail] = useState<ExamAttempt | null>(null);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const currentPackage = packages.find((p) => p.id === currentEvent?.packageId);

  // Filter attempts for this event
  const eventAttempts = useMemo(() => {
    return attempts.filter((att) => att.examEventId === currentEvent?.id);
  }, [attempts, currentEvent]);

  // Ranked list (descending score for finished attempts)
  const rankedAttempts = useMemo(() => {
    const list = [...eventAttempts].sort((a, b) => (b.score || 0) - (a.score || 0));
    return list.map((att, index) => ({
      ...att,
      calculatedRank: att.score !== null ? index + 1 : null,
    }));
  }, [eventAttempts]);

  const filteredAttempts = useMemo(() => {
    return rankedAttempts.filter((att) =>
      att.studentName.toLowerCase().includes(search.toLowerCase())
    );
  }, [rankedAttempts, search]);

  // Chart data for score distribution
  const chartData = useMemo(() => {
    const scoredList = rankedAttempts.filter((a) => a.score !== null);
    if (scoredList.length === 0) {
      return [
        { range: '0-400', count: 0 },
        { range: '401-600', count: 0 },
        { range: '601-800', count: 0 },
        { range: '801-1000', count: 0 },
      ];
    }
    const r1 = scoredList.filter((a) => (a.score || 0) <= 400).length;
    const r2 = scoredList.filter((a) => (a.score || 0) > 400 && (a.score || 0) <= 600).length;
    const r3 = scoredList.filter((a) => (a.score || 0) > 600 && (a.score || 0) <= 800).length;
    const r4 = scoredList.filter((a) => (a.score || 0) > 800).length;

    return [
      { range: '< 400', count: r1 },
      { range: '401 - 600', count: r2 },
      { range: '601 - 800', count: r3 },
      { range: '> 800', count: r4 },
    ];
  }, [rankedAttempts]);

  // Average score
  const avgScore = useMemo(() => {
    const finished = rankedAttempts.filter((a) => a.score !== null);
    if (finished.length === 0) return 0;
    const sum = finished.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(sum / finished.length);
  }, [rankedAttempts]);

  const handleExportMock = () => {
    showToast(
      'Export Rekap Hasil: Dokumen Excel/CSV nilai peserta berhasil disiapkan (Simulasi Mock)!',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Hasil & Rekapitulasi Nilai
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analisis skor total, perolehan subtes, distribusi capaian, dan peringkat peserta tryout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="flex h-9 px-3 text-xs font-semibold rounded-lg border border-border bg-input text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-2xs"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMock}
            className="text-xs font-semibold gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Nilai (Mock)
          </Button>
        </div>
      </div>

      {/* KPI / Statistical Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Rata-rata Skor Event</span>
              <div className="text-2xl font-extrabold text-foreground mt-0.5">{avgScore} Poin</div>
              <span className="text-[11px] text-muted-foreground">
                Passing Grade Acuan: {currentPackage?.passingScore || 600}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tingkat Kelulusan Mock</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {rankedAttempts.filter((a) => (a.score || 0) >= (currentPackage?.passingScore || 600)).length}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  / {rankedAttempts.filter((a) => a.score !== null).length} Siswa
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Memenuhi ambang batas nilai
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Skor Tertinggi (Peringkat 1)</span>
              <div className="text-2xl font-extrabold text-foreground mt-0.5">
                {rankedAttempts[0]?.score || 742} Poin
              </div>
              <span className="text-[11px] text-muted-foreground truncate block">
                Diraih oleh: {rankedAttempts[0]?.studentName || 'Peserta Terbaik'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card className="shadow-2xs">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Distribusi Perolehan Nilai Peserta
            </CardTitle>
            <span className="text-xs text-muted-foreground">Interval Skala Skor</span>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="range" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 2 || index === 3 ? 'var(--primary)' : 'var(--muted-foreground)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-2xs overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm font-bold">
              Peringkat dan Lembar Hasil Peserta
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama peserta..."
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Nama Peserta</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-24 text-center">Skor Akhir</th>
                <th className="py-3 px-4 w-20 text-center">Benar</th>
                <th className="py-3 px-4 w-20 text-center">Salah</th>
                <th className="py-3 px-4 w-20 text-center">Kosong</th>
                <th className="py-3 px-4 w-28">Durasi Pengerjaan</th>
                <th className="py-3 px-4 w-20 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttempts.map((att) => (
                <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold">
                    {att.calculatedRank ? (
                      <span
                        className={`inline-block w-6 h-6 rounded-full leading-6 text-center text-xs ${
                          att.calculatedRank === 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 font-extrabold'
                            : att.calculatedRank === 2
                            ? 'bg-slate-200 text-slate-800 dark:bg-slate-800'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {att.calculatedRank}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    <div>{att.studentName}</div>
                    <div className="text-[10px] text-muted-foreground font-normal font-mono">
                      ID: {att.studentId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {att.status === 'submitted' && <Badge variant="success" className="text-[10px]">Selesai</Badge>}
                    {att.status === 'flagged' && <Badge variant="destructive" className="text-[10px]">Flagged</Badge>}
                    {att.status === 'in_progress' && <Badge variant="warning" className="text-[10px]">Mengerjakan</Badge>}
                    {att.status === 'not_started' && <Badge variant="secondary" className="text-[10px]">Belum Mulai</Badge>}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-sm text-foreground">
                    {att.score !== null ? (
                      att.score
                    ) : (
                      <span className="text-xs font-normal text-muted-foreground italic">
                        Belum Selesai
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-semibold">
                    {att.correctCount}
                  </td>
                  <td className="py-3.5 px-4 text-center text-destructive font-semibold">
                    {att.wrongCount}
                  </td>
                  <td className="py-3.5 px-4 text-center text-muted-foreground">
                    {att.unansweredCount}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground text-xs font-mono">
                    {att.timeSpent ? formatTime(att.timeSpent) : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAttemptForDetail(att)}
                      title="Lihat Rincian Jawaban"
                      className="h-7 w-7 p-0 text-primary hover:text-primary"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Participant Detail Modal using Shadcn Dialog */}
      <Dialog
        open={!!selectedAttemptForDetail}
        onOpenChange={(open) => !open && setSelectedAttemptForDetail(null)}
      >
        {selectedAttemptForDetail && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Lembar Jawaban & Analisis Butir Soal
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Peserta: {selectedAttemptForDetail.studentName} • Skor Akhir:{' '}
                <span className="font-bold text-foreground">
                  {selectedAttemptForDetail.score ?? 'N/A'}
                </span>
              </p>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block uppercase">
                    Benar
                  </span>
                  <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-100">
                    {selectedAttemptForDetail.correctCount} Soal
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <span className="text-[10px] text-destructive font-bold block uppercase">
                    Salah
                  </span>
                  <span className="text-lg font-extrabold text-destructive">
                    {selectedAttemptForDetail.wrongCount} Soal
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-input border border-border">
                  <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                    Kosong
                  </span>
                  <span className="text-lg font-extrabold text-foreground">
                    {selectedAttemptForDetail.unansweredCount} Soal
                  </span>
                </div>
              </div>

              {/* Breakdown Per Question */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground">
                  Rincian Jawaban Per Butir Soal:
                </h4>
                {questions.map((q, idx) => {
                  const studentAns = selectedAttemptForDetail.answers.find(
                    (a) => a.questionId === q.id
                  );
                  const isAnswered =
                    studentAns?.selectedOptionId ||
                    studentAns?.shortAnswerText ||
                    (studentAns?.selectedOptionIds && studentAns.selectedOptionIds.length > 0);

                  const selectedOpt = q.options.find(
                    (o) => o.id === studentAns?.selectedOptionId
                  );
                  const isCorrect = selectedOpt?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-border bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">
                          {idx + 1}. [{q.code}] {q.subject}
                        </span>
                        {isAnswered ? (
                          isCorrect ? (
                            <Badge variant="success" className="text-[10px] gap-1">
                              <CheckCircle className="w-3 h-3" /> Benar (+{q.points})
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] gap-1">
                              <XCircle className="w-3 h-3" /> Salah
                            </Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Tidak Terjawab
                          </Badge>
                        )}
                      </div>

                      <p className="text-foreground leading-relaxed line-clamp-2">
                        {q.content}
                      </p>

                      <div className="p-2 rounded-lg bg-input/50 text-[11px] space-y-1">
                        <div>
                          <span className="text-muted-foreground">Jawaban Peserta:</span>{' '}
                          <span className="font-semibold text-foreground">
                            {selectedOpt
                              ? `${selectedOpt.label}. ${selectedOpt.content}`
                              : studentAns?.shortAnswerText ||
                                (studentAns?.selectedOptionIds?.join(', ') ?? '-')}
                          </span>
                        </div>
                        {q.explanation && (
                          <div className="pt-1 border-t border-border text-muted-foreground">
                            <span className="font-semibold text-foreground">Pembahasan:</span>{' '}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
