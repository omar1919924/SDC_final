import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'error' | 'surface';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'surface',
  className,
}) => {
  const variantStyles = {
    primary: {
      card: 'bg-primary-container text-on-primary-container border-l-4 border-primary',
      icon: 'text-on-primary-fixed-variant opacity-60',
    },
    secondary: {
      card: 'bg-secondary-container/10 text-on-secondary-container border-l-4 border-secondary',
      icon: 'text-secondary opacity-30',
    },
    error: {
      card: 'bg-error-container/20 text-error border-l-4 border-error',
      icon: 'text-error opacity-20',
    },
    surface: {
      card: 'bg-surface-container-low text-on-surface border-l-4 border-primary',
      icon: 'text-primary/20',
    },
  };

  return (
    <div className={cn(
      "p-6 rounded-xl flex items-center justify-between transition-all duration-300",
      variantStyles[variant].card,
      className
    )}>
      <div>
        <p className="font-label text-[10px] uppercase tracking-widest opacity-80 mb-1">{label}</p>
        <h3 className="text-3xl font-headline font-bold">
          {value}
          {subValue && <span className="text-lg opacity-40 ml-1">/{subValue}</span>}
        </h3>
      </div>
      <span className={cn("material-symbols-outlined text-4xl", variantStyles[variant].icon)}>
        {icon}
      </span>
    </div>
  );
};
