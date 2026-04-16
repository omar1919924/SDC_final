import React from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface StudentNavProps {
  className?: string;
  activeLabel?: string;
  onNavigate?: (label: string) => void;
}

const DEFAULT_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home', active: true },
  { label: 'Daily Quest', icon: 'rocket_launch' },
  { label: 'My Badges', icon: 'military_tech' },
  { label: 'Messages', icon: 'chat_bubble' },
  { label: 'My Friend', icon: 'smart_toy' },
  { label: 'Games', icon: 'gamepad' },
  { label: 'Help', icon: 'help_outline' },
];

export const StudentNav: React.FC<StudentNavProps> = ({
  className,
  activeLabel = 'Home',
  onNavigate,
}) => {
  return (
    <nav className={cn("flex flex-col gap-1 px-2", className)}>
      {DEFAULT_ITEMS.map((link) => {
        const isActive = link.label === activeLabel;
        return (
          <button
            key={link.label}
            onClick={() => onNavigate?.(link.label)}
            className={cn(
              "flex items-center p-3 rounded-2xl transition-transform hover:translate-x-1 font-bold",
              isActive 
                ? "bg-sky-100 text-sky-800 shadow-sm" 
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
