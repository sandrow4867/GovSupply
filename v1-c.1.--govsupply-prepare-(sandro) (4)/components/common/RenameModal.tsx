import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useLanguage } from '../../contexts/LanguageContext';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  title: string;
  label: string;
}

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, onConfirm, currentName, title, label }) => {
  const { t } = useLanguage();
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  const handleConfirm = () => {
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-modal-title"
    >
      <div
        className="bg-white dark:bg-navy rounded-xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="rename-modal-title" className="text-lg font-semibold text-navy dark:text-white">{title}</h2>
          <div className="mt-4">
            <Input
              label={label}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              autoFocus
            />
          </div>
        </div>
        <div className="bg-light-gray dark:bg-dark-blue px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            {t('general.cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!newName.trim() || newName.trim() === currentName}>
            {t('general.save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;