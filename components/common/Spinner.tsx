
import React from 'react';

export const Spinner: React.FC<{ size?: string }> = ({ size = '8' }) => {
  return (
    <div className={`w-${size} h-${size} border-4 border-brand-primary border-t-transparent rounded-full animate-spin`}></div>
  );
};
