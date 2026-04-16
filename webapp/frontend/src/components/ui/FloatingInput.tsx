'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1 w-full group">
      <label className="font-label text-[11px] font-bold text-on-surface flex justify-between uppercase tracking-widest opacity-80" htmlFor={props.id || props.name}>
        {label}
        {props.required && <span className="font-normal text-outline-variant lowercase">required</span>}
      </label>
      <div className="relative">
        <input 
          className={cn(
            "w-full bg-transparent border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-0 py-3 text-sm transition-all placeholder:text-outline-variant/60 outline-none font-body",
            error && "border-error focus:border-error",
            className
          )}
          {...props}
        />
        <div className={cn(
          "absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full",
          error && "bg-error w-full"
        )}></div>
      </div>
      {error && <p className="text-[10px] text-error font-body mt-1">{error}</p>}
    </div>
  );
};
