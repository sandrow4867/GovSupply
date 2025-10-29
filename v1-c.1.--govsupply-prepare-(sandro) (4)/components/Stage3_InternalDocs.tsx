import React, { useRef } from 'react';
import type { TenderData, FileAttachment } from '../types';
import { Button } from './common/Button';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TextArea } from './common/TextArea';
import { Input } from './common/Input';
import { FileUpload } from './common/FileUpload';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AIVersionedTextEditor } from './common/AIVersionedTextEditor';

interface Stage3InternalDocsProps {
  onComplete: () => void;
  onBack: () => void;
  data: TenderData['stage2'];
  updateData: (data: Partial<TenderData['stage2']>) => void;
  tenderData: TenderData;
}

const Card: React.FC<{title: React.ReactNode, description?: string, children: React.ReactNode}> = ({title, description, children}) => (
    <div className="bg-white dark:bg-dark-blue p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10">
        <h3 className="text-xl font-bold text-navy dark:text-white">{title}</h3>
        {description && <p className="text-sm text-navy/70 dark:text-light-gray/70 mt-1 mb-4">{description}</p>}
        <div className="mt-4">
            {children}
        </div>
    </div>
);


const Stage3InternalDocs: React.FC<Stage3InternalDocsProps> = ({ onComplete, onBack, data, updateData, tenderData }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (files: FileList) => {
    const file = files[0];
    if(file){
        const newFile = { name: file.name, size: file.size };
        updateData({ necessityReport: { ...data.necessityReport, technicalDraft: newFile } });
        showToast(t('stage2.uploadSuccess', newFile.name), 'success');
    }
  };

  const handleRemoveFile = () => {
    updateData({ necessityReport: { ...data.necessityReport, technicalDraft: null } });
  };
  
  const calculateWithVat = (amount: string, rate: string): number => {
    const numAmount = parseFloat(amount) || 0;
    const numRate = parseFloat(rate) || 0;
    return numAmount * (1 + numRate / 100);
  };

  const formatCurrency = (value: number) => {
      return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  const canContinue = true;

  return (
    <div className="space-y-8">
      <Card title={t('stage2.necessityReportTitle')} description={t('stage2.necessityReportDesc')}>
        <div className="space-y-4">
            <AIVersionedTextEditor
                label={t('stage2.backgroundLabel')}
                document={data.necessityReport.background}
                onUpdate={doc => updateData({ necessityReport: {...data.necessityReport, background: doc }})}
                placeholder={t('stage2.backgroundPlaceholder')}
                rows={4}
                tenderData={tenderData}
                fieldIdentifier={t('stage2.backgroundLabel')}
            />
            <div>
                <p className="text-xs text-navy/70 dark:text-light-gray/70 mb-2">{t('stage2.criteriaNote')}</p>
                <AIVersionedTextEditor
                    label={t('stage2.valueJudgmentCriteriaLabel')}
                    document={data.necessityReport.evaluationCriteria.valueJudgment}
                    onUpdate={doc => updateData({ necessityReport: {...data.necessityReport, evaluationCriteria: { ...data.necessityReport.evaluationCriteria, valueJudgment: doc } }})}
                    placeholder={t('stage2.valueJudgmentCriteriaPlaceholder')}
                    rows={4}
                    tenderData={tenderData}
                    fieldIdentifier={t('stage2.valueJudgmentCriteriaLabel')}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage2.quantifiableCriteriaLabel')}</label>
                <p className="text-xs text-navy/70 dark:text-light-gray/70 mb-2">{t('stage2.criteriaNote')}</p>
                <TextArea
                    value={data.necessityReport.evaluationCriteria.quantifiable}
                    onChange={e => updateData({ necessityReport: {...data.necessityReport, evaluationCriteria: { ...data.necessityReport.evaluationCriteria, quantifiable: e.target.value } }})}
                    placeholder={t('stage2.quantifiableCriteriaPlaceholder')}
                    rows={4}
                />
            </div>
            <div>
                 <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage2.technicalDraftLabel')}</label>
                 <p className="text-xs text-navy/70 dark:text-light-gray/70 mb-2">{t('stage2.technicalDraftDesc')}</p>
                {data.necessityReport.technicalDraft ? (
                     <div className="flex items-center justify-between bg-white dark:bg-navy p-2 rounded-md border border-medium-gray/20 dark:border-white/10">
                        <div className="flex items-center gap-2 text-sm">
                            <FileIcon className="w-5 h-5 text-primary" />
                            <span className="font-medium text-navy dark:text-light-gray">{data.necessityReport.technicalDraft.name}</span>
                            <span className="text-medium-gray">({(data.necessityReport.technicalDraft.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <button onClick={handleRemoveFile} className="text-medium-gray hover:text-accent">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <FileUpload onFileSelect={handleFileSelect} />
                )}
            </div>
        </div>
      </Card>
      
      <Card title={t('stage2.creditCertificateTitle')} description={t('stage2.creditCertificateDesc')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label={t('stage2.budgetItemLabel')}
                value={data.creditCertificate.budgetItem}
                onChange={e => updateData({ creditCertificate: {...data.creditCertificate, budgetItem: e.target.value }})}
            />
             <Input
                label={t('stage3.vatRate')}
                type="number"
                value={data.creditCertificate.vatRate}
                onChange={e => updateData({ creditCertificate: {...data.creditCertificate, vatRate: e.target.value }})}
                endAdornment="%"
                placeholder="21"
            />
            <div>
              <Input
                  label={t('stage2.basePriceLabel')}
                  type="number"
                  value={data.creditCertificate.basePrice}
                  onChange={e => updateData({ creditCertificate: {...data.creditCertificate, basePrice: e.target.value }})}
                  endAdornment="€"
              />
              <p className="text-right text-sm text-medium-gray dark:text-light-gray/80 font-medium mt-1 pr-2">
                = {formatCurrency(calculateWithVat(data.creditCertificate.basePrice, data.creditCertificate.vatRate))} <span className="text-xs">({t('stage3.withVat')})</span>
              </p>
            </div>
            <div>
              <Input
                  label={t('stage2.estimatedPriceLabel')}
                  type="number"
                  value={data.creditCertificate.estimatedPrice}
                  onChange={e => updateData({ creditCertificate: {...data.creditCertificate, estimatedPrice: e.target.value }})}
                  endAdornment="€"
              />
               <p className="text-right text-sm text-medium-gray dark:text-light-gray/80 font-medium mt-1 pr-2">
                = {formatCurrency(calculateWithVat(data.creditCertificate.estimatedPrice, data.creditCertificate.vatRate))} <span className="text-xs">({t('stage3.withVat')})</span>
              </p>
            </div>
        </div>
      </Card>

      <Card title={t('stage2.approvalTitle')} description={t('stage2.approvalDesc')}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label={t('stage2.necessityReportDateLabel')}
                type="date"
                value={data.contractApproval.necessityReportDate}
                onChange={e => updateData({ contractApproval: {...data.contractApproval, necessityReportDate: e.target.value }})}
            />
            <Input
                label={t('stage2.creditCertificateDateLabel')}
                type="date"
                value={data.contractApproval.creditCertificateDate}
                onChange={e => updateData({ contractApproval: {...data.contractApproval, creditCertificateDate: e.target.value }})}
            />
             <Input
                label={t('stage2.legalReportDateLabel')}
                type="date"
                value={data.contractApproval.legalReportDate}
                onChange={e => updateData({ contractApproval: {...data.contractApproval, legalReportDate: e.target.value }})}
            />
             <Input
                label={t('stage2.financialControlDateLabel')}
                type="date"
                value={data.contractApproval.financialControlDate}
                onChange={e => updateData({ contractApproval: {...data.contractApproval, financialControlDate: e.target.value }})}
            />
             <Input
                label={t('stage2.boardApprovalDateLabel')}
                type="date"
                value={data.contractApproval.boardApprovalDate}
                onChange={e => updateData({ contractApproval: {...data.contractApproval, boardApprovalDate: e.target.value }})}
            />
         </div>
      </Card>


      <div className="mt-10 border-t border-medium-gray/20 dark:border-white/10 pt-6 flex justify-between items-center">
        <Button variant="secondary" onClick={onBack}>
          {t('general.back')}
        </Button>
        <Button onClick={onComplete} disabled={!canContinue}>{t('stage2.continue')}</Button>
      </div>
    </div>
  );
};

export default Stage3InternalDocs;