
import React from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-surface-dark rounded-lg shadow-xl w-full max-w-lg m-4 border border-border-dark transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border-dark">
          <h2 id="modal-title" className="text-xl font-bold text-text-primary">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-text-primary/80 hover:text-text-primary p-1 rounded-full hover:bg-border-dark focus-ring"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
