import React from 'react';

interface TimelineItemProps {
  author: string;
  time: string;
  content: string;
  isFirst?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ author, time, content, isFirst }) => {
  return (
    <div className={`border-l-2 ${isFirst ? 'border-primary-container' : 'border-outline-variant/30'} pl-4 space-y-2 relative`}>
      <div className={`absolute top-0 -left-[5px] w-2 h-2 rounded-full ${isFirst ? 'bg-primary' : 'bg-outline-variant/30'}`} />
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">{time}</span>
      <p className="text-sm font-body text-on-surface leading-relaxed">
        <span className="font-bold">{author}:</span> &quot;{content}&quot;
      </p>
    </div>
  );
};
