import React from 'react';
import { Button } from './Button';
import { AIIcon } from '../icons/AIIcon';
import { useLanguage } from '../../contexts/LanguageContext';

interface Version {
    id: string;
    name: string;
}

interface VersionControlProps {
    versions: Version[];
    activeVersionId: string | null;
    onSelectVersion: (id: string) => void;
    onGenerateNewVersion: () => void;
    isGenerating: boolean;
    generateButtonText?: string;
    size?: 'sm' | 'md';
}

export const VersionControl: React.FC<VersionControlProps> = ({
    versions,
    activeVersionId,
    onSelectVersion,
    onGenerateNewVersion,
    isGenerating,
    generateButtonText,
    size = 'md',
}) => {
    const { t } = useLanguage();
    
    return (
        <div className={`flex items-center gap-3 bg-slate-100 p-2 rounded-lg border border-slate-200 ${size === 'sm' ? 'text-sm' : ''}`}>
            {versions.length > 0 && (
                 <div className="flex items-center gap-2">
                    <label htmlFor="version-select" className="font-medium text-deep-blue/80 whitespace-nowrap">{t('general.version')}:</label>
                    <select
                        id="version-select"
                        value={activeVersionId || ''}
                        onChange={(e) => onSelectVersion(e.target.value)}
                        className={`block w-full pl-3 pr-8 py-1.5 border-slate-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md ${size === 'sm' ? 'text-sm' : ''}`}
                    >
                        {versions.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
            )}
           
            <Button 
                onClick={onGenerateNewVersion} 
                isLoading={isGenerating} 
                variant="secondary" 
                size={size === 'sm' ? 'sm' : 'md'}
                className="flex-grow whitespace-nowrap"
            >
                <AIIcon className="w-4 h-4 mr-2" />
                {isGenerating ? t('general.generating') : (generateButtonText || t('general.generate'))}
            </Button>
        </div>
    );
};
