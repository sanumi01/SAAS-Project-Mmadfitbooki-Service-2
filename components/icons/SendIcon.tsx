import React from 'react';

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.534l4.261-1.519a.75.75 0 01.95.534l1.414 4.949a.75.75 0 00.95.534l4.261-1.519a.75.75 0 00.95-.534l1.414-4.949a.75.75 0 00-.826-.95L3.105 2.289z" />
  </svg>
);
