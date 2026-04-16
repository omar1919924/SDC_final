import React from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface TeacherNavProps {
  className?: string;
  activeLabel?: string;
  onNavigate?: (label: string) => void;
}

const TEACHER_ITEMS: NavItem[] = [
  { label: 'Overview', icon: 'dashboard', active: true },
  { label: 'Students', icon: 'groups' },
  { label: 'Academic Trends', icon: 'trending_up' },
  { label: 'Messages', icon: 'chat_bubble' },
  { label: 'Settings', icon: 'settings' },
];

export const TeacherNav: React.FC<TeacherNavProps> = ({
  className,
  activeLabel = 'Overview',
  onNavigate,
}) => {
  return (
    <nav className={cn("flex flex-col gap-1 px-2", className)}>
      {TEACHER_ITEMS.map((link) => {
        const isActive = link.label === activeLabel;
        return (
          <button
            key={link.label}
            onClick={() => onNavigate?.(link.label)}
            className={cn(
              "flex items-center p-3 rounded-2xl transition-transform hover:translate-x-1 font-bold",
              isActive 
                ? "bg-primary-container text-primary shadow-sm" 
                : "text-slate-600 hover:bg-slate-200"
            )}
          >
            <span className={cn(
              "material-symbols-outlined mr-3",
              isActive && "filled-icon"
            )}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
