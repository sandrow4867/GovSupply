import React from 'react';
import type { TenderData } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from './common/Input';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { AIVersionedTextEditor } from './common/AIVersionedTextEditor';

interface Stage5ControlReportProps {
  onComplete: () => void;
  onBack: () => void;
  // FIX: Changed data prop to use Stage5Data to match component's needs.
  data: TenderData['stage5'];
  updateData: (data: Partial<TenderData['stage5']>) => void;
  tenderData: TenderData;
}

const Stage5ControlReport: React.FC<Stage5ControlReportProps> = ({ onComplete, onBack, data, updateData, tenderData }) => {
  const { t } = useLanguage();
  
  const isComplete = true;

  return (
    <div>
        <div className="bg-white dark:bg-navy p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">{t('stage4.status')}</h3>
            <div className="flex gap-4 mb-6">
                 <button
                    onClick={() => updateData({ status: 'favorable' })}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${data.status === 'favorable' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-medium-gray/30 dark:border-white/10 hover:border-primary/50'}`}
                >
                    <CheckIcon className="w-5 h-5 text-primary"/>
                    <span className="font-semibold text-navy dark:text-light-gray">{t('stage4.favorable')}</span>
                </button>
                 <button
                    onClick={() => updateData({ status: 'reparo' })}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${data.status === 'reparo' ? 'border-accent bg-accent/5 dark:bg-accent/10' : 'border-medium-gray/30 dark:border-white/10 hover:border-accent/50'}`}
                >
                    <XIcon className="w-5 h-5 text-accent"/>
                    <span className="font-semibold text-navy dark:text-light-gray">{t('stage4.reparo')}</span>
                </button>
            </div>

            <div className="border-t border-medium-gray/20 dark:border-white/10 pt-6 mb-6">
                <h4 className="text-lg font-semibold text-navy dark:text-white mb-4">{t('stage4.validationDetailsTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label={t('stage4.validationDate')}
                        type="date"
                        value={data.validationDate}
                        onChange={e => updateData({ validationDate: e.target.value })}
                    />
                    <Input
                        label={t('stage4.validatorName')}
                        value={data.validatorName}
                        onChange={e => updateData({ validatorName: e.target.value })}
                        placeholder={t('stage4.validatorNamePlaceholder')}
                    />
                </div>
            </div>

            <AIVersionedTextEditor
                label={t('stage4.reportContentLabel')}
                document={data.reportContent}
                onUpdate={(doc) => updateData({ reportContent: doc })}
                placeholder={t('stage4.reportContentPlaceholder')}
                rows={10}
                tenderData={tenderData}
                fieldIdentifier={t('stage4.reportContentLabel')}
            />

            {data.status === 'reparo' && (
                <div className="mt-4">
                    <Button>{t('stage4.resubmit')}</Button>
                </div>
            )}
        </div>

      <div className="mt-10 border-t border-medium-gray/20 dark:border-white/10 pt-6 flex justify-between items-center">
        <Button variant="secondary" onClick={onBack}>
          {t('general.back')}
        </Button>
        <Button onClick={onComplete} disabled={!isComplete}>{t('stage4.continue')}</Button>
      </div>
    </div>
  );
};

export default Stage5ControlReport;
