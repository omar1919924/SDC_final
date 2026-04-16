'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { DEMO_STUDENTS } from '@/lib/demo-students';
import { normalizeTrackedStudents } from '@/lib/student-tracking';
import { ChildData, User } from '@/types';

// Standard Components
import { BentoSkeleton } from '@/components/ui/SkeletonLoaders';

// Dashboard Micro-components
import { DotGridBackground } from '@/components/dashboard/parent/ui/DotGridBackground';
import { MaterialIcon } from '@/components/dashboard/parent/ui/MaterialIcon';
import { MessageModal } from '@/components/dashboard/parent/modals/MessageModal';
import { OverviewTab } from '@/components/dashboard/parent/tabs/OverviewTab';

type BackendChild = ChildData & { _id?: string };
type BackendUser = User & { _id?: string };

export default function NeuroFocusParentDashboard() {
  const { logout } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [parentName, setParentName] = useState('Guardian');
  const [parentAvatar, setParentAvatar] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuDoS5XDZAPPxgbIyTmi7OHKkHgPwN9FZcGatQV5QfYqS3-cS6zZOcvh2kOCscaJRz4goePgPHV6ZRqglKiZo1voDIAc5zx1U9jF_-7-bJQT7dLUdwrQr57dQzuOylVwJSPdRmkgJqOZDY5leBr1J4BEzffNgMFV3o34NC0asXAxkkzp_lDsv8M-HgWLMJIViNh02rAwnMKmSCCSD1KdhVUntncQXGfLECgXcTtC0__xV4F2vLnO_2DVn1pckPnzgGlFu70Cu47AevIf');
  const [child, setChild] = useState<ChildData | null>(null);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mapped Data Fallbacks
  const mockUpdates = [
    { id: "1", timestamp: "today", provider: "Dr. Vance", message: "about 15% focus increase", isToday: true },
    { id: "2", timestamp: "yesterday", provider: "Nurse Elena", message: "about calm session", isToday: false },
  ];

  const mockResource = {
    id: "1", type: "ARTICLE", title: "5 Ways to Support Neuro-Diverse Learning at Home", description: "Learn actionable strategies to create an environment that enhances focus.", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXB2_GiS9DKo6Iodv3rHSlxZzzMDLlogknI4bX-qCjsW4l6X_-qyvEUwUKKdasrL54I_TVad6mB_sT5l7T4rM5oijBnNWdL8_PU8faUOTCbkfV9jnLj2wZaAWbpVCcDvX-HL6pMIr_4GnUNaP-nHqyOaWGKL-A_3ABV3G_rT0W_AHrn6R9TPX-9UIsgaXG54v4AxQ5y_DWuul8mZ1awGXsdhW074AG76S8oVaJcDiOxlJfFjdg-hgpP2kd_LrrBlBszcQiYuXOKW0c", link: "#"
  };

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await apiClient.get('/users/me');
        setParentName(userRes.data.nom || 'Guardian');
        if (userRes.data.avatar_url) setParentAvatar(userRes.data.avatar_url);

        const childrenRes = await apiClient.get<BackendChild[]>('/children');
        const allUsersRes = await apiClient.get<BackendUser[]>('/users');

        // Filter children belonging to this parent's user_id
        const myChildren: ChildData[] = childrenRes.data
          .filter(c => c.parent_id === userRes.data._id || c.parent_id === userRes.data.id)
          .map(c => ({
            ...c,
            id: c.id || c._id || c.user_id,
            user: allUsersRes.data.find(u => u._id === c.user_id || u.id === c.user_id),
          }));

        const seededChildren =
          myChildren.length > 0
            ? myChildren
            : DEMO_STUDENTS.slice(0, 1).map(demoChild => ({
                ...demoChild,
                parent_id: userRes.data.id || userRes.data._id,
              }));

        const normalizedChildren = normalizeTrackedStudents(seededChildren);
        setChild(normalizedChildren[0] ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeChild = child;

  const renderParentTab = () => {
    if (!activeChild) return null;

    if (activeTab === 'Overview') {
      return (
        <OverviewTab
          activeChild={activeChild}
          mockUpdates={mockUpdates}
          mockResource={mockResource}
          onOpenMessageModal={() => setIsMessageModalOpen(true)}
        />
      );
    }

    if (activeTab === 'Insights') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animation-fade-in">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <p className="text-xs font-mono font-bold tracking-widest text-[#1e3250] uppercase mb-2">Bracelet Status</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-headline font-bold italic text-[#061d3a]">{activeChild.bracelet_id}</p>
                  <p className="text-sm text-[#74777e] mt-1">{activeChild.braceletStatus?.replace('_', ' ') || 'offline'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[#74777e]">Battery</p>
                  <p className="text-4xl font-bold text-[#1e3250]">{activeChild.braceletBattery ?? 0}%</p>
                </div>
              </div>
              <div className="mt-4 h-3 rounded-full bg-[#e2e2e3] overflow-hidden">
                <div className="h-full bg-[#1e3250]" style={{ width: `${activeChild.braceletBattery ?? 0}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <p className="text-xs font-mono font-bold tracking-widest text-[#1e3250] uppercase mb-2">Live Context</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase text-[#74777e]">Current Activity</p>
                  <p className="text-lg font-bold text-[#061d3a]">{activeChild.currentActivity}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-[#74777e]">Location</p>
                  <p className="text-lg font-bold text-[#061d3a]">{activeChild.locationLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-[#74777e]">Hydration</p>
                  <p className="text-lg font-bold text-[#061d3a]">{activeChild.hydrationLevel}%</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[#44474d]">Attention Flags</h3>
                <MaterialIcon icon="monitor_heart" className="text-[#1e3250]" />
              </div>
              <div className="flex flex-wrap gap-3">
                {(activeChild.attentionFlags ?? ['On track']).map(flag => (
                  <span key={flag} className="px-4 py-2 rounded-full bg-[#1e3250]/10 text-[#1e3250] text-sm font-bold">
                    {flag}
                  </span>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-2xl bg-[#f6f8fb]">
                <p className="text-xs uppercase tracking-wider text-[#74777e] mb-1">Recommended Action</p>
                <p className="font-semibold text-[#1a1c1d]">{activeChild.recommendedAction}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#1e3250] text-white rounded-3xl p-6 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-widest text-white/70 mb-2">Calm Streak</p>
              <p className="text-5xl font-headline font-bold italic">{activeChild.focusStreakMinutes}m</p>
              <p className="mt-3 text-sm text-white/75">Consistent focus periods build more confidence at home and school.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-[#44474d] mb-4">Home Checklist</h3>
              <div className="space-y-3">
                {[
                  'Prepare water bottle before study block',
                  'Keep a calm break corner ready',
                  'Review teacher notes tonight',
                ].map(item => (
                  <label key={item} className="flex items-center gap-3 text-sm font-medium text-[#1a1c1d]">
                    <input type="checkbox" className="accent-[#1e3250]" />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Library') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animation-fade-in">
          {[
            {
              title: 'Evening Reset Routine',
              type: 'Guide',
              description: 'A short home ritual to transition from school energy into calm focus.',
            },
            {
              title: 'Bracelet Care Checklist',
              type: 'Toolkit',
              description: 'How to charge, sync and interpret the bracelet signals without stress.',
            },
            {
              title: 'Family Communication Prompts',
              type: 'Worksheet',
              description: 'Simple questions to discuss wins and challenges after each school day.',
            },
          ].map(resource => (
            <div key={resource.title} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col">
              <span className="inline-flex w-fit px-3 py-1 rounded-full bg-[#1e3250]/10 text-[#1e3250] text-[10px] font-bold uppercase tracking-widest mb-4">
                {resource.type}
              </span>
              <h3 className="text-2xl font-headline font-bold italic text-[#061d3a] mb-3">{resource.title}</h3>
              <p className="text-sm text-[#74777e] leading-relaxed flex-grow">{resource.description}</p>
              <button className="mt-6 w-full bg-[#1e3250] text-white py-3 rounded-xl font-bold hover:bg-[#061d3a] transition-colors">
                Open Resource
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animation-fade-in">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#44474d] mb-5">Support Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: 'chat', title: 'Message Teacher', text: 'Send a short update about today’s home routine.' },
              { icon: 'medical_services', title: 'Request Clinical Review', text: 'Ask the care team to revisit the latest notes.' },
              { icon: 'calendar_month', title: 'Book Family Check-in', text: 'Schedule a 15-minute sync with the school team.' },
              { icon: 'download', title: 'Download Weekly Report', text: 'Export the latest summary to share with caregivers.' },
            ].map(action => (
              <button
                key={action.title}
                className="text-left rounded-2xl border border-[#c4c6ce] p-5 hover:border-[#1e3250] hover:bg-[#f6f8fb] transition-all"
              >
                <MaterialIcon icon={action.icon} className="text-[#1e3250] text-3xl mb-3" />
                <p className="font-bold text-[#061d3a] mb-1">{action.title}</p>
                <p className="text-sm text-[#74777e]">{action.text}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#1e3250] text-white rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-white/70 mb-2">Support Summary</p>
          <h3 className="text-4xl font-headline font-bold italic mb-4">You are in the loop</h3>
          <p className="text-white/80 leading-relaxed mb-6">
            Today&apos;s bracelet sync, focus trend and teacher guidance are all available here so you can react early without waiting for a formal report.
          </p>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/60">Last Bracelet Seen</p>
              <p className="text-lg font-bold">{activeChild.braceletLastSeen ? new Date(activeChild.braceletLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/60">Trend</p>
              <p className="text-lg font-bold">
                {(activeChild.trendDelta ?? 0) > 0 ? '+' : ''}
                {activeChild.trendDelta ?? 0} points this week
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f9fa] text-[#1a1c1d] pb-24 md:pb-8 font-body">
      <DotGridBackground />
      
      {/* Global Modals */}
      <MessageModal 
        isOpen={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)} 
        recipientName="Dr. Vance"
      />

      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#f9f9fa]/80 backdrop-blur-lg border-b border-[#c4c6ce]/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-headline font-bold italic tracking-tight text-[#061d3a]">NeuroFocus</h1>
            <nav className="hidden md:flex gap-6">
              {['Overview', 'Insights', 'Library', 'Support'].map(item => (
                <button 
                  key={item} 
                  onClick={() => setActiveTab(item)}
                  className={`text-sm font-medium transition-colors ${activeTab === item ? 'text-[#1e3250] border-b-2 border-[#1e3250]' : 'text-[#44474d] hover:text-[#1e3250]'}`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 text-[#44474d] hover:bg-[#e2e2e3] rounded-full transition-colors">
              <MaterialIcon icon="notifications" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white"></div>
            </button>
            
            {/* Notification Drawer Elements */}
            {isNotificationsOpen && (
                <div className="absolute top-14 right-16 w-80 bg-white shadow-xl border border-gray-100 rounded-2xl p-4 z-50">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2">Recent Updates</h3>
                    {mockUpdates.map(u => (
                        <div key={u.id} className="mb-3">
                            <p className="text-xs text-[#1e3250] font-bold">{u.provider} <span className="text-gray-400 font-normal">({u.timestamp})</span></p>
                            <p className="text-sm">{u.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <button className="p-2 text-[#44474d] hover:bg-[#e2e2e3] rounded-full transition-colors">
              <MaterialIcon icon="settings" />
            </button>
            
            <div className="relative">
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1e3250]/20 ml-2 shadow-sm relative block">
                  <Image src={parentAvatar} alt="Profile" fill className="object-cover" />
                </button>
                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                    <div className="absolute right-0 top-14 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-bold">{parentName}</p>
                            <p className="text-xs text-gray-500">Parent Node</p>
                        </div>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                           <MaterialIcon icon="manage_accounts" className="text-lg" /> Profile Settings
                        </button>
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                           <MaterialIcon icon="logout" className="text-lg" /> Logout Session
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative min-h-[600px]">
        {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <BentoSkeleton className="h-[200px]" />
                    <div className="grid grid-cols-3 gap-4">
                        <BentoSkeleton className="h-[150px]" /><BentoSkeleton className="h-[150px]" /><BentoSkeleton className="h-[150px]" />
                    </div>
                    <BentoSkeleton className="h-[300px]" />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <BentoSkeleton className="h-[250px]" />
                    <BentoSkeleton className="h-[400px]" />
                </div>
            </div>
        ) : (
            <>
                {/* Welcome & Child Summary */}
                <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                      <p className="text-xs font-mono font-bold tracking-widest text-[#1e3250] uppercase mb-2">Parent Dashboard</p>
                      <h2 className="text-4xl md:text-5xl font-headline text-[#061d3a] mb-6">
                      Welcome back, <span className="italic font-bold">{parentName}</span>
                      </h2>
                      {activeChild && (
                        <div className="inline-flex items-center gap-3 rounded-full border border-[#1e3250]/15 bg-white px-5 py-3 shadow-sm">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3250]/10 text-[#1e3250]">
                            <MaterialIcon icon="child_care" filled />
                          </div>
                          <div>
                            <p className="text-xs font-mono uppercase tracking-widest text-[#74777e]">Viewing Child</p>
                            <p className="font-semibold text-[#1a1c1d]">{activeChild.user?.nom || 'Child'}</p>
                          </div>
                        </div>
                      )}
                  </div>
                  {activeChild && (
                      <div className="bg-white px-5 py-3 rounded-full shadow-sm border border-black/5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#4ae176]/20 flex items-center justify-center text-[#4ae176]">
                            <MaterialIcon icon="mood" filled />
                          </div>
                          <div>
                            <p className="text-xs font-mono text-[#74777e] uppercase">{activeChild.user?.nom || 'Child'}&apos;s Mood</p>
                            <p className="font-semibold text-[#1a1c1d]">{activeChild.currentMood}</p>
                          </div>
                      </div>
                  )}
                </section>

                {/* Tab Content Switching */}
                {renderParentTab()}
            </>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#f9f9fa]/90 backdrop-blur-lg border-t border-[#c4c6ce]/30 flex justify-around items-center p-4 pb-safe z-50">
        {[
          { icon: 'home', label: 'Overview', active: activeTab === 'Overview' },
          { icon: 'monitoring', label: 'Insights', active: activeTab === 'Insights' },
          { icon: 'library_books', label: 'Library', active: activeTab === 'Library' },
          { icon: 'chat', label: 'Support', active: activeTab === 'Support' },
        ].map(item => (
          <button key={item.label} onClick={() => setActiveTab(item.label)} className={`flex flex-col items-center gap-1 ${item.active ? 'text-[#1e3250]' : 'text-[#74777e]'}`}>
            <MaterialIcon icon={item.icon} filled={item.active} className="text-2xl" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
