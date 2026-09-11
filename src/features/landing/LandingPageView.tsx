import React, { useState, useEffect } from 'react';
import { useCbt } from '../../context/CbtContext';
import {
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  BookOpen,
  Sparkles,
  Server,
  Layers,
  Database,
  BarChart3,
  Moon,
  Sun,
  Clock,
  Flag,
  RotateCcw,
  CheckCircle2,
  Activity,
  Cpu,
  Zap,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

interface SimQuestion {
  id: number;
  number: number;
  subtest: string;
  category: string;
  text: string;
  options: { key: string; label: string }[];
}

const SIM_QUESTIONS: SimQuestion[] = [
  {
    id: 1,
    number: 12,
    subtest: 'TPS — Penalaran Umum',
    category: 'Penalaran Deduktif & Silogisme',
    text: 'Semua peserta tryout yang terbiasa menganalisis butir soal mengalami peningkatan skor secara konsisten. Sebagian siswa kelas XII tidak mengalami peningkatan skor secara konsisten. Simpulan yang PALING SAH adalah...',
    options: [
      { key: 'A', label: 'Sebagian siswa kelas XII tidak terbiasa menganalisis butir soal.' },
      { key: 'B', label: 'Semua siswa kelas XII tidak pernah mengikuti simulasi tryout CBT.' },
      { key: 'C', label: 'Siswa yang mengalami peningkatan skor pasti bukan siswa kelas XII.' },
      { key: 'D', label: 'Analisis butir soal tidak berdampak terhadap hasil tryout siswa.' },
      { key: 'E', label: 'Tidak ada simpulan yang dapat ditarik secara logis.' },
    ],
  },
  {
    id: 2,
    number: 13,
    subtest: 'Literasi Bahasa Indonesia',
    category: 'Pemahaman Bacaan & Makna Teks',
    text: 'Metode penilaian Item Response Theory (IRT) mengalokasikan bobot skor berdasarkan parameter daya pembeda dan tingkat kesulitan aktual butir soal. Manakah dampak langsung dari penerapan metode tersebut?',
    options: [
      { key: 'A', label: 'Butir soal yang dijawab benar oleh sedikit peserta berbobot nilai lebih tinggi.' },
      { key: 'B', label: 'Setiap butir soal memiliki bobot skor seragam tanpa memandang kesulitan.' },
      { key: 'C', label: 'Kecepatan pengumpulan lembar jawaban menjadi faktor utama penentu kelulusan.' },
      { key: 'D', label: 'Peserta yang menjawab salah akan langsung didiskualifikasi dari sistem.' },
      { key: 'E', label: 'Skor akhir dihitung semata-mata dari jumlah jawaban yang terisi.' },
    ],
  },
  {
    id: 3,
    number: 14,
    subtest: 'Penalaran Matematika',
    category: 'Aljabar & Pemodelan Sistem',
    text: 'Dalam simulasi serentak, server CBT melayani 1.200 pengiriman jawaban per detik dengan latensi median 18 milidetik. Berapakah jawaban yang berhasil divalidasi dan tersimpan lokal selama periode 5 detik?',
    options: [
      { key: 'A', label: '6.000 jawaban tersimpan aman tanpa kehilangan paket data.' },
      { key: 'B', label: '1.200 jawaban karena keterbatasan bandwidth browser.' },
      { key: 'C', label: '3.600 jawaban dengan toleransi kegagalan 50%.' },
      { key: 'D', label: 'Sistem mengalami timeout sebelum penyimpanan selesai.' },
      { key: 'E', label: 'Hanya jawaban berstatus ragu-ragu yang diproses server.' },
    ],
  },
];

export const LandingPageView: React.FC = () => {
  const { setAppMode, setRole, setAdminView, setStudentView, showToast, theme, toggleTheme } = useCbt();
  const isDark = theme === 'dark';

  // Copy state for snippet cards
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Student Exam Simulation States
  const [simActiveIndex, setSimActiveIndex] = useState(0);
  const [simAnswers, setSimAnswers] = useState<Record<number, string>>({ 0: 'A', 1: 'A' });
  const [simFlagged, setSimFlagged] = useState<Record<number, boolean>>({ 1: true });
  const [simSecondsLeft, setSimSecondsLeft] = useState(2548); // ~42:28
  const [simTextSize, setSimTextSize] = useState<'normal' | 'large'>('normal');

  // Interactive live timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSimSecondsLeft((prev) => (prev > 0 ? prev - 1 : 2700));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSimTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = SIM_QUESTIONS[simActiveIndex] || SIM_QUESTIONS[0];

  const handleSelectOption = (key: string) => {
    setSimAnswers((prev) => ({
      ...prev,
      [simActiveIndex]: key,
    }));
  };

  const handleToggleFlag = () => {
    setSimFlagged((prev) => {
      const nextVal = !prev[simActiveIndex];
      if (nextVal) {
        showToast(`Soal no. ${currentQ.number} ditandai ragu-ragu`, 'info');
      } else {
        showToast(`Tanda ragu-ragu pada soal no. ${currentQ.number} dilepas`, 'info');
      }
      return {
        ...prev,
        [simActiveIndex]: nextVal,
      };
    });
  };

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      showToast(`Command disalin: ${text}`, 'info');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const launchStudent = () => {
    setRole('student');
    setStudentView('exam-list');
    setAppMode('app');
  };

  const launchAdmin = (view: 'dashboard' | 'questions' | 'packages' | 'events' | 'monitoring' = 'dashboard') => {
    setRole('admin');
    setAdminView(view);
    setAppMode('app');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative selection:bg-primary/25 selection:text-primary transition-colors duration-200 overflow-x-hidden">
      {/* Top Ambient Radial Accent aligned with Dashboard Palette */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* NAVIGATION BAR - Harmonized with Dashboard */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/85 border-b border-border px-4 sm:px-8 py-3 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 font-display font-bold tracking-tight text-foreground text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(224,93,56,0.6)] animate-pulse" />
              <span className="text-primary font-extrabold tracking-tight text-lg">cbt-engine</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 font-sans text-xs sm:text-sm font-medium text-muted-foreground">
            <a href="#simulasi" className="hover:text-primary transition-colors">
              Simulasi Siswa
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Fitur Unggulan
            </a>
            <a href="#workflow" className="hover:text-primary transition-colors">
              Alur Kerja
            </a>
            <a href="#metrics" className="hover:text-primary transition-colors">
              Telemetri Live
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors">
              Paket &amp; Harga
            </a>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-8 px-2.5 text-xs font-sans font-medium border-border bg-card text-foreground hover:bg-secondary flex items-center gap-1.5 transition-colors shadow-2xs"
              title={isDark ? 'Ganti ke Light Theme' : 'Ganti ke Dark Theme'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-foreground" />
                  <span className="hidden sm:inline text-xs font-medium">Dark</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => launchAdmin('dashboard')}
              className="border-border bg-card hover:bg-secondary text-foreground font-display font-semibold text-xs h-8 px-3 shadow-2xs"
            >
              Konsol Admin
            </Button>

            <Button
              size="sm"
              onClick={launchStudent}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-xs h-8 px-3.5 shadow-sm transition-all"
            >
              Tryout Siswa
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH INTERACTIVE STUDENT EXAM SIMULATION */}
      <section id="simulasi" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline + Description + CTAs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Simulasi Ujian UTBK &amp; CPNS —{' '}
              <span className="text-primary font-black">
                Cepat, Presisi, dan Terisolasi.
              </span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-sans max-w-xl">
              Pengalaman pengerjaan ujian siswa yang nyaman dan bebas lag dengan sistem anti-kecurangan aktif,
              penilaian IRT otomatis, auto-save cerdas, dan analisis performa instan.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button
                size="lg"
                onClick={launchStudent}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm px-6 h-12 shadow-sm transition-all gap-2"
              >
                <span>Mulai Tryout Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => launchAdmin('dashboard')}
                className="border-border bg-card hover:bg-secondary text-foreground font-display font-semibold text-sm px-5 h-12 gap-2 shadow-2xs"
              >
                <span>Buka Dashboard Admin →</span>
              </Button>
            </div>

            {/* Feature Checklist */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-sans font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Anti-Cheat Real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Skor IRT Adaptif</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Penyimpanan Lokal Resilient</span>
              </div>
            </div>
          </div>

          {/* Right Column: INTERACTIVE STUDENT EXAM RUNNER SIMULATION */}
          <div className="lg:col-span-7">
            <div className="relative group">
              {/* Soft Ambient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-amber-500/15 to-primary/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Main Simulation Card Frame */}
              <div className="relative rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden font-sans transition-all duration-200">
                {/* Simulation Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/70 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-xs font-display font-bold text-foreground">
                      Simulasi Pengerjaan Siswa (CBT Runner)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary font-sans text-[11px] font-semibold py-0.5 px-2.5"
                    >
                      Live Interaktif
                    </Badge>
                  </div>
                </div>

                {/* Exam Runner Header Strip */}
                <div className="px-4 py-3 bg-card border-b border-border flex flex-wrap items-center justify-between gap-2.5">
                  {/* Subtest and Student Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-display font-bold text-foreground leading-tight">
                        {currentQ.subtest}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Peserta: <span className="font-semibold text-foreground">Ahmad Fauzan</span> (Demo)
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer and Status Indicator */}
                  <div className="flex items-center gap-2.5">
                    {/* Text Size Scale Toggle */}
                    <div className="flex items-center border border-border rounded-lg bg-secondary/50 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setSimTextSize('normal')}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          simTextSize === 'normal' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                        }`}
                        title="Ukuran Teks Normal"
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimTextSize('large')}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          simTextSize === 'large' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                        }`}
                        title="Ukuran Teks Besar"
                      >
                        A+
                      </button>
                    </div>

                    {/* Timer Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatSimTime(simSecondsLeft)}</span>
                    </div>

                    {/* Auto-save Status Pill */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Tersimpan</span>
                    </div>
                  </div>
                </div>

                {/* Question and Interactive Choices Workspace */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Question Index Badge and Category */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-display font-extrabold text-xs">
                        Soal No. {currentQ.number}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">dari 30 butir</span>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-medium border-border text-muted-foreground bg-secondary/40">
                      {currentQ.category}
                    </Badge>
                  </div>

                  {/* Question Prompt Stem */}
                  <p
                    className={`text-foreground font-sans font-normal leading-relaxed ${
                      simTextSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                    }`}
                  >
                    {currentQ.text}
                  </p>

                  {/* Multiple Choice Options List */}
                  <div className="space-y-2 pt-1">
                    {currentQ.options.map((option) => {
                      const isSelected = simAnswers[simActiveIndex] === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleSelectOption(option.key)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 text-xs sm:text-sm ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-foreground font-medium shadow-2xs'
                              : 'border-border bg-secondary/30 text-foreground hover:bg-secondary/70 hover:border-primary/40'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-display font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground border border-border'
                            }`}
                          >
                            {option.key}
                          </span>
                          <span className="leading-snug pt-0.5">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Action Controls: Prev, Ragu-ragu, Next */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={simActiveIndex === 0}
                      onClick={() => setSimActiveIndex((prev) => Math.max(0, prev - 1))}
                      className="border-border bg-card text-foreground hover:bg-secondary font-display font-semibold text-xs h-9 px-3.5 disabled:opacity-40"
                    >
                      ← Sebelumnya
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleFlag}
                      className={`font-display font-semibold text-xs h-9 px-3.5 gap-1.5 transition-all ${
                        simFlagged[simActiveIndex]
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-2xs'
                          : 'border-border bg-card text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Flag
                        className={`w-3.5 h-3.5 ${
                          simFlagged[simActiveIndex] ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
                        }`}
                      />
                      <span>{simFlagged[simActiveIndex] ? 'Ragu-ragu (Aktif)' : 'Tandai Ragu-ragu'}</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setSimActiveIndex((prev) => (prev < SIM_QUESTIONS.length - 1 ? prev + 1 : 0))}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-xs h-9 px-4 shadow-sm"
                    >
                      <span>Simpan &amp; Lanjut →</span>
                    </Button>
                  </div>

                  {/* Question Palette Matrix (Nomor Soal) */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                      <span>Daftar Navigasi Nomor Soal:</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded bg-emerald-500" /> Terjawab
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded bg-amber-500" /> Ragu
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded border border-border bg-card" /> Belum
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                      {Array.from({ length: 15 }, (_, i) => {
                        const qNum = i + 1;
                        const isSimQ = qNum >= 12 && qNum <= 14;
                        const simTargetIndex = qNum - 12;
                        const isActive = isSimQ && simTargetIndex === simActiveIndex;
                        const hasAnswer = isSimQ ? Boolean(simAnswers[simTargetIndex]) : qNum <= 10;
                        const isRagu = isSimQ ? Boolean(simFlagged[simTargetIndex]) : qNum === 8;

                        return (
                          <button
                            key={qNum}
                            type="button"
                            onClick={() => {
                              if (isSimQ) {
                                setSimActiveIndex(simTargetIndex);
                              } else {
                                showToast(`Klik nomor 12, 13, atau 14 untuk simulasi butir aktif`, 'info');
                              }
                            }}
                            className={`h-7 rounded-lg text-[11px] font-display font-bold transition-all flex items-center justify-center ${
                              isActive
                                ? 'ring-2 ring-primary ring-offset-1 ring-offset-card bg-primary text-primary-foreground shadow-2xs'
                                : isRagu
                                ? 'bg-amber-500 text-white dark:bg-amber-500/90'
                                : hasAnswer
                                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                                : 'border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                            title={`Soal nomor ${qNum}`}
                          >
                            {qNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Simulation Bottom Callout Strip */}
                <div className="px-4 py-2.5 bg-secondary/80 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium hidden sm:inline">
                    Simulasi interaktif langsung di peramban tanpa instalasi plugin.
                  </span>
                  <button
                    type="button"
                    onClick={launchStudent}
                    className="text-primary font-display font-bold hover:underline flex items-center gap-1.5 ml-auto"
                  >
                    <span>Coba Ujian Penuh Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO & TRUST STRIP */}
      <section className="relative z-10 border-y border-border bg-card/60 py-8 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="text-center font-sans text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Dipercaya untuk Penyelenggaraan Ujian &amp; Tryout di Berbagai Lembaga Pendidikan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-foreground font-display text-xs sm:text-sm font-bold tracking-wider">
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Server className="w-4 h-4 text-primary" />
              <span>SMA TARUNA NUSANTARA</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Layers className="w-4 h-4 text-primary" />
              <span>BIMBEL SALEMBA GROUP</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>POLITEKNIK SIBER MANDIRI</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Cpu className="w-4 h-4 text-primary" />
              <span>UTBK SNBT CENTER</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Database className="w-4 h-4 text-primary" />
              <span>KEDINASAN ACADEMY</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary font-sans text-xs font-bold uppercase tracking-wider">
              <span>Keunggulan Sistem CBT</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-snug">
              Semua kapabilitas dirancang presisi, responsif, dan tanpa friksi teknis.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans leading-relaxed">
              Arsitektur CBT kami memprioritaskan kenyamanan pengerjaan siswa dan kemudahan administrasi bagi guru atau pengawas.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1: Instant Grading */}
            <Card className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all text-card-foreground shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-primary font-bold text-xs uppercase tracking-wider">
                    Instant Auto-Grading
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/10">
                    50ms response
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Koreksi Otomatis Ribuan Lembar Jawaban
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                <p>
                  Mendukung 6 tipe butir soal komprehensif: Pilihan Ganda Tunggal, Pilihan Ganda Kompleks, Benar/Salah, Menjodohkan (Matching), Isian Singkat, hingga Uraian Esai analitis.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: Active Proctoring */}
            <Card className="bg-card border-border hover:border-amber-500/50 hover:shadow-md transition-all text-card-foreground shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    Active Anti-Cheat
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                    zero plugin
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Deteksi Integritas &amp; Pelanggaran Real-Time
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                <p>
                  Sistem otomatis mendeteksi perpindahan tab browser, blur jendela layar, hingga keluar dari mode Fullscreen dengan batas toleransi 3 kali sebelum status ditandai (Flagged).
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: IRT Scoring */}
            <Card className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all text-card-foreground shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-primary font-bold text-xs uppercase tracking-wider">
                    IRT Scoring Engine
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/10">
                    adaptive snbt
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Model Penilaian Bobot IRT &amp; Passing Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                <p>
                  Konfigurasikan skema skor standar (+4 / -1 / 0) atau Item Response Theory (IRT) yang memperhitungkan tingkat kesulitan soal dan daya pembeda secara dinamis.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4: Offline-First Resilient */}
            <Card className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all text-card-foreground shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-primary font-bold text-xs uppercase tracking-wider">
                    Offline Resilience
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/10">
                    100% retention
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Penyimpanan Jawaban Lokal Resilient
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                <p>
                  Setiap ketikan dan pilihan jawaban tersimpan instan di cache peramban lokal. Jika koneksi internet terputus, pengerjaan tetap berlanjut dan tersinkron otomatis saat daring.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3-STEP WORKFLOW */}
      <section id="workflow" className="relative z-10 border-t border-border bg-card/40 py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-3 max-w-2xl">
            <div className="text-primary font-sans text-xs font-bold uppercase tracking-wider">
              Alur Pelaksanaan
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Tiga Langkah Mudah Menggelar Ujian Berskala Besar
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans">
              Mulai dari penyusunan butir soal, penentuan jadwal pelaksanaan, hingga rilis nilai transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-black text-primary">01</span>
                  <Badge variant="outline" className="text-xs font-sans border-border">
                    Bank Soal &amp; Paket
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg font-bold text-foreground">
                  Rancang Paket Ujian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground font-sans">
                <p>
                  Kelompokkan butir soal ke dalam subtes berdurasi ketat. Atur pengacakan nomor soal dan opsi jawaban per peserta.
                </p>
                <div className="bg-secondary/70 p-2.5 rounded-lg border border-border font-mono text-[11px] text-foreground">
                  cbt package create --sections=tps,literasi
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-black text-primary">02</span>
                  <Badge variant="outline" className="text-xs font-sans border-border">
                    Jadwal &amp; Token
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg font-bold text-foreground">
                  Jadwalkan &amp; Pantau Live
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground font-sans">
                <p>
                  Rilis token sesi, aktifkan proctoring anti-kecurangan, dan amati progres seluruh peserta secara waktu-nyata.
                </p>
                <div className="bg-secondary/70 p-2.5 rounded-lg border border-border font-mono text-[11px] text-foreground">
                  cbt schedule --token=UTBK26 --start=now
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-2xs">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-black text-primary">03</span>
                  <Badge variant="outline" className="text-xs font-sans border-border">
                    Analisis &amp; Rapor
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg font-bold text-foreground">
                  Ekspor Hasil &amp; Rapor Nilai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground font-sans">
                <p>
                  Dapatkan rekapitulasi nilai lengkap, peringkat peserta, statistik daya beda butir soal, dan unduh format spreadsheet.
                </p>
                <div className="bg-secondary/70 p-2.5 rounded-lg border border-border font-mono text-[11px] text-foreground">
                  cbt report export --format=csv,pdf
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* METRICS & TELEMETRY BAND */}
      <section id="metrics" className="relative z-10 border-y border-border bg-card/60 py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-primary">
                99.98%
              </div>
              <div className="font-sans text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Uptime Ketersediaan
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-primary">
                &lt; 20ms
              </div>
              <div className="font-sans text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Latensi Simpan Jawaban
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-primary">
                10k+
              </div>
              <div className="font-sans text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Kapasitas Siswa Serentak
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-primary">
                6 Ragam
              </div>
              <div className="font-sans text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Tipe Butir Soal AKM
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & PACKAGES */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-primary font-sans text-xs font-bold uppercase tracking-wider">
              Investasi &amp; Paket Layanan
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Pilihan Transparan untuk Sekolah, Bimbel, dan Komunitas
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans">
              Dukungan penuh dari skala kelas hingga ribuan peserta tryout serentak seluruh Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-2xs">
              <CardHeader className="space-y-2">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Komunitas &amp; Guru
                </span>
                <CardTitle className="font-display text-2xl font-extrabold text-foreground">
                  Starter Tryout
                </CardTitle>
                <div className="pt-2">
                  <span className="font-display text-3xl font-extrabold text-foreground">Gratis</span>
                  <span className="text-xs text-muted-foreground font-sans ml-1.5">/ untuk kelas kecil</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 font-sans text-sm text-foreground">
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Hingga 50 peserta per sesi
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Bank soal 6 tipe standar
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Penilaian skor instan (+4/-1)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Ekspor hasil format CSV
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={launchStudent}
                  className="w-full border-border bg-card hover:bg-secondary text-foreground font-display font-semibold"
                >
                  Coba Sekarang
                </Button>
              </CardFooter>
            </Card>

            {/* School / Bimbel Pro - Featured */}
            <Card className="bg-card border-2 border-primary shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-display text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Paling Populer
              </div>
              <CardHeader className="space-y-2">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-primary">
                  Sekolah &amp; Bimbel
                </span>
                <CardTitle className="font-display text-2xl font-extrabold text-foreground">
                  Pro Institution
                </CardTitle>
                <div className="pt-2">
                  <span className="font-display text-3xl font-extrabold text-primary">Rp 499.000</span>
                  <span className="text-xs text-muted-foreground font-sans ml-1.5">/ event bulanan</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 font-sans text-sm text-foreground">
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Hingga 1.000 peserta bersamaan
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Scoring IRT 3-PL Adaptif UTBK
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Live Proctoring &amp; Anti-cheat
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Analisis daya beda butir soal
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Kustomisasi nama &amp; logo sekolah
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  onClick={() => launchAdmin('packages')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold shadow-sm"
                >
                  Konfigurasi Paket Ujian
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-2xs">
              <CardHeader className="space-y-2">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Dinas &amp; Konsorsium
                </span>
                <CardTitle className="font-display text-2xl font-extrabold text-foreground">
                  Enterprise Campus
                </CardTitle>
                <div className="pt-2">
                  <span className="font-display text-3xl font-extrabold text-foreground">Custom</span>
                  <span className="text-xs text-muted-foreground font-sans ml-1.5">/ sesuai skala</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 font-sans text-sm text-foreground">
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Peserta tanpa batas (10.000+)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Dedicated pod server &amp; CDN
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Integrasi API Dapodik / Siakad
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> SLA Uptime 99.99% &amp; engineer standby
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => launchAdmin('dashboard')}
                  className="w-full border-border bg-card hover:bg-secondary text-foreground font-display font-semibold"
                >
                  Hubungi Konsultasi
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center space-y-6 shadow-md relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Siap Menyelenggarakan Ujian CBT Berkelas Hari Ini?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans">
              Masuk langsung ke antarmuka simulasi pengerjaan siswa atau kelola bank butir soal melalui konsol pengawas.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={launchStudent}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm px-6 h-12 shadow-sm gap-2"
            >
              <span>Mulai Tryout Siswa</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => launchAdmin('dashboard')}
              className="border-border bg-card hover:bg-secondary text-foreground font-display font-semibold text-sm px-5 h-12 shadow-2xs"
            >
              <span>Buka Dashboard Pengawas</span>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border bg-card py-12 px-4 sm:px-8 text-muted-foreground font-sans text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-display font-extrabold text-foreground text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>cbt-engine</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans leading-relaxed">
              Infrastruktur Computer-Based Test terisolasi dengan anti-cheat real-time, builder paket ujian terstruktur, dan penilaian IRT adaptif.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-foreground font-display font-bold uppercase tracking-wider text-xs">
              Modul Aplikasi
            </div>
            <ul className="space-y-2 text-xs sm:text-sm font-sans text-muted-foreground">
              <li>
                <button onClick={launchStudent} className="hover:text-primary transition-colors font-medium">
                  Portal Tryout Siswa
                </button>
              </li>
              <li>
                <button onClick={() => launchAdmin('dashboard')} className="hover:text-primary transition-colors font-medium">
                  Dashboard Pengawas
                </button>
              </li>
              <li>
                <button onClick={() => launchAdmin('questions')} className="hover:text-primary transition-colors font-medium">
                  Bank Butir Soal
                </button>
              </li>
              <li>
                <button onClick={() => launchAdmin('monitoring')} className="hover:text-primary transition-colors font-medium">
                  Live Proctoring Monitor
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="text-foreground font-display font-bold uppercase tracking-wider text-xs">
              Standar Ujian
            </div>
            <ul className="space-y-2 text-xs sm:text-sm font-sans text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> UTBK SNBT (TPS &amp; Literasi)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> SKD CPNS &amp; Kedinasan
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Tryout Asesmen Nasional (AKM)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Ujian Sekolah &amp; Madrasah
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="text-foreground font-display font-bold uppercase tracking-wider text-xs">
              Keamanan Terverifikasi
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans leading-relaxed">
              Dilengkapi pembatasan multi-tab, deteksi keluar layar penuh, enkripsi session state, dan isolasi lembar jawaban per peserta.
            </p>
          </div>
        </div>

        <Separator className="bg-border mb-6" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground font-sans text-xs">
          <div>
            &copy; 2026 CBT Tryout Engine. Solusi ujian berbasis komputer untuk sekolah dan siswa.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-display font-semibold hover:text-foreground transition-colors"
            >
              Kembali ke atas ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
