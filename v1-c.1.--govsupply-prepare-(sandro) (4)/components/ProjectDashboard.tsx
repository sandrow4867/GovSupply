import React from 'react';
import type { TenderProcess, TenderStatus } from '../types';
import { Button } from './common/Button';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { EditIcon } from './icons/EditIcon';

interface TenderDashboardProps {
    tenders: TenderProcess[];
    onSelectTender: (tenderId: string) => void;
    onCreateNewTender: () => void;
    onDeleteTender: (tender: TenderProcess) => void;
    onRenameTender: (tender: TenderProcess) => void;
    onViewTender: (tender: TenderProcess) => void;
}

const statusStyles: Record<TenderStatus, string> = {
    draft: 'bg-light-gray text-medium-gray dark:bg-navy dark:text-medium-gray/80',
    internal_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    drafting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    control_review: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    legal_review: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    ready_to_publish: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    published: 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary/90',
    awarded: 'bg-primary text-white',
};

const TenderDashboard: React.FC<TenderDashboardProps> = ({
    tenders,
    onSelectTender,
    onCreateNewTender,
    onDeleteTender,
    onRenameTender,
    onViewTender,
}) => {
    const { t } = useLanguage();
    return (
        <div className="p-2">
            <div className="flex justify-end mb-6">
                <Button onClick={onCreateNewTender} size="md">
                    <FilePlusIcon className="w-5 h-5 mr-2" />
                    {t('tenderDashboard.createNew')}
                </Button>
            </div>
            <div className="bg-white dark:bg-navy p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10">
                <h2 className="text-xl font-semibold text-navy dark:text-white mb-4">{t('tenderDashboard.recentTenders')}</h2>
                <div className="divide-y divide-medium-gray/20 dark:divide-white/10">
                    {tenders.length > 0 ? tenders.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-4 group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-semibold text-navy dark:text-white text-left truncate">{p.name}</p>
                                    <button 
                                        onClick={() => onRenameTender(p)}
                                        className="p-1 rounded-md text-medium-gray hover:bg-light-gray dark:hover:bg-dark-blue hover:text-primary dark:hover:text-primary transition-colors flex-shrink-0"
                                        aria-label={t('tenderDashboard.rename', p.name)}
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-medium-gray dark:text-medium-gray/70">{t('tenderDashboard.lastModified')}: {new Date(p.lastModified).toLocaleString('es-ES')}</p>
                            </div>
                            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                               <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[p.status]}`}>
                                {t(`tenderDashboard.statuses.${p.status}`)}
                               </span>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => onSelectTender(p.id)}>{t('tenderDashboard.edit')}</Button>
                                    <Button variant="secondary" size="sm" onClick={() => onViewTender(p)}>{t('tenderDashboard.view')}</Button>
                                    <button onClick={() => onDeleteTender(p)} className="p-2 rounded-md hover:bg-dark-blue/10 text-medium-gray hover:text-dark-blue dark:hover:bg-white/10 dark:hover:text-accent" aria-label={t('tenderDashboard.delete', p.name)}>
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                       <div className="text-center py-12">
                           <p className="text-medium-gray dark:text-medium-gray/70">{t('tenderDashboard.noTenders')}</p>
                           <p className="text-medium-gray dark:text-medium-gray/70">{t('tenderDashboard.createOne')}</p>
                       </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TenderDashboard;