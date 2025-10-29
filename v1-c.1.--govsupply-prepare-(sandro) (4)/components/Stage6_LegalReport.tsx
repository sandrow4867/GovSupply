import React from 'react';
import type { TenderData } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from './common/Input';
import { AIVersionedTextEditor } from './common/AIVersionedTextEditor';

interface Stage6LegalReportProps {
  onComplete: () => void;
  onBack: () => void;
  data: TenderData['stage5'];
  updateData: (data: Partial<TenderData['stage5']>) => void;
  tenderData: TenderData;
}

const Stage6LegalReport: React.FC<Stage6LegalReportProps> = ({ onComplete, onBack, data, updateData, tenderData }) => {
  const { t } = useLanguage();

  const handleChecklistChange = (key: keyof TenderData['stage5']['checklist']) => {
    updateData({ checklist: { ...data.checklist, [key]: !data.checklist[key] } });
  };
  
  const isComplete = true;

  return (
    <div>
        <div className="bg-white dark:bg-navy p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">{t('stage5.checklistTitle')}</h3>
             <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.checklist.procedure} onChange={() => handleChecklistChange('procedure')} className="h-4 w-4 rounded border-medium-gray/50 text-primary focus:ring-primary"/>
                    <span className="text-navy dark:text-light-gray">{t('stage5.checkProcedure')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.checklist.clauses} onChange={() => handleChecklistChange('clauses')} className="h-4 w-4 rounded border-medium-gray/50 text-primary focus:ring-primary"/>
                    <span className="text-navy dark:text-light-gray">{t('stage5.checkClauses')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.checklist.compatibility} onChange={() => handleChecklistChange('compatibility')} className="h-4 w-4 rounded border-medium-gray/50 text-primary focus:ring-primary"/>
                    <span className="text-navy dark:text-light-gray">{t('stage5.checkCompatibility')}</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input 
                    label={t('stage5.validationDate')}
                    type="date"
                    value={data.validationDate}
                    onChange={e => updateData({ validationDate: e.target.value })}
                />
                <Input
                    label={t('stage5.validatorName')}
                    value={data.validatorName}
                    onChange={e => updateData({ validatorName: e.target.value })}
                    placeholder={t('stage5.validatorNamePlaceholder')}
                />
            </div>

            <AIVersionedTextEditor
                label={t('stage5.observationsLabel')}
                document={data.reportContent}
                onUpdate={(doc) => updateData({ reportContent: doc })}
                placeholder={t('stage5.observationsPlaceholder')}
                rows={10}
                tenderData={tenderData}
                fieldIdentifier={t('stage5.observationsLabel')}
            />
            
            <div className="mt-4">
                <Button variant="secondary" disabled>{t('stage5.generateReport')}</Button>
            </div>
        </div>

      <div className="mt-10 border-t border-medium-gray/20 dark:border-white/10 pt-6 flex justify-between items-center">
        <Button variant="secondary" onClick={onBack}>
          {t('general.back')}
        </Button>
        <Button onClick={onComplete} disabled={!isComplete}>{t('stage5.continue')}</Button>
      </div>
    </div>
  );
};

export default Stage6LegalReport;