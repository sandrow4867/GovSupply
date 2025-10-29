

import React from 'react';
import { STAGES_CONFIG } from '../constants';
import { AIIcon } from './icons/AIIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ContractIcon } from './icons/ContractIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LayoutGridIcon } from './icons/LayoutGridIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { EditIcon } from './icons/EditIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { SendIcon } from './icons/SendIcon';

interface SidebarProps {
  currentStage: number;
  completedStages: number[];
  onStageSelect: (stageNumber: number) => void;
  onShowDashboard: () => void;
  onGoHome: () => void;
}

const stageIcons: { [key: number]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  1: DocumentIcon,
  2: ClipboardCheckIcon,
  3: EditIcon,
  4: SendIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ currentStage, completedStages, onStageSelect, onShowDashboard, onGoHome }) => {
  const { t } = useLanguage();
  return (
    <aside className="w-80 bg-white dark:bg-navy border-r border-medium-gray/20 dark:border-white/10 flex-shrink-0 flex flex-col p-6">
      <button onClick={onGoHome} className="flex items-center gap-3 mb-10 text-left">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <AIIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-navy dark:text-white">{t('app.title')}</h1>
      </button>

      <div className="mb-4">
          <button
            onClick={onShowDashboard}
            className="w-full text-left p-3 rounded-lg flex items-center gap-4 transition-all duration-200 text-navy/80 dark:text-light-gray/80 hover:bg-light-gray dark:hover:bg-dark-blue hover:text-navy dark:hover:text-light-gray font-medium"
          >
            <LayoutGridIcon className="w-5 h-5 text-navy/60 dark:text-light-gray/60" />
            <span>{t('app.myTenders')}</span>
          </button>
      </div>

      <nav className="flex-grow">
        <ul>
          {STAGES_CONFIG.map((stage) => {
            const isActive = currentStage === stage.id;
            const isCompleted = completedStages.includes(stage.id);
            const isSelectable = isCompleted || isActive || currentStage > stage.id;
            const StageIcon = stageIcons[stage.id];

            return (
              <li key={stage.id} className="mb-2">
                <button
                  onClick={() => onStageSelect(stage.id)}
                  disabled={!isSelectable}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-all duration-200 ${
                    isActive
                      ? `bg-primary text-white font-semibold shadow-md shadow-primary/30`
                      : isSelectable
                      ? 'text-navy/80 dark:text-light-gray/80 hover:bg-light-gray dark:hover:bg-dark-blue hover:text-navy dark:hover:text-light-gray'
                      : 'text-medium-gray dark:text-medium-gray/70 cursor-not-allowed'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isCompleted && !isActive ? 
                        <CheckIcon className="w-5 h-5 text-primary" /> 
                        : <StageIcon className={`w-5 h-5 ${isActive ? 'text-white' : isSelectable ? 'text-navy/70 dark:text-light-gray/70' : 'text-medium-gray dark:text-medium-gray/70'}`} />
                    }
                  </div>
                  <span>{t(`sidebar.stage${stage.id}`)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
    </aside>
  );
};

export default Sidebar;