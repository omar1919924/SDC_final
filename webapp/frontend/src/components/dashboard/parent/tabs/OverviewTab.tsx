import React from 'react';
import Image from 'next/image';
import { ChildData } from '@/types';
import { MaterialIcon } from '../ui/MaterialIcon';
import { MetricCard } from '../ui/MetricCard';
import { WeeklyProgressChart } from '../ui/WeeklyProgressChart';

interface OverviewTabProps {
  activeChild: ChildData;
  mockUpdates: Array<{
    id: string;
    timestamp: string;
    provider: string;
    message: string;
    isToday: boolean;
  }>;
  mockResource: {
    id: string;
    type: string;
    title: string;
    description: string;
    imageUrl: string;
    link: string;
  };
  onOpenMessageModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ activeChild, mockUpdates, mockResource, onOpenMessageModal }) => {
  if (!activeChild) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animation-fade-in">
      {/* Main Content (Left 8 columns) */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <MetricCard 
            title="Focus Engagement" 
            value={`${activeChild.focus_score}%`} 
            subtitle="+5% from last week" 
            variant="primary" 
            icon="target" 
          />
          <MetricCard 
            title="Milestones Reached" 
            value={activeChild.milestonesReached ?? 0} 
            subtitle="In the last 30 days" 
            variant="secondary" 
            icon="workspace_premium" 
          />
          <MetricCard 
            title="Sentiment Trend" 
            value={`+${activeChild.sentimentTrend}%`} 
            subtitle="Positive outlook" 
            variant="default" 
            icon="trending_up" 
          />
        </div>
        
        {/* Chart */}
        <div className="flex-grow">
          <WeeklyProgressChart data={activeChild.weeklyProgress ?? [0, 0, 0, 0, 0, 0, 0]} />
        </div>
      </div>

      {/* Sidebar Area (Right 4 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#44474d] mb-2">Quick Actions</h3>
          <button 
            onClick={onOpenMessageModal} 
            className="w-full bg-[#1e3250] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#061d3a] transition-colors"
          >
            <MaterialIcon icon="chat" />
            Message Dr. Vance
          </button>
          <button className="w-full border-2 border-[#1e3250] text-[#1e3250] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1e3250]/5 transition-colors">
            <MaterialIcon icon="calendar_month" />
            Schedule Check-in
          </button>
          <button className="w-full border-2 border-[#c4c6ce] text-[#44474d] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#e2e2e3] transition-colors">
            <MaterialIcon icon="description" />
            View Full Report
          </button>
        </div>

        {/* Clinical Updates */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-[#44474d]">Clinical Updates</h3>
            <MaterialIcon icon="medical_services" className="text-[#1e3250]" />
          </div>
          <div className="flex flex-col gap-4">
            {mockUpdates.map((update) => (
              <div key={update.id} className={`flex gap-4 border-l-4 pl-4 py-1 ${update.isToday ? 'border-[#1e3250]' : 'border-[#c4c6ce]'}`}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#74777e] mb-1">
                    <span className="font-bold text-[#1e3250]">{update.provider}</span>
                    <span>•</span>
                    <span>{update.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium">{update.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Resource */}
        <div className="group relative rounded-3xl overflow-hidden shadow-sm border border-black/5 cursor-pointer min-h-[200px]">
          <div className="absolute inset-0 w-full h-full">
            <Image src={mockResource.imageUrl} alt={mockResource.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061d3a]/90 via-[#061d3a]/60 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] font-mono font-bold tracking-widest mb-3">
              {mockResource.type}
            </span>
            <h4 className="font-headline font-bold text-xl leading-tight mb-2">{mockResource.title}</h4>
            <p className="text-white/80 text-xs mb-4 line-clamp-2">{mockResource.description}</p>
            <div className="flex items-center gap-1 text-sm font-bold text-[#feb300] hover:text-white transition-colors">
              Read Article
              <MaterialIcon icon="arrow_forward" className="text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
