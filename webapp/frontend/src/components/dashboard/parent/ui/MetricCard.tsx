import React from 'react';
import { MaterialIcon } from './MaterialIcon';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  variant?: 'primary' | 'secondary' | 'default';
  icon: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, variant = 'default', icon }) => {
  const bgColors = {
    primary: 'bg-[#1e3250] text-white',
    secondary: 'bg-[#feb300] text-[#1a1c1d]',
    default: 'bg-[#e2e2e3] text-[#1a1c1d]'
  };

  return (
    <div className={`rounded-3xl p-6 ${bgColors[variant]} flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 shadow-sm border border-black/5`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase opacity-80">{title}</h3>
        <MaterialIcon icon={icon} className="opacity-70" />
      </div>
      <div>
        <p className="text-4xl font-headline font-bold italic mb-1">{value}</p>
        <p className="text-sm font-mono opacity-80">{subtitle}</p>
      </div>
    </div>
  );
};
