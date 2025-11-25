import React from 'react';

interface MMADLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MMADLogo: React.FC<MMADLogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* MMAD Logo SVG - Custom design representing fitness/booking */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle */}
          <circle cx="20" cy="20" r="18" fill="url(#gradient)" stroke="#086ADD" strokeWidth="2"/>
          
          {/* MMAD Letters stylized */}
          <text 
            x="20" 
            y="26" 
            textAnchor="middle" 
            className="fill-white font-bold text-xs"
            style={{ fontSize: '10px', fontFamily: 'Arial, sans-serif' }}
          >
            MMAD
          </text>
          
          {/* Fitness/Activity indicator - dumbbell icon */}
          <g transform="translate(12, 8)">
            <rect x="2" y="6" width="12" height="2" fill="white" rx="1"/>
            <circle cx="2" cy="7" r="2" fill="white"/>
            <circle cx="14" cy="7" r="2" fill="white"/>
          </g>
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#086ADD"/>
              <stop offset="100%" stopColor="#0A4F9E"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="ml-3">
          <span className={`${textSizeClasses[size]} font-bold text-text-primary`}>
            MMAD
          </span>
          <span className={`${textSizeClasses[size]} font-bold text-brand-primary ml-1`}>
            FitBooki
          </span>
        </div>
      )}
    </div>
  );
};