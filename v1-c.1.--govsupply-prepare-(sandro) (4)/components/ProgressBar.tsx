import React from 'react';
import { STAGES_CONFIG } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface ProgressBarProps {
  currentStage: number;
  completedStages: number[];
  onStageSelect: (stage: number) => void;
}

const Separator = () => (
    <div className="flex-1 h-10 flex justify-center items-center" aria-hidden="true">
        <svg width="20" height="40" viewBox="0 0 20 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-medium-gray/20 dark:text-white/20">
            <path d="M8 5 V 17 L 14 20 L 8 23 V 35" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
);

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStage, completedStages, onStageSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full flex justify-center items-center" role="navigation" aria-label="Progreso del proceso">
        <div className="flex items-center justify-between w-full max-w-5xl">
            {STAGES_CONFIG.map((stage, index) => {
                const isActive = currentStage === stage.id;
                // A stage is selectable if it's completed or before the current stage
                const isSelectable = completedStages.includes(stage.id) || stage.id < currentStage;

                const circleClasses = `w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-sm ${
                    isActive 
                        ? 'border-2 border-navy dark:border-primary text-navy dark:text-white' 
                        : 'border border-medium-gray/40 dark:border-white/30 text-medium-gray dark:text-white/50'
                }`;

                const textClasses = `ml-3 text-base font-medium transition-colors duration-300 ${
                    isActive 
                        ? 'text-navy dark:text-white' 
                        : 'text-medium-gray dark:text-white/50'
                }`;

                return (
                    <React.Fragment key={stage.id}>
                        <div className="flex items-center">
                            <button
                                onClick={() => (isSelectable || isActive) && onStageSelect(stage.id)}
                                disabled={!isSelectable && !isActive}
                                className={`flex items-center ${(isSelectable || isActive) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                aria-current={isActive ? 'step' : false}
                                aria-label={`${t('sidebar.stage' + stage.id)} - ${t('general.step')} ${stage.id}`}
                            >
                                <div className={circleClasses}>
                                    {stage.id}
                                </div>
                                <span className={textClasses}>
                                    {t('sidebar.stage' + stage.id)}
                                </span>
                            </button>
                        </div>
                        {index < STAGES_CONFIG.length - 1 && <Separator />}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
  );
};

export default ProgressBar;