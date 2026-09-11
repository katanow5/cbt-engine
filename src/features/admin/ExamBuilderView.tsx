import React, { useState, useMemo } from 'react';
import { useCbt } from '../../context/CbtContext';
import {
  ExamPackage,
  ExamSection,
  ScoringSystem,
  ExamCategory,
} from '../../types/cbt.types';
import {
  Plus,
  Trash2,
  Save,
  Layers,
  Clock,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';

export const ExamBuilderView: React.FC = () => {
  const { packages, questions, savePackage } = useCbt();

  // Selected package to edit or create new
  const [activePackageId, setActivePackageId] = useState<string>(packages[0]?.id || 'pkg-new');
  const activePackage = packages.find((p) => p.id === activePackageId);

  // Local form state for the active package
  const [name, setName] = useState(activePackage?.name || 'Paket Tryout Baru');
  const [category, setCategory] = useState<ExamCategory>(activePackage?.category || 'utbk');
  const [description, setDescription] = useState(activePackage?.description || '');
  const [sections, setSections] = useState<ExamSection[]>(
    activePackage?.sections || [
      {
        id: 'sec-1',
        name: 'Subtes 1 - Penalaran Umum',
        subject: 'Penalaran Umum',
        questionIds: ['q-001'],
        duration: 30,
        order: 1,
      },
    ]
  );
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem>(activePackage?.scoringSystem || 'irt');
  const [correctScore, setCorrectScore] = useState(activePackage?.scoringRule?.correct ?? 4);
  const [wrongScore, setWrongScore] = useState(activePackage?.scoringRule?.wrong ?? -1);
  const [passingScore, setPassingScore] = useState<number | null>(activePackage?.passingScore ?? 650);
  const [randomizeQuestions, setRandomizeQuestions] = useState(activePackage?.randomizeQuestions ?? true);
  const [randomizeOptions, setRandomizeOptions] = useState(activePackage?.randomizeOptions ?? true);
  const [showResultImmediately, setShowResultImmediately] = useState(activePackage?.showResultImmediately ?? true);

  // Left Bank Soal search and filter
  const [bankSearch, setBankSearch] = useState('');
  const [bankSubject, setBankSubject] = useState('all');
  const [targetSectionId, setTargetSectionId] = useState(sections[0]?.id || 'sec-1');

  // Load package when switching packages
  const handleSelectPackage = (pkg: ExamPackage) => {
    setActivePackageId(pkg.id);
    setName(pkg.name);
    setCategory(pkg.category);
    setDescription(pkg.description);
    setSections(pkg.sections);
    setScoringSystem(pkg.scoringSystem);
    setCorrectScore(pkg.scoringRule?.correct ?? 4);
    setWrongScore(pkg.scoringRule?.wrong ?? 0);
    setPassingScore(pkg.passingScore);
    setRandomizeQuestions(pkg.randomizeQuestions);
    setRandomizeOptions(pkg.randomizeOptions);
    setShowResultImmediately(pkg.showResultImmediately);
    if (pkg.sections.length > 0) {
      setTargetSectionId(pkg.sections[0].id);
    }
  };

  const handleCreateNewPackage = () => {
    const newId = `pkg-${Date.now()}`;
    setActivePackageId(newId);
    setName('Paket Ujian Simulasi Baru');
    setCategory('utbk');
    setDescription('Deskripsi paket ujian...');
    const defaultSec: ExamSection = {
      id: `sec-${Date.now()}`,
      name: 'Sesi 1',
      subject: 'Penalaran Umum',
      questionIds: [],
      duration: 30,
      order: 1,
    };
    setSections([defaultSec]);
    setTargetSectionId(defaultSec.id);
    setScoringSystem('irt');
    setPassingScore(600);
  };

  // Section Management
  const addSection = () => {
    const newSection: ExamSection = {
      id: `sec-${Date.now()}`,
      name: `Sesi ${sections.length + 1}`,
      subject: 'Pengetahuan Kuantitatif',
      questionIds: [],
      duration: 25,
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
    setTargetSectionId(newSection.id);
  };

  const removeSection = (secId: string) => {
    if (sections.length <= 1) {
      alert('Paket harus memiliki minimal 1 sesi/subtes!');
      return;
    }
    const updated = sections.filter((s) => s.id !== secId);
    setSections(updated);
    if (targetSectionId === secId) {
      setTargetSectionId(updated[0]?.id || '');
    }
  };

  const updateSection = (secId: string, updates: Partial<ExamSection>) => {
    setSections(sections.map((s) => (s.id === secId ? { ...s, ...updates } : s)));
  };

  // Add question to a section
  const addQuestionToSection = (qId: string, sectionId: string) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === sectionId) {
          if (sec.questionIds.includes(qId)) return sec;
          return {
            ...sec,
            questionIds: [...sec.questionIds, qId],
          };
        }
        return sec;
      })
    );
  };

  // Remove question from section
  const removeQuestionFromSection = (qId: string, sectionId: string) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            questionIds: sec.questionIds.filter((id) => id !== qId),
          };
        }
        return sec;
      })
    );
  };

  // Computed totals
  const totalQuestions = useMemo(() => {
    return sections.reduce((acc, sec) => acc + sec.questionIds.length, 0);
  }, [sections]);

  const totalDuration = useMemo(() => {
    return sections.reduce((acc, sec) => acc + (Number(sec.duration) || 0), 0);
  }, [sections]);

  // Filter bank questions
  const availableQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.code.toLowerCase().includes(bankSearch.toLowerCase()) ||
        q.content.toLowerCase().includes(bankSearch.toLowerCase());
      const matchSubject = bankSubject === 'all' || q.subject === bankSubject;
      return matchSearch && matchSubject;
    });
  }, [questions, bankSearch, bankSubject]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Nama paket ujian tidak boleh kosong.');
      return;
    }
    if (sections.length === 0) {
      alert('Paket ujian harus memiliki minimal satu sesi/subtes.');
      return;
    }

    const payload: ExamPackage = {
      id: activePackageId,
      name,
      category,
      description,
      sections,
      totalQuestions,
      totalDuration,
      scoringSystem,
      scoringRule: {
        correct: Number(correctScore),
        wrong: Number(wrongScore),
        unanswered: 0,
      },
      passingScore: passingScore ? Number(passingScore) : null,
      randomizeQuestions,
      randomizeOptions,
      showResultImmediately,
      createdBy: activePackage?.createdBy || 'Tim Akademik CBT',
      createdAt: activePackage?.createdAt || new Date().toISOString(),
    };

    savePackage(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Paket Ujian Builder
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Susun struktur subtes, alokasi durasi, dan tentukan aturan penilaian CBT dengan tampilan split-view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewPackage}
            className="text-xs gap-1.5"
          >
            <Plus className="w-4 h-4 text-primary" />
            Buat Paket Baru
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Paket
          </Button>
        </div>
      </div>

      {/* Package Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {packages.map((pkg) => {
          const isActive = activePackageId === pkg.id;
          return (
            <Button
              key={pkg.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSelectPackage(pkg)}
              className="text-xs gap-2 font-medium"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{pkg.name}</span>
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className="text-[10px] px-1.5 py-0 h-4 font-mono"
              >
                {pkg.totalQuestions} soal
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Bank Soal Picker (5 cols) */}
        <Card className="lg:col-span-5 shadow-2xs">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Pilih dari Bank Soal
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-mono">
                {availableQuestions.length} tersedia
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {/* Quick Target Section Selector */}
            <div className="p-3 rounded-lg bg-input/50 border border-border text-xs space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Tambahkan ke Sesi Tujuan:
              </Label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground font-medium text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.questionIds.length} soal)
                  </option>
                ))}
              </select>
            </div>

            {/* Search & Subject filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Cari kode / stem..."
                  className="pl-8 text-xs h-8"
                />
              </div>
              <select
                value={bankSubject}
                onChange={(e) => setBankSubject(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg border border-border bg-input text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Subtes</option>
                <option value="Penalaran Umum">Penalaran Umum</option>
                <option value="Pengetahuan Kuantitatif">Kuantitatif</option>
                <option value="Pemahaman Bacaan & Menulis">PBM</option>
              </select>
            </div>

            {/* Questions List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {availableQuestions.map((q) => {
                const currentSection = sections.find((s) => s.id === targetSectionId);
                const isAlreadyAdded = currentSection?.questionIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isAlreadyAdded
                        ? 'bg-accent/40 border-accent text-foreground'
                        : 'bg-card hover:border-primary/50 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-foreground">
                            {q.code}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {q.subject}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-foreground/80 leading-relaxed">
                          {q.content}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={isAlreadyAdded ? 'destructive' : 'default'}
                        onClick={() => {
                          if (isAlreadyAdded) {
                            removeQuestionFromSection(q.id, targetSectionId);
                          } else {
                            addQuestionToSection(q.id, targetSectionId);
                          }
                        }}
                        className="h-7 px-2.5 text-xs gap-1 shrink-0 font-semibold"
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Trash2 className="w-3 h-3" /> Hapus
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" /> Masukkan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: Package Config & Section Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Package Details Card */}
          <Card className="shadow-2xs">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Nama Paket Ujian</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Kategori Ujian</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExamCategory)}
                    className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="utbk">UTBK - SNBT</option>
                    <option value="cpns">SKD CPNS</option>
                    <option value="try_out_sekolah">Try Out Sekolah</option>
                    <option value="custom">Kustom</option>
                  </select>
                </div>
              </div>

              {/* Live Aggregate Counter Card */}
              <div className="p-3.5 rounded-xl bg-accent/40 border border-accent flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[11px] font-semibold text-accent-foreground block">
                      Total Butir Soal
                    </span>
                    <span className="text-xl font-extrabold text-foreground">
                      {totalQuestions} <span className="text-xs font-normal">Soal</span>
                    </span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <span className="text-[11px] font-semibold text-accent-foreground block">
                      Akumulasi Durasi
                    </span>
                    <span className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      {totalDuration} <span className="text-xs font-normal">Menit</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-accent-foreground block">
                    Jumlah Subtes / Sesi
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {sections.length} Sesi Terdaftar
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">
                Struktur Subtes & Urutan Sesi
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={addSection}
                className="text-xs font-semibold text-primary gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah Subtes / Sesi
              </Button>
            </div>

            {sections.map((sec, secIdx) => (
              <Card
                key={sec.id}
                className={`transition-all shadow-2xs ${
                  targetSectionId === sec.id
                    ? 'ring-2 ring-primary/50 border-primary'
                    : 'border-border'
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Section header info */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                        {secIdx + 1}
                      </span>
                      <Input
                        type="text"
                        value={sec.name}
                        onChange={(e) => updateSection(sec.id, { name: e.target.value })}
                        className="font-bold text-sm h-8 bg-transparent border-none px-1 text-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <Input
                          type="number"
                          min="1"
                          max="180"
                          value={sec.duration}
                          onChange={(e) =>
                            updateSection(sec.id, { duration: Number(e.target.value) })
                          }
                          className="w-14 h-7 text-center text-xs font-semibold"
                        />
                        <span>menit</span>
                      </div>

                      <Button
                        size="sm"
                        variant={targetSectionId === sec.id ? 'default' : 'outline'}
                        onClick={() => setTargetSectionId(sec.id)}
                        className="h-7 text-xs px-2.5 font-medium"
                      >
                        {targetSectionId === sec.id ? 'Aktif Dipilih' : 'Pilih'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(sec.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Question tags in this section */}
                  <div className="pt-2 border-t border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Daftar Soal di Sesi Ini ({sec.questionIds.length} butir):
                    </span>
                    {sec.questionIds.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-1">
                        Belum ada soal dimasukkan. Pilih soal dari panel kiri.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {sec.questionIds.map((qId, idx) => {
                          const q = questions.find((item) => item.id === qId);
                          return (
                            <div
                              key={qId}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-input text-foreground border border-border text-xs font-mono"
                            >
                              <span className="text-muted-foreground text-[10px]">{idx + 1}.</span>
                              <span className="font-semibold">{q?.code || qId}</span>
                              <button
                                onClick={() => removeQuestionFromSection(qId, sec.id)}
                                className="text-muted-foreground hover:text-destructive ml-1 cursor-pointer"
                                title="Keluarkan dari sesi"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scoring & Exam Rules Configuration */}
          <Card className="shadow-2xs">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Sistem Penilaian & Konfigurasi Pengerjaan
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Metode Skoring</Label>
                  <select
                    value={scoringSystem}
                    onChange={(e) => setScoringSystem(e.target.value as ScoringSystem)}
                    className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs text-foreground font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="irt">Simulasi IRT-Style Rule-based (Standar UTBK)</option>
                    <option value="standard">Skoring Standar (Benar/Salah/Kosong)</option>
                    <option value="custom">Skoring Kustom Bobot Poin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Nilai Ambang Batas / Passing Score (Opsional)
                  </Label>
                  <Input
                    type="number"
                    value={passingScore || ''}
                    onChange={(e) =>
                      setPassingScore(e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="Contoh: 650 (Kosongkan jika tidak ada)"
                    className="text-xs"
                  />
                </div>
              </div>

              {scoringSystem === 'standard' && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-input/50 border border-border text-xs">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Poin Jawaban Benar</Label>
                    <Input
                      type="number"
                      value={correctScore}
                      onChange={(e) => setCorrectScore(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Penalti Jawaban Salah</Label>
                    <Input
                      type="number"
                      value={wrongScore}
                      onChange={(e) => setWrongScore(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Switches */}
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary accent-primary"
                  />
                  <span className="font-medium text-foreground">Acak Nomor Soal</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeOptions}
                    onChange={(e) => setRandomizeOptions(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary accent-primary"
                  />
                  <span className="font-medium text-foreground">Acak Pilihan Opsi</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showResultImmediately}
                    onChange={(e) => setShowResultImmediately(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary accent-primary"
                  />
                  <span className="font-medium text-foreground">Tampilkan Hasil Langsung</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
