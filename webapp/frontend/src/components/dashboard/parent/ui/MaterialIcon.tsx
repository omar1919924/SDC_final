import React from 'react';

interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ icon, filled = false, className = '' }) => (
  <span 
    className={`material-symbols-outlined ${className}`} 
    style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
  >
    {icon}
  </span>
);
