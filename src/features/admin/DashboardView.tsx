import React from 'react';
import { useCbt } from '../../context/CbtContext';
import {
  FileQuestion,
  Layers,
  CalendarDays,
  Activity,
  Award,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export const DashboardView: React.FC = () => {
  const { questions, packages, events, attempts, setAdminView, setSelectedEventId } = useCbt();

  const ongoingEvents = events.filter((e) => e.status === 'ongoing');
  const activeParticipants = attempts.filter((a) => a.status === 'in_progress').length;
  const completedAttempts = attempts.filter((a) => a.status === 'submitted' || a.status === 'auto_submitted').length;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner with Tangerine Primary Accent */}
      <div className="p-6 rounded-2xl bg-card border border-border text-card-foreground shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <Badge variant="accent" className="gap-1.5 px-3 py-1 font-semibold text-xs border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Panel Koordinasi Akademik & Ujian CBT</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Selamat Datang di CBT Tryout
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Platform komprehensif simulasi ujian UTBK SNBT, SKD CPNS, dan asesmen sekolah. Kelola bank soal, rancang paket terstruktur, pantau pengerjaan langsung, dan analisis capaian nilai peserta.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 opacity-5 pointer-events-none flex items-center justify-center">
          <FileQuestion className="w-full h-full text-primary" />
        </div>
      </div>

      {/* Primary KPI Grid using Shadcn Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => setAdminView('questions')}
          className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
        >
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Bank Soal Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileQuestion className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-extrabold text-foreground mt-1">{questions.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>6 ragam tipe soal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setAdminView('packages')}
          className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
        >
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Paket Ujian Siap Pakai</span>
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-extrabold text-foreground mt-1">{packages.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Standar UTBK & CPNS</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setAdminView('events')}
          className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
        >
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Event Berlangsung</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-extrabold text-foreground mt-1">{ongoingEvents.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Dari {events.length} jadwal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setAdminView('monitoring')}
          className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
        >
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Peserta Sedang Ujian</span>
            <div className="w-8 h-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-extrabold text-foreground mt-1">{activeParticipants}</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>{completedAttempts} telah selesai</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main split: Ongoing Events & Curriculum Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Events List */}
        <Card className="lg:col-span-2 shadow-2xs">
          <CardHeader className="p-5 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Event Tryout Berjalan Saat Ini
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Jadwal aktif yang sedang berlangsung dan dapat dimonitor real-time
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdminView('events')}
              className="text-xs font-semibold text-primary hover:text-primary/90"
            >
              Lihat Semua Jadwal →
            </Button>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            {events.map((evt) => {
              const pkg = packages.find((p) => p.id === evt.packageId);
              const isOngoing = evt.status === 'ongoing';
              return (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-border bg-input/40 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{evt.name}</span>
                      <Badge
                        variant={isOngoing ? 'success' : 'secondary'}
                        className="text-[10px] font-bold"
                      >
                        {isOngoing ? 'SEDANG BERLANGSUNG' : 'TERJADWAL'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paket: <span className="font-semibold text-foreground">{pkg?.name}</span> • Batch: {evt.assignedBatch.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setAdminView('monitoring');
                      }}
                      className="h-8 text-xs gap-1.5 font-semibold"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Monitoring
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setAdminView('results');
                      }}
                      className="h-8 text-xs gap-1.5 font-medium"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Hasil
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right card: System Capabilities Summary */}
        <Card className="shadow-2xs">
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Standar Kurikulum & Tipe Soal
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Mendukung 6 format butir soal standar SNPMB BPPP Kemendikbudristek & BKN CPNS.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-input/50 border border-border flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Pilihan Ganda A–E
              </span>
              <Badge variant="secondary" className="text-[10px]">Kunci tunggal</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-input/50 border border-border flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> PG Kompleks
              </span>
              <Badge variant="secondary" className="text-[10px]">Multi centang</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-input/50 border border-border flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Benar / Salah
              </span>
              <Badge variant="secondary" className="text-[10px]">Dua kutub logika</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-input/50 border border-border flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Menjodohkan (Matching)
              </span>
              <Badge variant="secondary" className="text-[10px]">Premis & target</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-input/50 border border-border flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Jawaban Singkat
              </span>
              <Badge variant="secondary" className="text-[10px]">Isian teks/angka</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-input/50 border border-border flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Esai / Uraian
              </span>
              <Badge variant="secondary" className="text-[10px]">Rubrik skor</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
