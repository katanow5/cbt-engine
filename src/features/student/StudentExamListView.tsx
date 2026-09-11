import React, { useState } from 'react';
import { useCbt } from '../../context/CbtContext';
import { ExamEvent } from '../../types/cbt.types';
import { formatDateTime } from '../../lib/utils';
import {
  Clock,
  FileQuestion,
  KeyRound,
  PlayCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';

export const StudentExamListView: React.FC = () => {
  const {
    events,
    packages,
    attempts,
    startAttempt,
    setStudentView,
    setActiveAttemptId,
    setSelectedEventId,
    showToast,
  } = useCbt();

  const [activeTab, setActiveTab] = useState<'ongoing' | 'scheduled' | 'completed'>('ongoing');
  const [tokenInput, setTokenInput] = useState<{ [eventId: string]: string }>({
    'evt-ongoing-01': 'UTBK2025',
  });
  const [tokenError, setTokenError] = useState<{ [eventId: string]: string }>({});

  const filteredEvents = events.filter((e) => {
    if (activeTab === 'ongoing') return e.status === 'ongoing';
    if (activeTab === 'scheduled') return e.status === 'scheduled';
    if (activeTab === 'completed') return e.status === 'completed';
    return true;
  });

  const handleStartExam = (evt: ExamEvent) => {
    // Check access token if required
    if (evt.accessCode) {
      const entered = (tokenInput[evt.id] || '').trim();
      if (!entered) {
        // Auto-fill token for seamless demo start
        setTokenInput((prev) => ({ ...prev, [evt.id]: evt.accessCode! }));
      } else if (entered.toUpperCase() !== evt.accessCode.toUpperCase()) {
        setTokenError({
          ...tokenError,
          [evt.id]: `Token akses tidak valid! (Petunjuk token: ${evt.accessCode})`,
        });
        return;
      }
    }

    const attemptId = startAttempt(evt.id);
    setSelectedEventId(evt.id);
    setActiveAttemptId(attemptId);
    setStudentView('exam-runner');
    showToast(`Memulai sesi ujian: ${evt.name}. Semoga sukses!`, 'info');
  };

  const handleViewResult = (evt: ExamEvent) => {
    const att = attempts.find((a) => a.examEventId === evt.id && a.studentId === 'std-current');
    if (att) {
      setActiveAttemptId(att.id);
      setSelectedEventId(evt.id);
      setStudentView('student-results');
    } else {
      showToast('Belum ada lembar hasil tersimpan untuk tryout ini.', 'warning');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Badge variant="accent" className="font-mono text-[10px] uppercase mb-1.5">
            Portal Ujian CBT Siswa
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            Daftar Tryout & Asesmen Mandiri
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Pilih paket tryout yang sedang berlangsung untuk memulai pengerjaan dengan format ujian resmi.
          </p>
        </div>

        <Card className="shadow-2xs">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              AF
            </div>
            <div className="text-xs">
              <span className="font-bold text-foreground block">Ahmad Faiz</span>
              <span className="text-muted-foreground">NISN: 007281920 • Siswa XII</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'ongoing' | 'scheduled' | 'completed')}
      >
        <TabsList className="bg-input border border-border">
          <TabsTrigger value="ongoing" className="text-xs font-semibold gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sedang Berlangsung ({events.filter((e) => e.status === 'ongoing').length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs font-semibold gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Akan Datang ({events.filter((e) => e.status === 'scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs font-semibold gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Riwayat Ujian ({events.filter((e) => e.status === 'completed').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tryout Cards Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="p-16 text-center shadow-2xs">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-base text-foreground">
            Belum ada tryout tersedia saat ini.
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Jadwal tryout untuk kategori ini akan diumumkan segera oleh koordinator akademik.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const pkg = packages.find((p) => p.id === evt.packageId);
            const userAttempt = attempts.find(
              (a) => a.examEventId === evt.id && a.studentId === 'std-current'
            );
            const isOngoing = evt.status === 'ongoing';
            const isFinished =
              userAttempt?.status === 'submitted' ||
              userAttempt?.status === 'auto_submitted' ||
              userAttempt?.status === 'flagged';

            return (
              <Card
                key={evt.id}
                className="flex flex-col justify-between shadow-2xs hover:border-primary/50 transition-all"
              >
                <CardHeader className="p-6 pb-4">
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {pkg?.category ? pkg.category.toUpperCase() : 'UTBK SNBT'}
                    </Badge>
                    {isOngoing ? (
                      <Badge variant="success" className="text-[11px] gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Tersedia Sekarang
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        {evt.status === 'scheduled' ? 'Belum Dimulai' : 'Ujian Ditutup'}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg font-bold leading-snug">
                    {evt.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1.5 leading-relaxed">
                    {pkg?.description ||
                      'Simulasi ujian komprehensif dengan sistem penilaian CBT terstandar.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  {/* Meta details: duration, questions, schedule */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-input/50 border border-border text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Durasi Ujian:</span>
                        <span className="font-bold">{pkg?.totalDuration || 55} Menit</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <FileQuestion className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Jumlah Soal:</span>
                        <span className="font-bold">{pkg?.totalQuestions || 7} Butir</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-[11px] text-muted-foreground border-t border-border pt-2">
                      Batas Pengerjaan:{' '}
                      <span className="font-medium text-foreground">
                        {formatDateTime(evt.endTime)}
                      </span>
                    </div>
                  </div>

                  {/* Token Input if accessCode is required and user hasn't finished */}
                  {evt.accessCode && isOngoing && !isFinished && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          Token Akses Ujian:
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTokenInput({ ...tokenInput, [evt.id]: evt.accessCode! });
                            setTokenError({ ...tokenError, [evt.id]: '' });
                          }}
                          className="h-5 px-1 text-[11px] text-primary hover:text-primary font-bold"
                        >
                          Pakai Token Demo ({evt.accessCode})
                        </Button>
                      </div>
                      <Input
                        type="text"
                        value={tokenInput[evt.id] || ''}
                        onChange={(e) => {
                          setTokenInput({ ...tokenInput, [evt.id]: e.target.value.toUpperCase() });
                          setTokenError({ ...tokenError, [evt.id]: '' });
                        }}
                        placeholder={`Ketik ${evt.accessCode}`}
                        className="text-xs font-mono font-bold tracking-widest uppercase"
                      />
                      {tokenError[evt.id] && (
                        <p className="text-[11px] text-destructive font-medium">
                          {tokenError[evt.id]}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Action CTA Button */}
                <CardFooter className="p-6 pt-0 border-t border-border mt-auto">
                  {isFinished ? (
                    <div className="flex items-center justify-between w-full pt-4">
                      <div className="text-xs">
                        <span className="text-muted-foreground block text-[11px]">Status Ujian:</span>
                        <span className="font-bold text-emerald-600">Selesai Dikerjakan</span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewResult(evt)}
                        className="text-xs font-bold gap-1.5"
                      >
                        Lihat Nilai & Pembahasan <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : isOngoing ? (
                    <div className="w-full pt-4">
                      <Button
                        onClick={() => handleStartExam(evt)}
                        className="w-full font-bold text-sm gap-2 shadow-xs"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Mulai Mengerjakan Ujian
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full pt-4">
                      <Button
                        disabled
                        variant="outline"
                        className="w-full font-semibold text-xs"
                      >
                        Ujian Belum Dimulai (Terjadwal)
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
