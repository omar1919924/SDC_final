'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skeleton Components
export const BentoSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn(
      "relative overflow-hidden bg-surface-container-high/40 rounded-[2rem] p-8 space-y-4",
      className
    )}>
      <motion.div
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
      />
      <div className="h-8 w-1/2 bg-surface-container-highest/20 rounded-md" />
      <div className="h-4 w-3/4 bg-surface-container-highest/20 rounded-md" />
      <div className="h-4 w-5/6 bg-surface-container-highest/20 rounded-md" />
    </div>
  );
};

export const MetricSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between border border-outline-variant/10">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-outline-variant/20 rounded" />
        <div className="h-10 w-24 bg-outline-variant/20 rounded" />
      </div>
      <div className="h-12 w-12 bg-outline-variant/20 rounded-full" />
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  imageUrl?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB6N_4k59c9x1-rG7O144-sU4yG8qR_p9yJ3-8v7_yX5-_zG-8L_vJ2G5y-8_z_F1mJ_eC5M_vP9_z_1_eE", // Fallback grayscale editorial
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center space-y-6"
    >
      <div className="w-64 aspect-video relative rounded-3xl overflow-hidden bg-slate-100 grayscale opacity-40">
        <div className="relative w-full h-full">
          <Image 
            src={imageUrl} 
            alt="Empty State" 
            fill 
            className="object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-headline text-3xl font-bold text-primary italic leading-tight">
          {title}
        </h3>
        <p className="text-on-surface-variant max-w-sm mx-auto text-sm opacity-80 leading-relaxed font-body">
          {description}
        </p>
      </div>

      {actionLabel && (
        <button 
          onClick={onAction}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md group"
        >
          {actionLabel}
          <span className="material-symbols-outlined ml-2 text-[18px] align-middle group-hover:translate-x-1 transition-transform">add</span>
        </button>
      )}
    </motion.div>
  );
};
