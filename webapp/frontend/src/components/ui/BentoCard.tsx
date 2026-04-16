import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'error' | 'surface' | 'lowest' | 'low' | 'high' | 'highest';
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className,
  variant = 'surface',
}) => {
  const variantClasses = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    error: 'bg-error-container text-on-error-container',
    surface: 'bg-surface-container text-on-surface',
    lowest: 'bg-surface-container-lowest text-on-surface',
    low: 'bg-surface-container-low text-on-surface',
    high: 'bg-surface-container-high text-on-surface',
    highest: 'bg-surface-container-highest text-on-surface',
  };

  return (
    <div className={cn(
      "p-6 rounded-xl transition-all duration-300",
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
};
