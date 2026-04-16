import React from 'react';

export const DotGridBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-[-1]" style={{
    backgroundImage: 'radial-gradient(#c4c6ce 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    opacity: 0.1
  }} />
);
