import React, { useState } from 'react';
import { processAIText, AITextAction } from '../../lib/ai';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { TenderData } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';

interface AIActionsToolbarProps {
    tenderData: TenderData;
    fieldIdentifier: string;
    currentText: string;
    onUpdate: (text: string, action: AITextAction) => void;
    className?: string;
}

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {isLoading: boolean}> = ({children, isLoading, ...props}) => (
    <button
        type="button"
        {...props}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 justify-center
            ${props.disabled ? 'text-medium-gray/70 dark:text-medium-gray/60 cursor-not-allowed' : 'text-navy/80 dark:text-light-gray/80 hover:bg-medium-gray/20 dark:hover:bg-white/10'}
            ${isLoading ? 'text-primary' : ''}
            ${props.className || ''}
        `}
    >
        {children}
    </button>
);


export const AIActionsToolbar: React.FC<AIActionsToolbarProps> = ({
    tenderData,
    fieldIdentifier,
    currentText,
    onUpdate,
    className
}) => {
    const [loadingAction, setLoadingAction] = useState<AITextAction | null>(null);
    const { showToast } = useToast();
    const { t } = useLanguage();
    
    const isAnythingLoading = loadingAction !== null;

    const handleAction = async (action: AITextAction) => {
        if (isAnythingLoading) return;

        setLoadingAction(action);
        try {
            if (action === AITextAction.GENERATE) {
                const response = await fetch('https://hook.eu2.make.com/a3b38kwrxg8a7mgjbui36shgmq8p9ips', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tender_id: tenderData.id,
                        field_identifier: fieldIdentifier,
                    }),
                });

                if (response.ok) {
                    showToast(t('aiActions.generateRequestSent'), 'success');
                } else {
                    const errorText = await response.text();
                    console.error('Error calling Make.com webhook:', response.status, errorText);
                    showToast(t('aiActions.generateRequestError'), 'error');
                }
            } else {
                const generatedText = await processAIText(tenderData, fieldIdentifier, action, currentText);
                onUpdate(generatedText, action);
            }
        } catch (error) {
            console.error("Error processing AI action:", error);
            showToast(t('stage2.aiSuggestionError'), 'error');
        } finally {
            setLoadingAction(null);
        }
    };
    
    const loadingSpinner = <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

    return (
        <div className={`flex items-center gap-2 bg-light-gray dark:bg-dark-blue p-1.5 rounded-b-lg mt-[-1px] border border-medium-gray/20 dark:border-white/10 ${className}`}>
             <ActionButton
                onClick={() => handleAction(AITextAction.GENERATE)}
                isLoading={loadingAction === AITextAction.GENERATE}
                disabled={isAnythingLoading}
                className="text-navy dark:text-light-gray"
            >
                {loadingAction === AITextAction.GENERATE ? loadingSpinner : <SparklesIcon className="w-4 h-4 text-primary" />}
                {t('general.generate')}
            </ActionButton>

            <div className="h-4 w-px bg-medium-gray/30 dark:bg-white/20"></div>

            <ActionButton
                onClick={() => handleAction(AITextAction.EXPAND)}
                isLoading={loadingAction === AITextAction.EXPAND}
                disabled={isAnythingLoading || !currentText}
            >
                {loadingAction === AITextAction.EXPAND && loadingSpinner}
                {t('general.expand')}
            </ActionButton>

            <ActionButton
                onClick={() => handleAction(AITextAction.SHORTEN)}
                isLoading={loadingAction === AITextAction.SHORTEN}
                disabled={isAnythingLoading || !currentText}
            >
                {loadingAction === AITextAction.SHORTEN && loadingSpinner}
                {t('general.shorten')}
            </ActionButton>

            <ActionButton
                onClick={() => handleAction(AITextAction.REWRITE)}
                isLoading={loadingAction === AITextAction.REWRITE}
                disabled={isAnythingLoading || !currentText}
            >
                {loadingAction === AITextAction.REWRITE && loadingSpinner}
                {t('general.rewrite')}
            </ActionButton>
        </div>
    );
};