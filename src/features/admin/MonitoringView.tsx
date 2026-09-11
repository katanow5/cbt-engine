import React, { useState, useEffect, useMemo } from 'react';
import { useCbt } from '../../context/CbtContext';
import { ExamAttempt } from '../../types/cbt.types';
import { formatTime } from '../../lib/utils';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export const MonitoringView: React.FC = () => {
  const {
    events,
    packages,
    attempts,
    selectedEventId,
    setSelectedEventId,
    simulatePeriodicProgress,
    showToast,
  } = useCbt();

  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'submitted' | 'flagged'>('all');
  const [search, setSearch] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);

  // Periodic simulated monitoring tick
  useEffect(() => {
    const interval = setInterval(() => {
      simulatePeriodicProgress();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const currentPackage = packages.find((p) => p.id === currentEvent?.packageId);
  const totalExamQuestions = currentPackage?.totalQuestions || 7;

  // Filter attempts for this event
  const eventAttempts = useMemo(() => {
    return attempts.filter((att) => att.examEventId === currentEvent?.id);
  }, [attempts, currentEvent]);

  const filteredAttempts = useMemo(() => {
    return eventAttempts.filter((att) => {
      const matchSearch = att.studentName.toLowerCase().includes(search.toLowerCase());
      let matchStatus = true;
      if (statusFilter === 'in_progress') matchStatus = att.status === 'in_progress';
      if (statusFilter === 'submitted') matchStatus = att.status === 'submitted' || att.status === 'auto_submitted';
      if (statusFilter === 'flagged') matchStatus = att.violations.length > 0 || att.status === 'flagged';
      return matchSearch && matchStatus;
    });
  }, [eventAttempts, search, statusFilter]);

  // Statistics counters
  const inProgressCount = eventAttempts.filter((a) => a.status === 'in_progress').length;
  const completedCount = eventAttempts.filter((a) => a.status === 'submitted' || a.status === 'auto_submitted').length;
  const violationCount = eventAttempts.filter((a) => a.violations.length > 0 || a.status === 'flagged').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Monitoring Peserta Live
            </h1>
            <Badge variant="destructive" className="animate-pulse gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Live Feed
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pengawasan real-time progres pengerjaan soal dan deteksi pelanggaran ujian berbasis state lokal.
          </p>
        </div>

        {/* Event selector & manual refresh */}
        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="flex h-9 px-3 text-xs font-semibold rounded-lg border border-border bg-input text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-2xs"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name} ({evt.status})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              simulatePeriodicProgress();
              showToast('Feed status peserta berhasil diperbarui!', 'info');
            }}
            title="Simulasi Pembaruan Manual"
            className="text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground block">
              Total Peserta
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {eventAttempts.length}
            </span>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-primary block">
              Sedang Mengerjakan
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {inProgressCount}
            </span>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
              Sudah Selesai
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {completedCount}
            </span>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-destructive block">
              Terindikasi Pelanggaran
            </span>
            <span className="text-2xl font-extrabold text-destructive mt-1 block">
              {violationCount}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-2xs">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="h-8 text-xs font-semibold"
            >
              Semua ({eventAttempts.length})
            </Button>
            <Button
              variant={statusFilter === 'in_progress' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('in_progress')}
              className="h-8 text-xs font-semibold"
            >
              Mengerjakan ({inProgressCount})
            </Button>
            <Button
              variant={statusFilter === 'submitted' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('submitted')}
              className="h-8 text-xs font-semibold"
            >
              Selesai ({completedCount})
            </Button>
            <Button
              variant={statusFilter === 'flagged' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('flagged')}
              className="h-8 text-xs font-semibold"
            >
              Pelanggaran ({violationCount})
            </Button>
          </div>

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
        </CardContent>
      </Card>

      {/* Participant Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAttempts.map((att) => {
          const answeredCount = att.answers.filter(
            (a) => a.selectedOptionId !== null || a.shortAnswerText !== null || (a.selectedOptionIds && a.selectedOptionIds.length > 0)
          ).length;
          const progressPercent = Math.round((answeredCount / totalExamQuestions) * 100);

          return (
            <Card
              key={att.id}
              onClick={() => setSelectedAttempt(att)}
              className={`transition-all cursor-pointer hover:shadow-md hover:border-primary/50 shadow-2xs ${
                att.violations.length > 0 || att.status === 'flagged'
                  ? 'border-destructive/40 bg-destructive/5'
                  : ''
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {att.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground leading-tight">
                        {att.studentName}
                      </h4>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ID: {att.studentId}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {att.status === 'in_progress' && (
                    <Badge variant="warning" className="text-[10px] gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Aktif
                    </Badge>
                  )}
                  {att.status === 'submitted' && (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Selesai
                    </Badge>
                  )}
                  {att.status === 'flagged' && (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <ShieldAlert className="w-3 h-3" /> Flagged
                    </Badge>
                  )}
                  {att.status === 'not_started' && (
                    <Badge variant="secondary" className="text-[10px]">
                      Belum Mulai
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progres Pengisian:</span>
                    <span className="font-semibold text-foreground">
                      {answeredCount} / {totalExamQuestions} Soal ({progressPercent}%)
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Time & Violations summary */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {att.timeSpent ? formatTime(att.timeSpent) : '00:00'} berlalu
                    </span>
                  </div>

                  {att.violations.length > 0 ? (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {att.violations.length} Pelanggaran
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium">
                      Aman • 0 Log
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Participant Detail Modal with Violation Logs using Shadcn Dialog */}
      <Dialog open={!!selectedAttempt} onOpenChange={(open) => !open && setSelectedAttempt(null)}>
        {selectedAttempt && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Detail & Log Aktivitas Peserta
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {selectedAttempt.studentName} (ID: {selectedAttempt.studentId})
              </p>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-input/50 border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Status Ujian:</span>
                  <span className="font-bold text-foreground text-xs uppercase">
                    {selectedAttempt.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Waktu Pengerjaan:</span>
                  <span className="font-bold text-foreground text-xs">
                    {selectedAttempt.timeSpent ? formatTime(selectedAttempt.timeSpent) : '00:00'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Soal Terjawab:</span>
                  <span className="font-bold text-foreground text-xs">
                    {selectedAttempt.answers.length} Butir
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Skor (Bila Selesai):</span>
                  <span className="font-bold text-foreground text-xs">
                    {selectedAttempt.score !== null ? selectedAttempt.score : 'Belum Tersedia'}
                  </span>
                </div>
              </div>

              {/* Violations Log Section */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Catatan Deteksi Pelanggaran ({selectedAttempt.violations.length})
                </h4>
                {selectedAttempt.violations.length === 0 ? (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                    Tidak ada catatan kecurigaan atau perpindahan tab yang terdeteksi selama sesi.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedAttempt.violations.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-destructive block">
                            {v.type === 'tab_switch' && 'Pindah Tab Browser'}
                            {v.type === 'window_blur' && 'Fokus Jendela Hilang'}
                            {v.type === 'fullscreen_exit' && 'Keluar Mode Layar Penuh'}
                            {v.type === 'copy_paste' && 'Upaya Salin Teks'}
                            {v.type === 'multiple_face' && 'Terdeteksi Lebih dari 1 Orang'}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            {v.note}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                          {new Date(v.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
