import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const buttonClasses = (lang: 'es' | 'en') => 
        `px-3 py-1 text-sm font-bold rounded-lg transition-colors duration-200 ${
            language === lang 
            ? 'bg-primary text-white shadow-md shadow-primary/30' 
            : 'bg-white text-navy/90 hover:bg-white/80 dark:bg-navy dark:text-light-gray/90 dark:hover:bg-navy/80'
        }`;

    return (
        <div className="flex items-center gap-1 p-1 bg-medium-gray/20 dark:bg-dark-blue rounded-xl">
            <button onClick={() => setLanguage('es')} className={buttonClasses('es')}>
                ES
            </button>
            <button onClick={() => setLanguage('en')} className={buttonClasses('en')}>
                EN
            </button>
        </div>
    );
};