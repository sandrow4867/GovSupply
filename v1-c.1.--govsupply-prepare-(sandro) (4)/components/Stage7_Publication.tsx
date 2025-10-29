

import React from 'react';
import type { TenderData } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from './common/Input';

interface Stage7PublicationProps {
  onComplete: () => void;
  onBack: () => void;
  data: TenderData['stage4'];
  updateData: (data: Partial<TenderData['stage4']>) => void;
}

const Stage7Publication: React.FC<Stage7PublicationProps> = ({ onComplete, onBack, data, updateData }) => {
  const { t } = useLanguage();

  const isComplete = !!(data.publicationDate && data.platform && data.link && (data.link.startsWith('http://') || data.link.startsWith('https://')) && data.procedureType);

  const procedureTypes: (TenderData['stage4']['procedureType'])[] = ['open', 'restricted', 'negotiated', 'dialogue'];

  return (
    <div>
      <div className="bg-white dark:bg-navy p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10">
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">{t('stage4.formTitle')}</h3>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage4.publicationPlatform')}</label>
                <select
                    value={data.platform || ''}
                    onChange={(e) => updateData({ platform: e.target.value as any })}
                    className="block w-full px-3 py-2 bg-white dark:bg-dark-blue border border-medium-gray/50 dark:border-medium-gray/70 rounded-lg focus:outline-none focus:border-navy dark:focus:border-light-gray transition"
                >
                    <option value="" disabled>{t('stage4.selectPlatformPlaceholder')}</option>
                    <option value="PLACSP">{t('stage4.tabs.placsp')}</option>
                    <option value="DOUE">{t('stage4.tabs.doue')}</option>
                    <option value="BOE">{t('stage4.tabs.boe')}</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage4.procedureType')}</label>
                <select
                    value={data.procedureType || ''}
                    onChange={(e) => updateData({ procedureType: e.target.value as any })}
                    className="block w-full px-3 py-2 bg-white dark:bg-dark-blue border border-medium-gray/50 dark:border-medium-gray/70 rounded-lg focus:outline-none focus:border-navy dark:focus:border-light-gray transition"
                >
                    <option value="" disabled>{t('stage4.selectTypePlaceholder')}</option>
                    {procedureTypes.map(type => type && (
                        <option key={type} value={type}>{t(`stage4.procedureTypes.${type}`)}</option>
                    ))}
                </select>
            </div>
             <Input
                label={t('stage4.publicationDateTime')}
                type="datetime-local"
                value={data.publicationDate || ''}
                onChange={(e) => updateData({ publicationDate: e.target.value })}
            />
            <Input
                label={t('stage4.publicationLink')}
                type="url"
                value={data.link || ''}
                onChange={(e) => updateData({ link: e.target.value })}
                placeholder="https://contrataciondelestado.es/..."
            />
        </div>
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

export default Stage7Publication;