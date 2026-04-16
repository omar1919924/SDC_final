'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { QuestStep } from '@/types';
import { StudentNav } from '@/components/ui/StudentNav';
import { cn } from '@/lib/utils';
import { HomeView } from '@/components/dashboard/student/HomeView';
import { QuestView } from '@/components/dashboard/student/QuestView';
import { BadgeView } from '@/components/dashboard/student/BadgeView';
import { MessageView } from '@/components/dashboard/student/MessageView';
import { GameView } from '@/components/dashboard/student/GameView';
import { HelpView } from '@/components/dashboard/student/HelpView';
import { MyFriendView } from '@/components/dashboard/student/MyFriendView';
import { useDashboardData } from '@/hooks/useClinicalData';
import { BentoSkeleton } from '@/components/ui/SkeletonLoaders';

const MOCK_QUESTS: QuestStep[] = [
  { id: '1', title: 'Warmup', label: 'Done', status: 'done', icon: 'check_circle' },
  { id: '2', title: 'Scan', label: 'Done', status: 'done', icon: 'check_circle' },
  { id: '3', title: 'Labyrinth', label: 'Current', status: 'current', icon: 'psychology' },
  { id: '4', title: 'The Core', label: 'Next', status: 'locked', icon: 'lock' },
  { id: '5', title: 'Victory', label: 'Final', status: 'locked', icon: 'emoji_events' },
];

export default function KidDashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const { logout } = useAuth();
  const { data: dashboardData, isLoading } = useDashboardData('student', 'me');

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BentoSkeleton className="md:col-span-2 h-[400px]" />
          <BentoSkeleton className="h-[400px]" />
        </div>
      );
    }

    switch (activeTab) {
      case 'Home':
        return <HomeView mockQuests={MOCK_QUESTS} data={dashboardData} />;
      case 'Daily Quest':
        return <QuestView mockQuests={MOCK_QUESTS} />;
      case 'My Badges':
        return <BadgeView />;
      case 'Messages':
        return <MessageView />;
      case 'My Friend':
        return <MyFriendView />;
      case 'Games':
        return <GameView />;
      case 'Help':
        return <HelpView />;
      default:
        return <HomeView mockQuests={MOCK_QUESTS} />;
    }
  };

  return (
    <div className="bg-background min-h-screen font-body selection:bg-secondary-container selection:text-on-secondary-container overflow-x-hidden">
      {/* Precision Grid Background */}
      <div className="fixed inset-0 precision-grid pointer-events-none z-0"></div>

      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
        <nav className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-sky-700 italic cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('Home')}>
              NeuroFocus Kids
            </span>
            <div className="hidden md:flex gap-6 items-center font-bold">
              <span
                onClick={() => setActiveTab('Home')}
                className={cn(
                  "px-2 pb-1 cursor-pointer transition-all",
                  activeTab === 'Home' ? "text-sky-700 border-b-4 border-sky-500 rounded-t-lg" : "text-slate-500 hover:text-sky-600"
                )}
              >
                My Journey
              </span>
              <span
                onClick={() => setActiveTab('Daily Quest')}
                className={cn(
                  "px-2 pb-1 cursor-pointer transition-all",
                  activeTab === 'Daily Quest' ? "text-sky-700 border-b-4 border-sky-500 rounded-t-lg" : "text-slate-500 hover:text-sky-600"
                )}
              >
                Daily Quest
              </span>
              <span className="text-slate-500 px-2 hover:bg-sky-50 transition-colors cursor-pointer rounded-lg">Library</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20 shadow-inner">
              <span className="material-symbols-outlined text-secondary filled-icon" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="font-mono font-bold text-primary">1,240 XP</span>
            </div>
            <button
              onClick={logout}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Deconnexion
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('Messages')}
                className={cn(
                  "p-2 transition-colors rounded-xl relative",
                  activeTab === 'Messages' ? "bg-sky-100 text-sky-700" : "text-slate-500 hover:bg-sky-50"
                )}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-sky-50 transition-colors rounded-xl">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-sky-200 ml-2 shadow-sm">
                <Image 
                  src="https://i.pravatar.cc/150?u=student123" 
                  alt="Avatar" 
                  fill
                  className="object-cover" 
                />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex max-w-screen-2xl mx-auto min-h-[calc(100vh-64px)] relative z-10">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-50/50 backdrop-blur-sm h-[calc(100vh-64px)] sticky top-16 pt-4 pb-8 space-y-1 border-r border-slate-200 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]">
          <div className="px-6 mb-8 mt-2">
            <h2 className="font-headline text-xl font-bold text-sky-700 italic">Hi, Explorer!</h2>
            <p className="text-sm text-slate-600 font-medium opacity-80">Ready for today&apos;s quest?</p>
          </div>

          <StudentNav className="px-2" activeLabel={activeTab} onNavigate={setActiveTab} />

          <div className="mt-auto px-4">
          <div className="bg-white/60 p-4 rounded-2xl border border-white mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Level 12</p>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]" />
            </div>
          </div>
          <button
            onClick={logout}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white/80 px-4 py-3 font-semibold text-sky-700 transition-colors hover:bg-sky-50"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Deconnexion
          </button>
          <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:translate-y-[-2px] active:scale-95 transition-all">
            <span>Start Lesson</span>
            <span className="material-symbols-outlined">play_arrow</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-12 min-h-screen">
          {renderView()}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab('Home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'Home' ? "text-sky-700 scale-110" : "text-slate-400"
          )}
        >
          <span className={cn("material-symbols-outlined", activeTab === 'Home' && "filled-icon")}>home</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab('Daily Quest')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'Daily Quest' ? "text-sky-700 scale-110" : "text-slate-400"
          )}
        >
          <span className={cn("material-symbols-outlined", activeTab === 'Daily Quest' && "filled-icon")}>rocket_launch</span>
          <span className="text-[10px] font-bold">Quest</span>
        </button>
        <button className="bg-primary text-white p-3 rounded-full -mt-12 shadow-xl ring-8 ring-background active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
        <button
          onClick={() => setActiveTab('My Badges')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'My Badges' ? "text-sky-700 scale-110" : "text-slate-400"
          )}
        >
          <span className={cn("material-symbols-outlined", activeTab === 'My Badges' && "filled-icon")}>military_tech</span>
          <span className="text-[10px] font-bold">Badges</span>
        </button>
        <button
          onClick={() => setActiveTab('Messages')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'Messages' ? "text-sky-700 scale-110" : "text-slate-400"
          )}
        >
          <span className={cn("material-symbols-outlined", activeTab === 'Messages' && "filled-icon")}>chat_bubble</span>
          <span className="text-[10px] font-bold">Talk</span>
        </button>
      </nav>
    </div>
  );
}

