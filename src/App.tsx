import React from 'react';
import { CbtProvider, useCbt } from './context/CbtContext';
import { DemoRoleBar } from './components/shared/DemoRoleBar';
import { ToastContainer } from './components/shared/ToastContainer';
import { AdminSidebar } from './components/admin/AdminSidebar';

// Landing Page
import { LandingPageView } from './features/landing/LandingPageView';

// Admin Views
import { DashboardView } from './features/admin/DashboardView';
import { QuestionBankView } from './features/admin/QuestionBankView';
import { ExamBuilderView } from './features/admin/ExamBuilderView';
import { ExamScheduleView } from './features/admin/ExamScheduleView';
import { MonitoringView } from './features/admin/MonitoringView';
import { ResultsView } from './features/admin/ResultsView';

// Student Views
import { StudentExamListView } from './features/student/StudentExamListView';
import { ExamRunnerView } from './features/student/ExamRunnerView';
import { StudentResultView } from './features/student/StudentResultView';

const MainLayout: React.FC = () => {
  const { appMode, role, adminView, studentView } = useCbt();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // FR-NAV-04: In Exam Runner mode, completely isolate the student interface (no sidebar, no demo nav)
  if (role === 'student' && studentView === 'exam-runner') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ExamRunnerView />
        <ToastContainer />
      </div>
    );
  }

  // Landing Page Mode
  if (appMode === 'landing') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
        <LandingPageView />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Demo Bar for Switching Roles, Landing Page and Resetting Local Mock Data */}
      <DemoRoleBar />

      {role === 'admin' ? (
        /* Admin Console Layout with Fixed Sidebar and Dynamic View Area */
        <div className="flex-1 flex overflow-hidden">
          <AdminSidebar
            onOpenNewQuestion={() => setIsEditorOpen(true)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/20">
            <div className="max-w-7xl mx-auto">
              {adminView === 'dashboard' && <DashboardView />}
              {adminView === 'questions' && (
                <QuestionBankView
                  isEditorOpen={isEditorOpen}
                  setIsEditorOpen={setIsEditorOpen}
                  selectedCategory={selectedCategory}
                />
              )}
              {adminView === 'packages' && <ExamBuilderView />}
              {adminView === 'events' && <ExamScheduleView />}
              {adminView === 'monitoring' && <MonitoringView />}
              {adminView === 'results' && <ResultsView />}
            </div>
          </main>
        </div>
      ) : (
        /* Student Portal Layout */
        <main className="flex-1 overflow-y-auto bg-muted/15">
          {studentView === 'exam-list' && <StudentExamListView />}
          {studentView === 'student-results' && <StudentResultView />}
        </main>
      )}

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CbtProvider>
      <MainLayout />
    </CbtProvider>
  );
}
