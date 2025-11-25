import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-text-primary/80 mb-6">{children}</div>
      <div className="flex justify-end items-center gap-4">
        <button 
          type="button"
          onClick={onClose} 
          className="font-semibold px-4 py-2 rounded-md hover:bg-border-dark transition-colors focus-ring"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={onConfirm}
          className={
          
          
          
          `text-white font-bold px-4 py-2 rounded-md transition-colors ${confirmButtonClass} focus-ring`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};