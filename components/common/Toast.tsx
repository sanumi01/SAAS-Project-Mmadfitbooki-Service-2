
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };
  
  const icon = type === 'success' ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : null;
  const baseClasses = "flex items-center p-4 w-full max-w-xs text-text-primary bg-surface-dark rounded-lg shadow-lg border border-border-dark transition-all duration-300 ease-in-out";
  const animationClasses = isExiting ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0";

  return (
    <div className={`${baseClasses} ${animationClasses}`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {icon}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg text-text-primary/80 hover:text-text-primary hover:bg-border-dark focus-ring" 
        onClick={handleClose} 
        aria-label="Close"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
