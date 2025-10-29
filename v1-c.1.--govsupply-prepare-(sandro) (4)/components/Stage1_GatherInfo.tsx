import React from 'react';
import type { TenderData } from '../types';
import { Button } from './common/Button';
import { TextArea } from './common/TextArea';
import { Input } from './common/Input';
import { useLanguage } from '../contexts/LanguageContext';
import { AIVersionedTextEditor } from './common/AIVersionedTextEditor';

interface Stage1InitialDataProps {
  onComplete: () => void;
  data: TenderData['stage1'];
  updateData: (data: Partial<TenderData['stage1']>) => void;
  onGoHome?: () => void;
  tenderData: TenderData;
}

const Card: React.FC<{title: React.ReactNode, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-white dark:bg-dark-blue p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10 ${className}`}>
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">{title}</h3>
        {children}
    </div>
);

const YesNoToggle: React.FC<{label: string, value: boolean | null, onChange: (value: boolean) => void}> = ({ label, value, onChange }) => {
    const { t } = useLanguage();
    const buttonClass = (isActive: boolean) => `flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white shadow-md' : 'bg-light-gray dark:bg-dark-blue hover:bg-medium-gray/20'}`;
    return (
        <div>
            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{label}</label>
            <div className="flex gap-2 p-1 bg-medium-gray/10 dark:bg-white/5 rounded-xl">
                <button type="button" onClick={() => onChange(true)} className={buttonClass(value === true)}>{t('general.yes')}</button>
                <button type="button" onClick={() => onChange(false)} className={buttonClass(value === false)}>{t('general.no')}</button>
            </div>
        </div>
    )
}

const Stage1InitialData: React.FC<Stage1InitialDataProps> = ({ onComplete, data, updateData, onGoHome, tenderData }) => {
  const { t } = useLanguage();
  
  const canContinue = true;

  const OptionalLabel = () => <span className="text-xs text-medium-gray/80 ml-1">{`(${t('general.optional')})`}</span>;

  return (
    <div className="space-y-8">
        <Card title={t('stage1.administrativeData')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input
                    label={<>{t('stage1.expedientNumberLabel')} <OptionalLabel /></>}
                    value={data.expedientNumber || ''}
                    onChange={(e) => updateData({ expedientNumber: e.target.value })}
                />
                 <Input
                    label={<>{t('stage1.serviceNameLabel')} <OptionalLabel /></>}
                    value={data.serviceName || ''}
                    onChange={(e) => updateData({ serviceName: e.target.value })}
                />
                 <Input
                    label={<>{t('stage1.contractingAuthorityNameLabel')} <OptionalLabel /></>}
                    value={data.contractingAuthorityName || ''}
                    onChange={(e) => updateData({ contractingAuthorityName: e.target.value })}
                />
                 <Input
                    label={<>{t('stage1.responsibleNameLabel')} <OptionalLabel /></>}
                    value={data.responsibleName || ''}
                    onChange={(e) => updateData({ responsibleName: e.target.value })}
                />
            </div>
        </Card>

        <Card title={t('stage1.needsAndScope')}>
            <AIVersionedTextEditor
                label={t('stage1.needsLabel')}
                document={data.needs}
                onUpdate={(doc) => updateData({ needs: doc })}
                placeholder={t('stage1.needsPlaceholder')}
                rows={5}
                tenderData={tenderData}
                fieldIdentifier={t('stage1.needsLabel')}
            />
        </Card>

        <Card title={t('stage1.economicData')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label={t('stage1.initialDurationLabel')}
                    value={data.initialDuration}
                    onChange={(e) => updateData({ initialDuration: e.target.value })}
                    placeholder={t('stage1.initialDurationPlaceholder')}
                />
                 <Input
                    label={<>{t('stage1.extensionsLabel')} <OptionalLabel /></>}
                    value={data.extensions}
                    onChange={(e) => updateData({ extensions: e.target.value })}
                    placeholder={t('stage1.extensionsPlaceholder')}
                />
                 <Input
                    label={<>{t('stage1.modificationsLabel')} <OptionalLabel /></>}
                    value={data.modifications}
                    onChange={(e) => updateData({ modifications: e.target.value })}
                    placeholder={t('stage1.modificationsPlaceholder')}
                />
            </div>
        </Card>
        
        <Card title={t('stage1.personalDataProtection')}>
            <div className="space-y-4">
                 <YesNoToggle 
                    label={t('stage1.usesPersonalDataLabel')} 
                    value={data.usesPersonalData} 
                    onChange={v => {
                        updateData({ usesPersonalData: v });
                        if (!v) {
                             const initialDoc = data.protectedDataDetails.versions.length > 0 ? { ...data.protectedDataDetails, versions: [{...data.protectedDataDetails.versions[0], content: ''}] } : data.protectedDataDetails;
                            updateData({ usesProtectedData: null, protectedDataDetails: initialDoc });
                        }
                    }} 
                />
                
                {data.usesPersonalData && (
                    <>
                        <YesNoToggle 
                            label={t('stage1.usesProtectedDataLabel')} 
                            value={data.usesProtectedData} 
                            onChange={v => updateData({ usesProtectedData: v })} 
                        />
                        <AIVersionedTextEditor
                            label={<>{t('stage1.protectedDataDetailsLabel')} <OptionalLabel /></>}
                            document={data.protectedDataDetails}
                            onUpdate={(doc) => updateData({ protectedDataDetails: doc })}
                            placeholder={t('stage1.protectedDataDetailsPlaceholder')}
                            rows={2}
                            tenderData={tenderData}
                            fieldIdentifier={t('stage1.protectedDataDetailsLabel')}
                        />
                    </>
                )}
            </div>

            <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4 mt-6">
                 <h4 className="text-md font-semibold text-navy/90 dark:text-light-gray/90 mb-4">{t('stage1.infoSystemSectionTitle')}</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <YesNoToggle label={t('stage1.usesAILabel')} value={data.infoSystemUsesAI} onChange={v => updateData({ infoSystemUsesAI: v })} />
                        <YesNoToggle label={t('stage1.inEuropeLabel')} value={data.infoSystemInEurope} onChange={v => updateData({ infoSystemInEurope: v })} />
                    </div>
                    <Input
                        label={<>{t('stage1.infoSystemNameLabel')} <OptionalLabel /></>}
                        value={data.infoSystemName || ''}
                        onChange={(e) => updateData({ infoSystemName: e.target.value })}
                        placeholder={t('stage1.infoSystemNamePlaceholder')}
                    />
                    <TextArea
                        label={<>{t('stage1.infoSystemLabel')} <OptionalLabel /></>}
                        value={data.infoSystemDetails}
                        onChange={(e) => updateData({ infoSystemDetails: e.target.value })}
                        placeholder={t('stage1.infoSystemDetailsPlaceholder')}
                        rows={2}
                    />
                </div>
            </div>
        </Card>

      <div className="mt-10 border-t border-medium-gray/20 dark:border-white/10 pt-6 flex justify-between items-center">
        {onGoHome ? 
          <Button variant="secondary" onClick={onGoHome}>{t('stage1.goHome')}</Button> 
          : <div></div>
        }
        <Button onClick={onComplete} disabled={!canContinue}>{t('general.continue')}</Button>
      </div>
    </div>
  );
};

export default Stage1InitialData;
