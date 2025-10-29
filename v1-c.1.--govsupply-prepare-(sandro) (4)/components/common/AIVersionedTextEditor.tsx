import React, { useState, useEffect, useMemo } from 'react';
import { TextArea } from './TextArea';
import { AIActionsToolbar } from './AIActionsToolbar';
import type { TenderData, VersionedDocument, DocumentVersion } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from './Button';
import { EditIcon } from '../icons/EditIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';
import { AITextAction } from '../../lib/ai';

interface AIVersionedTextEditorProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onUpdate'> {
    label?: React.ReactNode;
    tenderData: TenderData;
    fieldIdentifier: string;
    document: VersionedDocument;
    onUpdate: (document: VersionedDocument) => void;
}

export const AIVersionedTextEditor: React.FC<AIVersionedTextEditorProps> = ({
    label,
    tenderData,
    fieldIdentifier,
    document,
    onUpdate,
    ...props
}) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');

    const activeVersion = useMemo(() =>
        document.versions.find(v => v.id === document.activeVersionId) || document.versions[0],
        [document]
    );

    useEffect(() => {
        if (!isEditing) {
            setEditText(activeVersion?.content || '');
        }
    }, [activeVersion, isEditing]);
    
    const handleSelectVersion = (versionId: string) => {
        if (isEditing) return;
        onUpdate({ ...document, activeVersionId: versionId });
    };

    const handleEdit = () => {
        setEditText(activeVersion?.content || '');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditText(activeVersion?.content || '');
    };

    const createNewVersion = (content: string, name: string): VersionedDocument => {
        const newVersion: DocumentVersion = {
            id: `v_${fieldIdentifier.replace(/\s/g, '_')}_${Date.now()}`,
            name,
            content,
            timestamp: new Date().toISOString()
        };
        const updatedVersions = [...document.versions, newVersion];
        return {
            versions: updatedVersions,
            activeVersionId: newVersion.id
        };
    };
    
    const handleSave = () => {
        const versionNumber = document.versions.length + 1;
        const newName = `${t('general.version')} ${versionNumber} (${t('general.edit')})`;
        const updatedDocument = createNewVersion(editText, newName);
        onUpdate(updatedDocument);
        setIsEditing(false);
    };

    const handleAIUpdate = (newText: string, action: AITextAction) => {
        const versionNumber = document.versions.length + 1;
        const actionName = t(`general.${action.toLowerCase()}`);
        const newName = `${t('general.version')} ${versionNumber} (IA ${actionName})`;
        const updatedDocument = createNewVersion(newText, newName);
        onUpdate(updatedDocument);
    };

    return (
        <div className="w-full">
            {label && <label htmlFor={props.id} className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{label}</label>}
            <div className="bg-light-gray dark:bg-dark-blue p-2 rounded-t-lg border border-b-0 border-medium-gray/20 dark:border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <label htmlFor={`version-select-${fieldIdentifier}`} className="text-sm font-medium text-navy/80 dark:text-light-gray/80 whitespace-nowrap">{t('general.version')}:</label>
                    <select
                        id={`version-select-${fieldIdentifier}`}
                        value={activeVersion?.id || ''}
                        onChange={(e) => handleSelectVersion(e.target.value)}
                        disabled={isEditing}
                        className="block w-full pl-3 pr-8 py-1.5 border-medium-gray/30 bg-white dark:bg-navy dark:border-medium-gray/70 focus:outline-none focus:ring-primary focus:border-primary rounded-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {document.versions.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={handleCancel}>
                                <XIcon className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">{t('general.cancel')}</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleSave}>
                                <CheckIcon className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">{t('general.save')}</span>
                            </Button>
                        </div>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={handleEdit}>
                           <EditIcon className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">{t('general.edit')}</span>
                        </Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                 <TextArea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="rounded-t-none"
                    {...props}
                />
            ) : (
                <div className="w-full p-3 bg-white dark:bg-navy border border-t-0 border-medium-gray/20 dark:border-white/10 min-h-[100px] text-navy dark:text-light-gray text-sm whitespace-pre-wrap">
                    {activeVersion?.content || <span className="text-medium-gray">{props.placeholder}</span>}
                </div>
            )}
           
            <AIActionsToolbar
                tenderData={tenderData}
                fieldIdentifier={fieldIdentifier}
                currentText={activeVersion?.content || ''}
                onUpdate={handleAIUpdate}
                className="rounded-t-none"
            />
        </div>
    );
};