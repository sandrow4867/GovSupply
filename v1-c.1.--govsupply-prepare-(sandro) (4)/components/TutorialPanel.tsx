
import React from 'react';
import { InfoIcon } from './icons/InfoIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialPanelProps {
    currentStage: number;
}

interface TutorialPoint {
    title: string;
    description: string;
}

const TutorialPanel: React.FC<TutorialPanelProps> = ({ currentStage }) => {
    const { t } = useLanguage();
    
    // The 't' function might return the key if not found, so we need to check for that
    const pointsData = t(`tutorialPanel.stage${currentStage}.points`);
    const points: TutorialPoint[] | undefined = Array.isArray(pointsData) ? pointsData : undefined;

    return (
        <aside className="sticky top-8">
            {points && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-deep-blue flex items-center gap-2 mb-4">
                        <InfoIcon className="w-5 h-5 text-primary" />
                        {t('tutorialPanel.title')}
                    </h3>
                    <ul className="space-y-4">
                        {points.map((point, index) => (
                            <li key={index}>
                                <p className="font-semibold text-deep-blue/90">{point.title}</p>
                                <p className="text-deep-blue/70 text-sm mt-1">{point.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
};

export default TutorialPanel;