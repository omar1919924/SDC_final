import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeItemProps {
  title: string;
  subtitle: string;
  icon: string;
  isLocked?: boolean;
  variant?: 'tertiary' | 'secondary' | 'surface';
}

export const BadgeItem: React.FC<BadgeItemProps> = ({
  title,
  subtitle,
  icon,
  isLocked,
  variant = 'tertiary',
}) => {
  const variantStyles = {
    tertiary: 'bg-tertiary-fixed-dim/20 text-on-tertiary-container',
    secondary: 'bg-secondary-container/20 text-secondary',
    surface: 'bg-slate-200 text-slate-400',
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer",
      isLocked && "border-dashed border-2 bg-slate-50/50"
    )}>
      <div className={cn(
        "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
        isLocked ? variantStyles.surface : variantStyles[variant]
      )}>
        <span className={cn("material-symbols-outlined text-4xl", !isLocked && "filled-icon")}>
          {icon}
        </span>
      </div>
      <h4 className={cn("text-center font-bold mb-1", isLocked ? "text-slate-400 group-hover:text-primary" : "text-primary")}>
        {title}
      </h4>
      <p className={cn("text-center text-xs", isLocked ? "text-slate-400" : "text-slate-500")}>
        {subtitle}
      </p>
    </div>
  );
};
