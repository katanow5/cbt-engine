import React, { useState, useMemo } from 'react';
import { useCbt } from '../../context/CbtContext';
import { Question, QuestionType, DifficultyLevel } from '../../types/cbt.types';
import { QuestionEditorDrawer } from './QuestionEditorDrawer';
import { formatDateTime } from '../../lib/utils';
import {
  Search,
  Plus,
  UploadCloud,
  Edit2,
  Trash2,
  FileQuestion,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface QuestionBankViewProps {
  isEditorOpen?: boolean;
  setIsEditorOpen?: (open: boolean) => void;
  selectedCategory?: string;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  isEditorOpen: propIsEditorOpen,
  setIsEditorOpen: propSetIsEditorOpen,
  selectedCategory = 'all',
}) => {
  const [internalIsEditorOpen, setInternalIsEditorOpen] = useState(false);
  const isEditorOpen = propIsEditorOpen !== undefined ? propIsEditorOpen : internalIsEditorOpen;
  const setIsEditorOpen = (open: boolean) => {
    if (typeof propSetIsEditorOpen === 'function') {
      propSetIsEditorOpen(open);
    } else {
      setInternalIsEditorOpen(open);
    }
  };

  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    simulateImportQuestions,
  } = useCbt();

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Extract distinct subjects
  const subjects = useMemo(() => {
    const list = new Set(questions.map((q) => q.subject));
    return Array.from(list);
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.code.toLowerCase().includes(search.toLowerCase()) ||
        q.content.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchSubject = selectedSubject === 'all' || q.subject === selectedSubject;
      const matchType = selectedType === 'all' || q.type === selectedType;
      const matchDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchCategory =
        selectedCategory === 'all' ||
        q.tags.some((t) => {
          const lower = t.toLowerCase();
          if (selectedCategory === 'utbk') return lower.includes('utbk') || lower.includes('snbt') || lower.includes('tps');
          if (selectedCategory === 'cpns') return lower.includes('cpns') || lower.includes('skd') || lower.includes('twk') || lower.includes('tiu') || lower.includes('tkp');
          if (selectedCategory === 'try_out_sekolah') return lower.includes('sekolah') || lower.includes('sma') || lower.includes('smp') || lower.includes('akademik');
          return lower.includes(selectedCategory.toLowerCase());
        });

      return matchSearch && matchSubject && matchType && matchDifficulty && matchCategory;
    });
  }, [questions, search, selectedSubject, selectedType, selectedDifficulty, selectedCategory]);

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleSave = (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (data.id) {
      const existing = questions.find((q) => q.id === data.id);
      if (existing) {
        updateQuestion({
          ...existing,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      addQuestion(data);
    }
  };

  const typeLabels: Record<QuestionType, string> = {
    multiple_choice: 'Pilihan Ganda',
    multiple_choice_complex: 'PG Kompleks',
    true_false: 'Benar / Salah',
    matching: 'Menjodohkan',
    short_answer: 'Jawaban Singkat',
    essay: 'Esai / Uraian',
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-primary" />
            Manajemen Bank Soal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola repositori butir soal lintas mata pelajaran dan 6 format kurikulum ujian nasional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={simulateImportQuestions}
            className="text-xs gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-primary" />
            Impor Dataset
          </Button>

          <Button
            size="sm"
            onClick={handleNew}
            className="text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Soal Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="shadow-2xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <Input
                type="text"
                placeholder="Cari kode soal, kata kunci stimulus, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Subject Dropdown */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-border bg-input text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Subtes / Mapel</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-border bg-input text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Format Soal</option>
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="multiple_choice_complex">PG Kompleks</option>
                <option value="true_false">Benar / Salah</option>
                <option value="matching">Menjodohkan</option>
                <option value="short_answer">Jawaban Singkat</option>
                <option value="essay">Esai / Uraian</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-border bg-input text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Kesukaran</option>
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sukar</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card className="overflow-hidden shadow-2xs">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-3 stroke-[1.5]" />
            <h3 className="font-semibold text-base text-foreground">
              {questions.length === 0
                ? 'Bank soal masih kosong. Tambah soal pertama!'
                : 'Tidak ada soal yang cocok dengan filter.'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Silakan buat butir soal baru atau reset filter pencarian di atas.
            </p>
            {questions.length === 0 && (
              <Button
                onClick={handleNew}
                size="sm"
                className="mt-4 gap-1.5 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Tambah Soal
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-28">Kode</th>
                  <th className="py-3 px-4 w-44">Mapel / Subtes</th>
                  <th className="py-3 px-4 w-32">Tipe Soal</th>
                  <th className="py-3 px-4">Konten Pertanyaan</th>
                  <th className="py-3 px-4 w-24 text-center">Kesukaran</th>
                  <th className="py-3 px-4 w-36">Terakhir Diubah</th>
                  <th className="py-3 px-4 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {q.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {q.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" className="font-medium text-[11px]">
                        {typeLabels[q.type]}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="line-clamp-2 text-foreground/90 leading-relaxed font-normal">
                        {q.content}
                      </p>
                      {q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.tags.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          q.difficulty === 'easy'
                            ? 'success'
                            : q.difficulty === 'medium'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-[10px] font-semibold"
                      >
                        {q.difficulty === 'easy' ? 'Mudah' : q.difficulty === 'medium' ? 'Sedang' : 'Sukar'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                      {formatDateTime(q.updatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewQuestion(q)}
                          title="Lihat Detail & Pembahasan"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(q)}
                          title="Ubah Soal"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus butir soal [${q.code}]?`)) {
                              deleteQuestion(q.id);
                            }
                          }}
                          title="Hapus Soal"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Question Preview Modal using Shadcn Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
        {previewQuestion && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono font-bold text-xs">
                  {previewQuestion.code}
                </Badge>
                <DialogTitle className="text-base font-semibold">
                  {previewQuestion.subject} • {typeLabels[previewQuestion.type]}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Stem Soal:
                </h4>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-lg border border-border">
                  {previewQuestion.content}
                </p>
              </div>

              {/* Options Preview */}
              {previewQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-muted-foreground">
                    Opsi Jawaban:
                  </h4>
                  <div className="space-y-1.5">
                    {previewQuestion.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          opt.isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground font-medium'
                            : 'bg-card border-border text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 font-bold text-center">{opt.label}.</span>
                          <span>{opt.content}</span>
                        </div>
                        {opt.isCorrect && (
                          <Badge variant="success" className="gap-1 text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Kunci Benar
                          </Badge>
                        )}
                        {opt.matchTarget && (
                          <Badge variant="accent" className="font-mono text-[10px]">
                            → {opt.matchTarget}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Answer / Essay Reference */}
              {previewQuestion.correctAnswer && (
                <div className="p-3 rounded-lg bg-accent/40 border border-accent">
                  <span className="font-bold text-accent-foreground">
                    Kunci Acuan:
                  </span>{' '}
                  <span className="font-mono font-semibold text-foreground">
                    {previewQuestion.correctAnswer}
                  </span>
                </div>
              )}

              {/* Explanation */}
              {previewQuestion.explanation && (
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                  <h5 className="font-bold text-foreground mb-1">Pembahasan:</h5>
                  <p className="text-muted-foreground leading-relaxed">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Editor Drawer */}
      <QuestionEditorDrawer
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        questionToEdit={editingQuestion}
        onSave={handleSave}
      />
    </div>
  );
};
