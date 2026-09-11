import React, { useState } from 'react';
import { useCbt } from '../../context/CbtContext';
import { ExamEvent, ExamEventStatus } from '../../types/cbt.types';
import { formatDateTime, generateToken } from '../../lib/utils';
import {
  Calendar,
  List,
  Plus,
  KeyRound,
  Users,
  Clock,
  PlayCircle,
  Edit2,
  Trash2,
  Copy,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export const ExamScheduleView: React.FC = () => {
  const { events, packages, saveEvent, deleteEvent, setSelectedEventId, setAdminView, showToast } =
    useCbt();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExamEvent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [packageId, setPackageId] = useState(packages[0]?.id || '');
  const [startTime, setStartTime] = useState('2025-09-10T08:00');
  const [endTime, setEndTime] = useState('2026-12-31T23:59');
  const [accessCode, setAccessCode] = useState('');
  const [batchesInput, setBatchesInput] = useState('Kelas XII IPA-1, Intensif UTBK');
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [status, setStatus] = useState<ExamEventStatus>('ongoing');

  const openCreateModal = () => {
    setEditingEvent(null);
    setName('Simulasi Tryout Mandiri 2025');
    setPackageId(packages[0]?.id || '');
    setStartTime('2025-09-10T08:00');
    setEndTime('2026-12-31T23:59');
    setAccessCode(generateToken());
    setBatchesInput('Semua Siswa Terdaftar');
    setMaxAttempts(2);
    setStatus('ongoing');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: ExamEvent) => {
    setEditingEvent(evt);
    setName(evt.name);
    setPackageId(evt.packageId);
    setStartTime(evt.startTime.substring(0, 16));
    setEndTime(evt.endTime.substring(0, 16));
    setAccessCode(evt.accessCode || '');
    setBatchesInput(evt.assignedBatch.join(', '));
    setMaxAttempts(evt.maxAttempts);
    setStatus(evt.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(endTime) <= new Date(startTime)) {
      alert('Validasi Gagal: Waktu selesai harus lebih besar daripada waktu mulai ujian!');
      return;
    }

    const batches = batchesInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const payload: ExamEvent = {
      id: editingEvent?.id || `evt-${Date.now()}`,
      packageId,
      name,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      accessCode: accessCode.trim() || null,
      assignedBatch: batches,
      maxAttempts: Number(maxAttempts),
      status,
      participantCount: editingEvent?.participantCount || 48,
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
    };

    saveEvent(payload);
    setIsModalOpen(false);
  };

  const getStatusBadge = (s: ExamEventStatus) => {
    switch (s) {
      case 'scheduled':
        return <Badge variant="accent">Akan Datang</Badge>;
      case 'ongoing':
        return <Badge variant="success">Sedang Berlangsung</Badge>;
      case 'completed':
        return <Badge variant="secondary">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Jadwal & Event Tryout
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atur kalender pelaksanaan, alokasi kelas / batch peserta, dan token akses ujian.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle List / Calendar */}
          <div className="flex items-center bg-input p-1 rounded-lg border border-border">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 text-xs px-2.5 font-medium gap-1.5"
            >
              <List className="w-3.5 h-3.5" />
              Daftar
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-7 text-xs px-2.5 font-medium gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Kalender
            </Button>
          </div>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Jadwalkan Tryout Baru
          </Button>
        </div>
      </div>

      {/* Events View (List or Calendar) */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => {
            const pkg = packages.find((p) => p.id === evt.packageId);
            return (
              <Card
                key={evt.id}
                className="flex flex-col justify-between shadow-2xs hover:border-primary/50 transition-colors"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {pkg?.category ? pkg.category.toUpperCase() : 'TRYOUT'}
                    </Badge>
                    {getStatusBadge(evt.status)}
                  </div>

                  <CardTitle className="text-base font-bold leading-snug">
                    {evt.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paket: <span className="font-medium text-foreground">{pkg?.name || 'Paket Default'}</span>
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Details list */}
                  <div className="space-y-2 text-xs border-t border-border pt-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Mulai: {formatDateTime(evt.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span>Selesai: {formatDateTime(evt.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {evt.participantCount} Peserta terdaftar ({evt.assignedBatch.length} Batch)
                      </span>
                    </div>

                    {evt.accessCode && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-input font-mono text-xs border border-border mt-1">
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-foreground">{evt.accessCode}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(evt.accessCode || '');
                            showToast(`Token akses ${evt.accessCode} disalin!`, 'info');
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          title="Salin Token"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Card footer actions */}
                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setAdminView('monitoring');
                      }}
                      className="flex-1 text-xs font-semibold gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-primary" />
                      Pantau Live
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(evt)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Hapus jadwal tryout "${evt.name}"?`)) {
                          deleteEvent(evt.id);
                        }
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Calendar Mock View */
        <Card className="p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              Kalender Pelaksanaan Tryout CBT
            </h3>
            <span className="text-xs text-muted-foreground">Tampilan Bulan Berjalan</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground border-b border-border pb-2">
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
            <div>Min</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              return (
                <div
                  key={i}
                  className={`min-h-20 p-2 rounded-lg border flex flex-col justify-between text-left transition-colors ${
                    day === 10
                      ? 'bg-primary/10 border-primary font-bold'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <span className="text-[11px] text-muted-foreground font-mono">{day}</span>
                  {day === 10 && (
                    <div className="mt-1 p-1 rounded bg-primary text-primary-foreground text-[10px] font-semibold leading-tight truncate">
                      UTBK Gelombang 1
                    </div>
                  )}
                  {day === 15 && (
                    <div className="mt-1 p-1 rounded bg-emerald-600 text-white text-[10px] font-semibold leading-tight truncate">
                      SKD CPNS Batch 1
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Add / Edit Event Modal using Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingEvent ? 'Ubah Jadwal Tryout' : 'Jadwalkan Event Tryout Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Acara / Tryout</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pilih Paket Ujian</Label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.totalQuestions} Soal • {p.totalDuration} Menit)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Waktu Mulai</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Waktu Selesai (Batas Akhir)</Label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Token Akses</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAccessCode(generateToken())}
                    className="h-5 px-1 text-[10px] text-primary hover:text-primary"
                  >
                    Acak Baru
                  </Button>
                </div>
                <Input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Contoh: UTBK2025"
                  className="font-mono font-bold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status Event</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExamEventStatus)}
                  className="flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ongoing">Sedang Berlangsung (Aktif)</option>
                  <option value="scheduled">Akan Datang (Terjadwal)</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Batch / Kelas Peserta (Pisahkan dengan koma)
              </Label>
              <Input
                type="text"
                value={batchesInput}
                onChange={(e) => setBatchesInput(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs font-semibold shadow-xs"
              >
                Simpan Jadwal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
