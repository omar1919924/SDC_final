import React from 'react';
import { MaterialIcon } from './MaterialIcon';

interface WeeklyProgressChartProps {
  data: number[];
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ data }) => {
  if (!data || data.length === 0) data = [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 10;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 50 - ((val - min + padding) / (range + padding * 2)) * 50;
    return `${x},${y}`;
  });

  const pathD = `M 0,${points[0] ? points[0].split(',')[1] : '50'} ` + points.map((p, i) => {
    if (i === 0) return '';
    const prevX = parseFloat(points[i-1].split(',')[0]);
    const prevY = parseFloat(points[i-1].split(',')[1]);
    const currX = parseFloat(p.split(',')[0]);
    const currY = parseFloat(p.split(',')[1]);
    const cpX = prevX + (currX - prevX) / 2;
    return `C ${cpX},${prevY} ${cpX},${currY} ${currX},${currY}`;
  }).join(' ');

  const areaD = `${pathD} L 100,50 L 0,50 Z`;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 h-full min-h-[250px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-[#44474d]">Weekly Focus Progress</h3>
        <MaterialIcon icon="trending_up" className="text-[#1e3250]" />
      </div>
      <div className="relative w-full flex-grow">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3250" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1e3250" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#chartGradient)" />
          <path d={pathD} fill="none" stroke="#1e3250" strokeWidth="2" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="1.5" fill="#1e3250" className="drop-shadow-sm hover:r-3 hover:fill-[#feb300] transition-all cursor-pointer" />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-4 font-mono text-[10px] text-[#74777e] uppercase">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
      </div>
    </div>
  );
};
