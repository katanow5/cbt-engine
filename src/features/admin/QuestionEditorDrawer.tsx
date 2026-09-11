import React, { useState, useEffect } from 'react';
import { Question, QuestionType, DifficultyLevel, QuestionOption } from '../../types/cbt.types';
import { X, Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

interface QuestionEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: Question | null;
  onSave: (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}

export const QuestionEditorDrawer: React.FC<QuestionEditorDrawerProps> = ({
  isOpen,
  onClose,
  questionToEdit,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('Penalaran Umum');
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [points, setPoints] = useState(4);
  const [tagsInput, setTagsInput] = useState('UTBK');
  const [explanation, setExplanation] = useState('');

  // Type specific states
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'opt-1', label: 'A', content: '', isCorrect: true },
    { id: 'opt-2', label: 'B', content: '', isCorrect: false },
    { id: 'opt-3', label: 'C', content: '', isCorrect: false },
    { id: 'opt-4', label: 'D', content: '', isCorrect: false },
    { id: 'opt-5', label: 'E', content: '', isCorrect: false },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('');

  // Initialize or reset when drawer opens / changes
  useEffect(() => {
    if (questionToEdit) {
      setCode(questionToEdit.code);
      setSubject(questionToEdit.subject);
      setType(questionToEdit.type);
      setDifficulty(questionToEdit.difficulty);
      setContent(questionToEdit.content);
      setImageUrl(questionToEdit.imageUrl);
      setPoints(questionToEdit.points);
      setTagsInput(questionToEdit.tags.join(', '));
      setExplanation(questionToEdit.explanation || '');
      setOptions(
        questionToEdit.options.length > 0
          ? questionToEdit.options
          : [
              { id: 'opt-1', label: 'A', content: '', isCorrect: true },
              { id: 'opt-2', label: 'B', content: '', isCorrect: false },
              { id: 'opt-3', label: 'C', content: '', isCorrect: false },
              { id: 'opt-4', label: 'D', content: '', isCorrect: false },
              { id: 'opt-5', label: 'E', content: '', isCorrect: false },
            ]
      );
      setCorrectAnswer(questionToEdit.correctAnswer || '');
    } else {
      setCode(`Q-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubject('Penalaran Umum');
      setType('multiple_choice');
      setDifficulty('medium');
      setContent('');
      setImageUrl(null);
      setPoints(4);
      setTagsInput('UTBK, SNBT');
      setExplanation('');
      setOptions([
        { id: 'opt-1', label: 'A', content: '', isCorrect: true },
        { id: 'opt-2', label: 'B', content: '', isCorrect: false },
        { id: 'opt-3', label: 'C', content: '', isCorrect: false },
        { id: 'opt-4', label: 'D', content: '', isCorrect: false },
        { id: 'opt-5', label: 'E', content: '', isCorrect: false },
      ]);
      setCorrectAnswer('');
    }
  }, [questionToEdit, isOpen]);

  // Adjust defaults when question type switches
  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === 'true_false') {
      setOptions([
        { id: 'opt-tf-1', label: 'Benar', content: 'Benar', isCorrect: true },
        { id: 'opt-tf-2', label: 'Salah', content: 'Salah', isCorrect: false },
      ]);
    } else if (newType === 'matching') {
      setOptions([
        { id: 'opt-m-1', label: 'Pernyataan 1', content: 'Pernyataan 1', isCorrect: true, matchTarget: 'Pasangan A' },
        { id: 'opt-m-2', label: 'Pernyataan 2', content: 'Pernyataan 2', isCorrect: true, matchTarget: 'Pasangan B' },
      ]);
    } else if (newType === 'multiple_choice_complex') {
      if (options.length < 3) {
        setOptions([
          { id: 'opt-1', label: 'A', content: '', isCorrect: true },
          { id: 'opt-2', label: 'B', content: '', isCorrect: true },
          { id: 'opt-3', label: 'C', content: '', isCorrect: false },
          { id: 'opt-4', label: 'D', content: '', isCorrect: false },
        ]);
      }
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index].content = val;
    setOptions(updated);
  };

  const handleMatchTargetChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index].matchTarget = val;
    setOptions(updated);
  };

  const setSingleCorrectOption = (index: number) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const toggleMultipleCorrectOption = (index: number) => {
    const updated = [...options];
    updated[index].isCorrect = !updated[index].isCorrect;
    setOptions(updated);
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions([
      ...options,
      { id: `opt-${Date.now()}`, label: nextLabel, content: '', isCorrect: false },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Stem / Konten pertanyaan tidak boleh kosong.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: questionToEdit?.id,
      code,
      subject,
      type,
      difficulty,
      content,
      imageUrl,
      options,
      correctAnswer: type === 'short_answer' || type === 'essay' ? correctAnswer : null,
      points: Number(points),
      tags,
      explanation,
      itemStats: questionToEdit?.itemStats ?? { timesUsed: 0, correctRate: null, discriminationIndex: null },
      createdBy: questionToEdit?.createdBy || 'Admin Akademik',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-card h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {questionToEdit ? 'Edit Butir Soal' : 'Tambah Soal Baru'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Bank Soal & Kurikulum Ujian CBT
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kode Soal</Label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mata Pelajaran / Subtes</Label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="Penalaran Umum">Penalaran Umum (TPS)</option>
                <option value="Pengetahuan Kuantitatif">Pengetahuan Kuantitatif</option>
                <option value="Pemahaman Bacaan & Menulis">Pemahaman Bacaan & Menulis</option>
                <option value="Literasi Bahasa Indonesia">Literasi Bahasa Indonesia</option>
                <option value="Literasi Bahasa Inggris">Literasi Bahasa Inggris</option>
                <option value="Tes Wawasan Kebangsaan">TWK (CPNS)</option>
                <option value="Tes Inteligensi Umum">TIU (CPNS)</option>
                <option value="Tes Karakteristik Pribadi">TKP (CPNS)</option>
                <option value="Matematika SMA">Matematika SMA</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tingkat Kesukaran</Label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sukar (HOTS)</option>
              </select>
            </div>
          </div>

          {/* Question Type Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Format & Tipe Soal (6 Ragam)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'multiple_choice', label: 'Pilihan Ganda (A-E)' },
                { id: 'multiple_choice_complex', label: 'PG Kompleks' },
                { id: 'true_false', label: 'Benar / Salah' },
                { id: 'matching', label: 'Menjodohkan' },
                { id: 'short_answer', label: 'Jawaban Singkat' },
                { id: 'essay', label: 'Esai / Uraian' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleTypeChange(t.id as QuestionType)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all cursor-pointer ${
                    type === t.id
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stem / Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Stem / Teks Soal</Label>
              <span className="text-[11px] text-muted-foreground">Mendukung teks deskriptif</span>
            </div>
            <Textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan stimulus teks, narasi bacaan, atau pertanyaan soal..."
              required
              className="text-xs font-normal"
            />
          </div>

          {/* Optional Stimulus Image */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">URL Gambar Stimulus (Opsional)</Label>
            <Input
              type="text"
              value={imageUrl || ''}
              onChange={(e) => setImageUrl(e.target.value.trim() || null)}
              placeholder="https://images.unsplash.com/... atau tautan gambar grafik"
              className="text-xs"
            />
            {imageUrl && (
              <div className="mt-2 p-2 border border-border rounded-lg bg-muted/20 flex items-center justify-between">
                <img src={imageUrl} alt="Preview" className="h-16 rounded object-cover" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Hapus Gambar
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Type-Specific Answer Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Kunci Jawaban & Opsi
              </Label>
              {(type === 'multiple_choice' || type === 'multiple_choice_complex') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Opsi
                </Button>
              )}
            </div>

            {/* A-E Multiple Choice */}
            {type === 'multiple_choice' && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Klik lingkaran untuk menandai satu kunci jawaban yang benar.
                </p>
                {options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                      opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSingleCorrectOption(idx)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer ${
                        opt.isCorrect
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                    <Input
                      type="text"
                      value={opt.content}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Teks opsi jawaban ${opt.label}...`}
                      required
                      className="h-8 text-xs flex-1 bg-transparent border-border"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(idx)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Multiple Choice Complex */}
            {type === 'multiple_choice_complex' && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Centang semua opsi yang merupakan pernyataan benar (multi-centang).
                </p>
                {options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                      opt.isCorrect
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMultipleCorrectOption(idx)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer ${
                        opt.isCorrect
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {opt.isCorrect ? '✓' : opt.label}
                    </button>
                    <Input
                      type="text"
                      value={opt.content}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Pernyataan ${opt.label}...`}
                      required
                      className="h-8 text-xs flex-1 bg-transparent border-border"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(idx)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* True / False */}
            {type === 'true_false' && (
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    onClick={() => setSingleCorrectOption(idx)}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                      opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <div className="text-base font-extrabold">{opt.label}</div>
                    <div className="text-xs mt-1">
                      {opt.isCorrect ? '✓ Kunci Benar' : 'Bukan Kunci'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Matching */}
            {type === 'matching' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Pasangkan premis di sebelah kiri dengan target jawaban di sebelah kanan.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const id = `opt-m-${Date.now()}`;
                      setOptions([
                        ...options,
                        { id, label: `Premis ${options.length + 1}`, content: `Premis ${options.length + 1}`, isCorrect: true, matchTarget: '' },
                      ]);
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" /> Tambah Pasangan
                  </Button>
                </div>
                {options.map((opt, idx) => (
                  <div key={opt.id} className="grid grid-cols-2 gap-2 p-2 border border-border rounded-lg bg-card">
                    <Input
                      type="text"
                      value={opt.content}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder="Premis / Pernyataan..."
                      required
                      className="h-8 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        value={opt.matchTarget || ''}
                        onChange={(e) => handleMatchTargetChange(idx, e.target.value)}
                        placeholder="Pasangan / Jawaban benar..."
                        required
                        className="h-8 text-xs"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(idx)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Short Answer & Essay */}
            {(type === 'short_answer' || type === 'essay') && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  {type === 'short_answer' ? 'Kunci Jawaban Singkat' : 'Rubrik / Referensi Jawaban Esai'}
                </Label>
                <Textarea
                  rows={3}
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder={
                    type === 'short_answer'
                      ? 'Masukkan kata kunci atau angka persis...'
                      : 'Tuliskan indikator rubrik penilaian dan kata kunci esai...'
                  }
                  required
                  className="text-xs font-mono"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Points & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bobot Poin Soal</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tags / Kategori (Pisahkan Koma)</Label>
              <Input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="UTBK, SNBT, TPS, Matematika"
                className="text-xs"
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Pembahasan & Solusi Detail</Label>
            <Textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tuliskan analisis pembahasan dan konsep kunci untuk dipelajari siswa..."
              className="text-xs font-normal"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2 sticky bottom-0 bg-card py-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="text-xs font-semibold shadow-xs"
            >
              {questionToEdit ? 'Simpan Perubahan' : 'Buat Butir Soal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
