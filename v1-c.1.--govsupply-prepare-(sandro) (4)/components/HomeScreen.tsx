import React from 'react';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { LayoutGridIcon } from './icons/LayoutGridIcon';
import { StageCard } from './common/StageCard';
import { DocumentIcon } from './icons/DocumentIcon';
import { ContractIcon } from './icons/ContractIcon';
import { EditIcon } from './icons/EditIcon';
import { SendIcon } from './icons/SendIcon';


interface HomeScreenProps {
    onShowDashboard: () => void;
    onCreateNewTender: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onShowDashboard, onCreateNewTender }) => {
    const { t } = useLanguage();

    const workflowSteps = [
        { id: 1, IconComponent: DocumentIcon, imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=400&auto=format&fit=crop', stepText: t('general.step') + ' 1', title: t('homeScreen.workflowSteps.1.title'), description: t('homeScreen.workflowSteps.1.desc') },
        { id: 2, IconComponent: ContractIcon, imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=400&auto=format&fit=crop', stepText: t('general.step') + ' 2', title: t('homeScreen.workflowSteps.2.title'), description: t('homeScreen.workflowSteps.2.desc') },
        { id: 3, IconComponent: EditIcon, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop', stepText: t('general.step') + ' 3', title: t('homeScreen.workflowSteps.3.title'), description: t('homeScreen.workflowSteps.3.desc') },
        { id: 4, IconComponent: SendIcon, imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop', stepText: t('general.step') + ' 4', title: t('homeScreen.workflowSteps.4.title'), description: t('homeScreen.workflowSteps.4.desc') },
    ];
    
    return (
        <div className="text-center py-16 px-4">
            <h1 className="text-5xl font-extrabold text-navy dark:text-white tracking-tight">
                {t('homeScreen.title')}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-navy/70 dark:text-light-gray/70">
                {t('homeScreen.subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button onClick={onCreateNewTender} size="lg" className="w-full sm:w-auto">
                    <FilePlusIcon className="w-5 h-5 mr-2" />
                    {t('homeScreen.createButton')}
                </Button>
                <Button onClick={onShowDashboard} variant="secondary" size="lg" className="w-full sm:w-auto">
                    <LayoutGridIcon className="w-5 h-5 mr-2" />
                    {t('homeScreen.dashboardButton')}
                </Button>
            </div>
            
            <div className="mt-20 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-navy dark:text-white mb-12">{t('homeScreen.workflowTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {workflowSteps.map(stage => (
                        <StageCard key={stage.id} stage={stage} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;