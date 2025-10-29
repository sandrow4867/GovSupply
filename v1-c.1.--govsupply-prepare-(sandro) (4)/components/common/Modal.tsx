import React from 'react';
import { WandIcon } from '../icons/WandIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className="bg-light-gray dark:bg-navy rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-medium-gray/20 dark:border-white/10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                    <WandIcon className="w-6 h-6" />
                </div>
                <h2 id="modal-title" className="text-2xl font-bold text-navy dark:text-white">{title}</h2>
            </div>
            <button onClick={onClose} className="text-medium-gray hover:text-dark-blue dark:hover:text-white p-2 rounded-full text-3xl leading-none">&times;</button>
        </header>
        <div className="overflow-y-auto p-6">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;