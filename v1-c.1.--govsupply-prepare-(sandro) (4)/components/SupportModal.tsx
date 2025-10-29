import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { XIcon } from './icons/XIcon';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setName('');
      setEmail('');
      setMessage('');
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      showToast(t('supportModal.sendSuccess'), 'success');
      onClose();
    }, 1500);
  };
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="bg-white dark:bg-navy rounded-xl shadow-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
            <header className="flex items-start justify-between mb-6">
              <div>
                <h2 id="support-modal-title" className="text-2xl font-bold text-navy dark:text-white">{t('supportModal.title')}</h2>
                <p className="text-medium-gray mt-1 text-sm">{t('supportModal.subtitle')}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full text-medium-gray hover:bg-light-gray dark:hover:bg-dark-blue transition-colors">
                <XIcon className="w-6 h-6" />
              </button>
            </header>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label={t('supportModal.name')}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('supportModal.namePlaceholder')}
                  required
                />
                <Input
                  label={t('supportModal.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('supportModal.emailPlaceholder')}
                  required
                />
                <TextArea
                  label={t('supportModal.message')}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('supportModal.messagePlaceholder')}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    {t('general.cancel')}
                </Button>
                <Button type="submit" isLoading={isSending}>
                    {isSending ? t('general.generating') : t('supportModal.send')}
                </Button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;