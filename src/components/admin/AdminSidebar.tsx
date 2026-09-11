import React from 'react';
import { useCbt, AdminView } from '../../context/CbtContext';
import {
  LayoutDashboard,
  FileQuestion,
  Layers,
  CalendarDays,
  Activity,
  Award,
  PlusCircle,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface AdminSidebarProps {
  onOpenNewQuestion?: () => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onOpenNewQuestion,
  selectedCategory: propSelectedCategory,
  setSelectedCategory: propSetSelectedCategory,
}) => {
  const [internalCategory, setInternalCategory] = React.useState('all');
  const selectedCategory = propSelectedCategory ?? internalCategory;
  const setSelectedCategory = (cat: string) => {
    if (typeof propSetSelectedCategory === 'function') {
      propSetSelectedCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const { adminView, setAdminView, questions, packages, events } = useCbt();

  const menuItems: { id: AdminView; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'questions',
      label: 'Bank Soal',
      icon: <FileQuestion className="w-4 h-4" />,
      badge: questions.length,
    },
    {
      id: 'packages',
      label: 'Paket Ujian',
      icon: <Layers className="w-4 h-4" />,
      badge: packages.length,
    },
    {
      id: 'events',
      label: 'Jadwal Tryout',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: events.length,
    },
    {
      id: 'monitoring',
      label: 'Monitoring Live',
      icon: <Activity className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      id: 'results',
      label: 'Hasil & Nilai',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'utbk', label: 'UTBK - SNBT' },
    { id: 'cpns', label: 'SKD CPNS' },
    { id: 'try_out_sekolah', label: 'Try Out Sekolah' },
    { id: 'custom', label: 'Kustom' },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border shrink-0 flex flex-col h-full overflow-y-auto select-none">
      {/* Brand & Institution Info */}
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight text-foreground tracking-tight">CBT Tryout</h1>
          <p className="text-xs text-muted-foreground">Admin & Tutor Panel</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Aksi Cepat
        </p>
        <Button
          onClick={() => {
            setAdminView('questions');
            if (onOpenNewQuestion) onOpenNewQuestion();
          }}
          className="w-full text-xs font-semibold h-8 gap-2 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          + Soal Baru
        </Button>
        <Button
          variant="outline"
          onClick={() => setAdminView('packages')}
          className="w-full text-xs font-semibold h-8 gap-2"
        >
          <PlusCircle className="w-3.5 h-3.5 text-primary" />
          + Paket Ujian Baru
        </Button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Menu Utama
        </p>
        {menuItems.map((item) => {
          const isActive = adminView === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => setAdminView(item.id)}
              className={`w-full justify-between h-9 px-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                  : 'text-foreground/80 hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <Badge
                  variant={
                    item.badge === 'Live'
                      ? 'destructive'
                      : isActive
                      ? 'default'
                      : 'secondary'
                  }
                  className={`text-[10px] px-1.5 py-0 h-5 font-bold ${
                    item.badge === 'Live' ? 'animate-pulse' : ''
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}

        {/* Category Filter */}
        <div className="pt-5">
          <Separator className="mb-4" />
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Filter Kategori
            </p>
          </div>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isCatActive
                      ? 'bg-accent/70 text-accent-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isCatActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Profile / Institution footer */}
      <div className="p-4 border-t border-border bg-muted/30 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            AK
          </div>
          <div className="truncate">
            <p className="font-semibold text-foreground truncate">Admin Akademik</p>
            <p className="text-[11px] text-muted-foreground truncate">admin@cbt-tryout.sch.id</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
