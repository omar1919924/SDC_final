import React from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StudentProfile } from '@/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudentCardProps {
  student: StudentProfile;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const statusStyles = {
    Stable: 'text-tertiary-container bg-tertiary-fixed-dim',
    'Needs Attention': 'text-secondary-container bg-secondary/10',
    Critical: 'text-error-container bg-error',
  };

  const barColor = {
    Stable: 'bg-tertiary-fixed-dim',
    'Needs Attention': 'bg-secondary',
    Critical: 'bg-error',
  };

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-xl border border-outline-variant/10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
            <div className="relative w-full h-full">
              <Image 
                src={student.avatar_url || '/avatar-placeholder.png'} 
                alt={student.user_id} 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-primary">{student.user_id}</h4>
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase",
              statusStyles[student.status]
            )}>
              {student.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={cn(
            "block text-2xl font-headline leading-none",
            student.status === 'Critical' && 'text-error',
            student.status === 'Needs Attention' && 'text-secondary'
          )}>
            {student.focus_score}
          </span>
          <span className="text-[9px] font-mono text-outline uppercase">Focus</span>
        </div>
      </div>

      <div className="h-8 w-full bg-slate-50 rounded flex items-end gap-1 px-1 mb-4">
        {student.trend_data.map((val, i) => (
          <div 
            key={i} 
            style={{ height: `${val}%` }}
            className={cn("w-full rounded-t-sm transition-all", barColor[student.status])} 
          />
        ))}
      </div>
      <p className="text-xs text-on-surface-variant italic">&quot;{student.notes}&quot;</p>
    </div>
  );
};
