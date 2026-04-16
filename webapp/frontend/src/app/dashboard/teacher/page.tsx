'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TeacherNav } from '@/components/ui/TeacherNav';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import { ChildData } from '@/types';

// Views
import { OverviewView } from '@/components/dashboard/teacher/views/OverviewView';
import { StudentsView } from '@/components/dashboard/teacher/views/StudentsView';
import { AcademicTrendsView } from '@/components/dashboard/teacher/views/AcademicTrendsView';
import { MessagesView } from '@/components/dashboard/teacher/views/MessagesView';
import { SettingsView } from '@/components/dashboard/teacher/views/SettingsView';

// Modal
import { StudentDetailModal } from '@/components/dashboard/teacher/StudentDetailModal';

type NavLabel = 'Overview' | 'Students' | 'Academic Trends' | 'Messages' | 'Settings';

export default function TeacherDashboard() {
  const [activeView, setActiveView] = useState<NavLabel>('Overview');
  const [selectedStudent, setSelectedStudent] = useState<ChildData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const { teacherProfile, currentUser, students, isLoading, refetch } =
    useTeacherDashboard();

  const handleSelectStudent = (student: ChildData) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  const renderView = () => {
    switch (activeView) {
      case 'Overview':
        return (
          <OverviewView
            students={students}
            isLoading={isLoading}
            onSelectStudent={handleSelectStudent}
          />
        );
      case 'Students':
        return (
          <StudentsView
            students={students}
            isLoading={isLoading}
            onSelectStudent={handleSelectStudent}
          />
        );
      case 'Academic Trends':
        return (
          <AcademicTrendsView
            students={students}
            isLoading={isLoading}
          />
        );
      case 'Messages':
        return (
          <MessagesView
            students={students}
            teacherName={currentUser?.nom ?? teacherProfile?.user_id ?? 'Educator'}
          />
        );
      case 'Settings':
        return (
          <SettingsView
            teacherProfile={teacherProfile}
            currentUser={currentUser}
            onProfileUpdated={refetch}
          />
        );
    }
  };

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Precision Grid Background */}
      <div className="fixed inset-0 precision-grid pointer-events-none z-0" />

      {/* ───────────────────────── Header ───────────────────────── */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex items-center gap-12">
            <span className="text-2xl font-black text-primary italic tracking-tight lowercase">
              NeuroFocus{' '}
              <span className="text-on-surface-variant font-normal">Educator</span>
            </span>
          </div>

          {/* Right: status + avatar */}
          <div className="flex items-center gap-6">
            {/* System status pill */}
            <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant/20">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                System Online
              </span>
            </div>

            <button
              onClick={logout}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-outline-variant/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Deconnexion
            </button>

            {/* Teacher name */}
            {currentUser && (
              <span className="hidden md:block text-sm font-semibold text-on-surface-variant">
                {currentUser.nom}
              </span>
            )}

            {/* Avatar */}
            <div className="relative w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-slate-100 shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1IhUAEkVeg59cHtChBvK5u8goN10O2rsC24BciQZHH1xUYjC_hKsVHJi7F4ck6t3aCMm8TkJNOYSoA2_CaDsFD3e1cf1PR7gz6iJ7a-UWTPY03VrRtzTUi6BcmkvVrz0ZIGhZskI1z9SH0prYEuoTn2dFofm8vcwEV312EyQ9EJhx6Jh8zNC2FH-B1a5eJrphqAJwm3sZrq8mEHhRp-uP1R_PikpZvaYWA4WuhSpZ56hi_5a-55TqEvcbeDW02sGJ_d379qS3-2FL"
                alt="Educator"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ───────────────────────── Body ───────────────────────── */}
      <div className="flex max-w-screen-2xl mx-auto min-h-[calc(100vh-73px)] relative z-10">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-72 bg-surface-container-low/50 backdrop-blur-sm h-[calc(100vh-73px)] sticky top-[73px] pt-8 pb-8 space-y-2 border-r border-outline-variant/10">
          <div className="px-8 mb-8">
            <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em] mb-1">
              Faculty Hub
            </p>
            <h2 className="font-headline text-2xl font-bold text-on-surface italic">
              {currentUser ? `Welcome, ${currentUser.nom.split(' ')[0]}` : 'Welcome, Educator'}
            </h2>
            {teacherProfile && (
              <p className="text-xs text-outline mt-1">
                {[teacherProfile.matiere, teacherProfile.ecole]
                  .filter(Boolean)
                  .join(' · ') || 'Complete your profile →'}
              </p>
            )}
          </div>

          {/* Nav */}
          <TeacherNav
            activeLabel={activeView}
            onNavigate={(label) => setActiveView(label as NavLabel)}
          />

          {/* Bottom insight widget */}
          <div className="mt-auto px-6">
            <div className="bg-primary-container/20 p-5 rounded-2xl border border-primary/10">
              <span className="material-symbols-outlined text-primary mb-2 block">
                clinical_notes
              </span>
              <p className="text-[11px] font-bold text-on-surface mb-1">Weekly Insight</p>
              {students.length > 0 ? (
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  {students.length} active student
                  {students.length !== 1 ? 's' : ''} monitored.{' '}
                  {(() => {
                    const avg = Math.round(
                      students.reduce((a, s) => a + (s.focus_score ?? 0), 0) /
                        students.length
                    );
                    return `Class avg focus: ${avg}%.`;
                  })()}
                </p>
              ) : (
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  No students assigned yet. Contact your administrator.
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low sm:hidden"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Deconnexion
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
          {renderView()}
        </main>
      </div>

      {/* ───────────────────────── Modal ───────────────────────── */}
      <StudentDetailModal
        student={selectedStudent}
        teacherName={currentUser?.nom ?? 'Educator'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
