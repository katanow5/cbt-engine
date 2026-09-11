import React, { useState } from 'react';
import { useCbt } from '../../context/CbtContext';
import { ShieldCheck, UserCheck, RefreshCw, BookOpen, Layers, Moon, Sun, Terminal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const DemoRoleBar: React.FC = () => {
  const {
    appMode,
    setAppMode,
    role,
    setRole,
    setAdminView,
    studentView,
    setStudentView,
    resetAllData,
    theme,
    toggleTheme,
  } = useCbt();

  const isDark = theme === 'dark';

  // Hide demo bar on landing page and during active exam runner
  if (appMode === 'landing' || (role === 'student' && studentView === 'exam-runner')) {
    return null;
  }

  return (
    <header className="bg-card text-card-foreground border-b border-border px-4 py-2 text-xs shadow-2xs z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Product & Mock Disclaimer Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-bold text-foreground tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span>CBT Tryout</span>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] font-medium border border-border">
            Tangerine Theme • ShadCN UI
          </Badge>
        </div>

        {/* Center: View Mode Switcher Tabs */}
        <div className="flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border">
          <Button
            size="sm"
            variant={appMode === 'landing' ? 'default' : 'ghost'}
            onClick={() => setAppMode('landing')}
            className={`h-7 px-3 text-xs gap-1.5 rounded-md ${
              appMode === 'landing'
                ? 'font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Landing Page</span>
          </Button>

          <Button
            size="sm"
            variant={appMode === 'app' && role === 'admin' ? 'default' : 'ghost'}
            onClick={() => {
              setAppMode('app');
              setRole('admin');
            }}
            className={`h-7 px-3 text-xs gap-1.5 rounded-md ${
              appMode === 'app' && role === 'admin'
                ? 'font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin / Tutor</span>
          </Button>

          <Button
            size="sm"
            variant={appMode === 'app' && role === 'student' ? 'default' : 'ghost'}
            onClick={() => {
              setAppMode('app');
              setRole('student');
              setStudentView('exam-list');
            }}
            className={`h-7 px-3 text-xs gap-1.5 rounded-md ${
              appMode === 'app' && role === 'student'
                ? 'font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Siswa (Tryout)</span>
          </Button>
        </div>

        {/* Right: Quick actions for evaluator & Dark Mode toggle */}
        <div className="flex items-center gap-2">
          {appMode === 'app' && role === 'admin' && (
            <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground">
              <span className="text-[11px]">Navigasi:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminView('questions')}
                className="h-7 text-xs px-2"
              >
                Bank Soal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminView('packages')}
                className="h-7 text-xs px-2"
              >
                Paket
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminView('monitoring')}
                className="h-7 text-xs px-2"
              >
                Live Monitor
              </Button>
            </div>
          )}

          {appMode === 'app' && role === 'student' && (
            <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStudentView('exam-list')}
                className="h-7 text-xs px-2 gap-1"
              >
                <BookOpen className="w-3 h-3" /> Daftar Ujian
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStudentView('student-results')}
                className="h-7 text-xs px-2 gap-1"
              >
                <Layers className="w-3 h-3" /> Hasil Ujian
              </Button>
            </div>
          )}

          {/* Dark / Light Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-7 w-7 p-0"
            title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>

          {/* Reset Mock Data */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllData}
            title="Reset dataset mock ke kondisi awal"
            className="h-7 text-xs px-2.5 gap-1 hover:border-destructive hover:text-destructive text-muted-foreground"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Mock</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
