import React, { useState, useMemo, useEffect } from 'react';
import type { TenderData, VersionedDocument, DocumentVersion, Stage3CharacteristicsData, LegalNature, LotDivision, PPTData, Lot, PriceDeterminationType, Annuity, EnvelopeBLot, EconomicSolvencyType, EnvelopeCLot } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { TextArea } from './common/TextArea';
import { Input } from './common/Input';
import { PlusIcon } from './icons/PlusIcon';
import { Accordion } from './common/Accordion';
import { TrashIcon } from './icons/TrashIcon';
import { InfoIcon } from './icons/InfoIcon';
// FIX: Import AIVersionedTextEditor and remove obsolete AIAssistedTextArea.
import { AIVersionedTextEditor } from './common/AIVersionedTextEditor';

interface Stage4DraftingProps {
  onComplete: () => void;
  onBack: () => void;
  data: TenderData['stage3'];
  updateData: (data: Partial<TenderData['stage3']>) => void;
  tenderData: TenderData;
  onNavigateToStage: (stage: number) => void;
}

type ActiveTab = 'pcap' | 'characteristics';

const Card: React.FC<{title: React.ReactNode, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-white dark:bg-dark-blue p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10 ${className}`}>
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">{title}</h3>
        {children}
    </div>
);

const YesNoToggle: React.FC<{value: boolean | null, onChange: (value: boolean) => void, yesLabel?: string, noLabel?: string}> = ({ value, onChange, yesLabel, noLabel }) => {
    const { t } = useLanguage();
    const buttonClass = (isActive: boolean) => `flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white shadow-md' : 'bg-light-gray dark:bg-dark-blue hover:bg-medium-gray/20'}`;
    return (
        <div className="flex gap-2 p-1 bg-medium-gray/10 dark:bg-white/5 rounded-xl">
            <button type="button" onClick={() => onChange(true)} className={buttonClass(value === true)}>{yesLabel || t('general.yes')}</button>
            <button type="button" onClick={() => onChange(false)} className={buttonClass(value === false)}>{noLabel || t('general.no')}</button>
        </div>
    )
}

const LotDivisionToggle: React.FC<{value: LotDivision | '', onChange: (value: LotDivision) => void}> = ({ value, onChange }) => {
    const { t } = useLanguage();
    const options: {id: LotDivision, label: string}[] = [
        {id: 'yes', label: t('stage3.lotDivisionOptions.yes')},
        {id: 'no', label: t('stage3.lotDivisionOptions.no')},
    ];
    const buttonClass = (isActive: boolean) => `flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white shadow-md' : 'bg-light-gray dark:bg-dark-blue hover:bg-medium-gray/20'}`;
    return (
        <div className="flex gap-2 p-1 bg-medium-gray/10 dark:bg-white/5 rounded-xl">
            {options.map(opt => (
                 <button key={opt.id} type="button" onClick={() => onChange(opt.id)} className={buttonClass(value === opt.id)}>{opt.label}</button>
            ))}
        </div>
    )
}

const CharacteristicsDataForm: React.FC<{
    data: Stage3CharacteristicsData;
    updateData: (data: Partial<Stage3CharacteristicsData>) => void;
    vatRate: string;
    onNavigateToStage: (stage: number) => void;
    tenderData: TenderData;
}> = ({ data, updateData, vatRate, onNavigateToStage, tenderData }) => {
    const { t } = useLanguage();
    
    const handleUpdate = (field: keyof Stage3CharacteristicsData, value: any) => {
        updateData({ ...data, [field]: value });
    };

    const handleNumberOfLotsChange = (countStr: string) => {
        const count = parseInt(countStr, 10);
        
        handleUpdate('numberOfLots', countStr);

        if (isNaN(count) || count < 0) {
            handleUpdate('lots', []);
            return;
        }
    
        const currentLots = data.lots || [];
        const newLots = [...currentLots];
    
        if (newLots.length > count) {
            newLots.length = count;
        } else {
            for (let i = newLots.length; i < count; i++) {
                const newLotId = `lot_${Date.now()}_${i}`;
                newLots.push({
                    id: newLotId,
                    title: '',
                    description: { versions: [{ id: `v_desc_${newLotId}`, name: 'Versión 1', content: '', timestamp: new Date().toISOString() }], activeVersionId: `v_desc_${newLotId}`},
                    economicSolvencyTypes: {},
                    economicSolvencyAmount: '',
                    economicSolvencyOtherDetails: '',
                    technicalSolvencyCriteria: {},
                    technicalSolvencyCriteriaOther: '',
                });
            }
        }
        handleUpdate('lots', newLots);
    };

    
    const handleUpdateLot = (id: string, field: keyof Omit<Lot, 'id'>, value: any) => {
        handleUpdate('lots', (data.lots || []).map(lot => 
            lot.id === id ? { ...lot, [field]: value } : lot
        ));
    };
    
    const handleRemoveLot = (id: string) => {
        const newLots = (data.lots || []).filter(lot => lot.id !== id);
        handleUpdate('lots', newLots);
        handleUpdate('numberOfLots', newLots.length.toString());
    };

    const handleAddAnnuity = () => {
        const newAnnuity: Annuity = { id: `annuity_${Date.now()}`, year: '', months: '', amount: '' };
        handleUpdate('annuities', [...(data.annuities || []), newAnnuity]);
    };

    const handleUpdateAnnuity = (id: string, field: keyof Omit<Annuity, 'id'>, value: string) => {
        handleUpdate('annuities', (data.annuities || []).map(annuity => 
            annuity.id === id ? { ...annuity, [field]: value } : annuity
        ));
    };

    const handleRemoveAnnuity = (id: string) => {
        handleUpdate('annuities', (data.annuities || []).filter(annuity => annuity.id !== id));
    };

    const handleAddEnvelopeBLot = () => {
        const newLot: EnvelopeBLot = {
            id: `envBlot_${Date.now()}`,
            title: '',
            criteria: '',
        };
        handleUpdate('envelopeDocumentation_B', [...(data.envelopeDocumentation_B || []), newLot]);
    };

    const handleUpdateEnvelopeBLot = (id: string, field: keyof Omit<EnvelopeBLot, 'id'>, value: string) => {
        handleUpdate('envelopeDocumentation_B', (data.envelopeDocumentation_B || []).map(lot =>
            lot.id === id ? { ...lot, [field]: value } : lot
        ));
    };

    const handleRemoveEnvelopeBLot = (id: string) => {
        handleUpdate('envelopeDocumentation_B', (data.envelopeDocumentation_B || []).filter(lot => lot.id !== id));
    };

    const handleAddEnvelopeCLot = () => {
        const newLot: EnvelopeCLot = {
            id: `envClot_${Date.now()}`,
            title: '',
            criteria: '',
        };
        handleUpdate('envelopeDocumentation_C', [...(data.envelopeDocumentation_C || []), newLot]);
    };

    const handleUpdateEnvelopeCLot = (id: string, field: keyof Omit<EnvelopeCLot, 'id'>, value: string) => {
        handleUpdate('envelopeDocumentation_C', (data.envelopeDocumentation_C || []).map(lot =>
            lot.id === id ? { ...lot, [field]: value } : lot
        ));
    };

    const handleRemoveEnvelopeCLot = (id: string) => {
        handleUpdate('envelopeDocumentation_C', (data.envelopeDocumentation_C || []).filter(lot => lot.id !== id));
    };

    const calculateWithVat = (amount: string, rate: string): number => {
        const numAmount = parseFloat(amount) || 0;
        const numRate = parseFloat(rate) || 0;
        return numAmount * (1 + numRate / 100);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    const totalEstimatedValueWithoutVat = useMemo(() => {
        const base = parseFloat(data.baseBudget) || 0;
        const mods = parseFloat(data.modificationsAmount) || 0;
        const exts = parseFloat(data.extensionsAmount) || 0;
        return (base + mods + exts);
    }, [data.baseBudget, data.modificationsAmount, data.extensionsAmount]);

    const totalEstimatedValueWithVat = useMemo(() => {
        return calculateWithVat(totalEstimatedValueWithoutVat.toString(), vatRate);
    }, [totalEstimatedValueWithoutVat, vatRate]);


    const legalNatureOptions: { value: LegalNature, label: string }[] = [
        { value: 'service', label: t('stage3.legalNatureOptions.service') },
        { value: 'supply', label: t('stage3.legalNatureOptions.supply') },
        { value: 'works', label: t('stage3.legalNatureOptions.works') },
        { value: 'other', label: t('stage3.legalNatureOptions.other') },
    ];
    
    const priceDeterminationOptions: { value: PriceDeterminationType, label: string }[] = [
        { value: 'lumpSum', label: t('stage3.priceDeterminationOptions.lumpSum') },
        { value: 'unitPrice', label: t('stage3.priceDeterminationOptions.unitPrice') },
    ];

    const economicSolvencyTypeOptions: { value: EconomicSolvencyType, label: string}[] = [
        { value: 'turnover', label: t('stage3.economicSolvencyTypes.turnover') },
        { value: 'insurance', label: t('stage3.economicSolvencyTypes.insurance') },
        { value: 'netWorth', label: t('stage3.economicSolvencyTypes.netWorth') },
        { value: 'other', label: t('stage3.economicSolvencyTypes.other') },
    ];

    const technicalSolvencyCriteriaOptions = t('stage3.technicalSolvencyCriteria');
    const nonHarmonizedCriteriaOptions = t('stage3.nonHarmonizedCriteria');

    return (
        <div className="space-y-8 mb-12">
            <Card title={t('stage3.characteristicsAdminDataTitle')}>
                <div className="space-y-6">
                    <AIVersionedTextEditor 
                        label={t('stage3.object')} 
                        document={data.object} 
                        onUpdate={doc => handleUpdate('object', doc)} 
                        rows={4} 
                        tenderData={tenderData}
                        fieldIdentifier={t('stage3.object')}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input 
                           label={t('stage3.cpvCodes')} 
                           value={data.cpvCodes} 
                           onChange={e => handleUpdate('cpvCodes', e.target.value)} 
                       />
                       <div>
                           <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.legalNature')}</label>
                           <select 
                             value={data.legalNature}
                             onChange={e => handleUpdate('legalNature', e.target.value)}
                             className="block w-full px-3 py-2 bg-white dark:bg-dark-blue border border-medium-gray/50 dark:border-medium-gray/70 rounded-lg focus:outline-none focus:border-navy dark:focus:border-light-gray transition"
                           >
                                <option value="" disabled>{t('general.selectPlaceholder')}</option>
                                {legalNatureOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                           </select>
                       </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.innovativePurchase')}</label>
                            <YesNoToggle value={data.innovativePurchase} onChange={v => handleUpdate('innovativePurchase', v)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.lotDivision')}</label>
                            <LotDivisionToggle value={data.lotDivision} onChange={v => handleUpdate('lotDivision', v)} />
                        </div>
                     </div>

                     {data.lotDivision === 'yes' && (
                        <div className="mt-4 p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                            <h4 className="font-semibold mb-2 text-navy dark:text-white">{t('stage3.manageLotsTitle')}</h4>
                            <div className="mb-4">
                                <Input
                                    label={t('stage3.numberOfLots')}
                                    value={data.numberOfLots || ''}
                                    onChange={(e) => handleNumberOfLotsChange(e.target.value)}
                                    type="number"
                                />
                            </div>
                            <div className="space-y-3">
                                {(data.lots || []).map((lot, index) => (
                                    <div key={lot.id} className="p-3 bg-white dark:bg-navy rounded-md border border-medium-gray/30 dark:border-white/20 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                value={lot.title}
                                                onChange={(e) => handleUpdateLot(lot.id, 'title', e.target.value)}
                                                placeholder={t('stage3.lotTitlePlaceholder', index + 1)}
                                                className="flex-grow font-semibold"
                                            />
                                            <button onClick={() => handleRemoveLot(lot.id)} className="p-2 rounded-md hover:bg-dark-blue/10 text-medium-gray hover:text-accent dark:hover:bg-white/10" aria-label={`Remove lot ${index + 1}`}>
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <AIVersionedTextEditor
                                            document={lot.description}
                                            onUpdate={(doc) => handleUpdateLot(lot.id, 'description', doc)}
                                            placeholder={t('stage3.lotDescriptionPlaceholder')}
                                            rows={2}
                                            tenderData={tenderData}
                                            fieldIdentifier={`${t('stage3.lotDescriptionPlaceholder')} - ${lot.title || index + 1}`}
                                        />
                                    </div>
                                ))}
                                 {(data.lots || []).length === 0 && <p className="text-sm text-medium-gray">{t('stage3.noLotsAdded')}</p>}
                            </div>
                            
                            <div className="border-t border-medium-gray/20 dark:border-white/10 mt-6 pt-4">
                                <h4 className="font-semibold mb-4 text-navy dark:text-white">{t('stage3.lotBiddingOptionsTitle')}</h4>
                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={!!data.allLotsMandatory} onChange={(e) => handleUpdate('allLotsMandatory', e.target.checked)} className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"/>
                                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.allLotsMandatory')}</span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={!!data.canBidOnOneOrAllLots} onChange={(e) => handleUpdate('canBidOnOneOrAllLots', e.target.checked)} className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"/>
                                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.canBidOnOneOrAllLots')}</span>
                                    </label>
                                    
                                    <div>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" checked={!!data.minLotsToBidRequired} onChange={(e) => handleUpdate('minLotsToBidRequired', e.target.checked)} className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"/>
                                            <span className="text-navy dark:text-light-gray text-sm">{t('stage3.minLotsToBidRequired')}</span>
                                        </label>
                                        {data.minLotsToBidRequired && (
                                            <div className="mt-2 pl-7 space-y-4">
                                                <Input
                                                    type="number"
                                                    label={t('stage3.minLotsToBidCount')}
                                                    value={data.minLotsToBidCount || ''}
                                                    onChange={(e) => handleUpdate('minLotsToBidCount', e.target.value)}
                                                />
                                                <div className="space-y-2 p-3 bg-white dark:bg-navy rounded-md">
                                                    <p className="text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.minLotsToBidSelectionPlaceholder')}</p>
                                                    {(data.lots || []).length > 0 ? (data.lots || []).map((lot, index) => (
                                                        <label key={lot.id} className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox"
                                                                checked={!!data.minLotsToBidSelection?.[lot.id]}
                                                                onChange={e => {
                                                                    const newSelection = { ...(data.minLotsToBidSelection || {}) };
                                                                    if (e.target.checked) {
                                                                        newSelection[lot.id] = true;
                                                                    } else {
                                                                        delete newSelection[lot.id];
                                                                    }
                                                                    handleUpdate('minLotsToBidSelection', newSelection);
                                                                }}
                                                                className="h-4 w-4 rounded border-medium-gray/50 text-primary focus:ring-primary"
                                                            />
                                                            <span className="text-sm">{lot.title || t('stage3.lotTitlePlaceholder', index + 1)}</span>
                                                        </label>
                                                    )) : <p className="text-sm text-medium-gray">{t('stage3.noLotsAdded')}</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" checked={!!data.mandatoryLotsToBid} onChange={(e) => handleUpdate('mandatoryLotsToBid', e.target.checked)} className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"/>
                                            <span className="text-navy dark:text-light-gray text-sm">{t('stage3.mandatoryLotsToBid')}</span>
                                        </label>
                                        {data.mandatoryLotsToBid && (
                                            <div className="mt-2 pl-7">
                                                <div className="space-y-2 p-3 bg-white dark:bg-navy rounded-md">
                                                    <p className="text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.mandatoryLotsToBidPlaceholder')}</p>
                                                    {(data.lots || []).length > 0 ? (data.lots || []).map((lot, index) => (
                                                        <label key={lot.id} className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox"
                                                                checked={!!data.mandatoryLotsToBidSelection?.[lot.id]}
                                                                onChange={e => {
                                                                    const newSelection = { ...(data.mandatoryLotsToBidSelection || {}) };
                                                                    if (e.target.checked) {
                                                                        newSelection[lot.id] = true;
                                                                    } else {
                                                                        delete newSelection[lot.id];
                                                                    }
                                                                    handleUpdate('mandatoryLotsToBidSelection', newSelection);
                                                                }}
                                                                className="h-4 w-4 rounded border-medium-gray/50 text-primary focus:ring-primary"
                                                            />
                                                            <span className="text-sm">{lot.title || t('stage3.lotTitlePlaceholder', index + 1)}</span>
                                                        </label>
                                                    )) : <p className="text-sm text-medium-gray">{t('stage3.noLotsAdded')}</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={!!data.mustBidOnFullLots} onChange={(e) => handleUpdate('mustBidOnFullLots', e.target.checked)} className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"/>
                                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.mustBidOnFullLots')}</span>
                                    </label>

                                </div>
                            </div>
                        </div>
                    )}
                    {data.lotDivision === 'no' && (
                        <div className="mt-4">
                            <AIVersionedTextEditor
                                label={t('stage3.lotDivisionNoJustificationLabel')}
                                document={data.lotDivisionJustification || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                onUpdate={doc => handleUpdate('lotDivisionJustification', doc)}
                                placeholder={t('stage3.lotDivisionNoJustificationPlaceholder')}
                                rows={4}
                                tenderData={tenderData}
                                fieldIdentifier={t('stage3.lotDivisionNoJustificationLabel')}
                            />
                        </div>
                    )}
                </div>
            </Card>

            <Card title={t('stage3.economicDataTitle')}>
                <button 
                    onClick={() => onNavigateToStage(2)}
                    className="flex items-center gap-2 text-sm text-accent dark:text-accent/90 bg-accent/10 dark:bg-accent/20 px-3 py-2 rounded-lg mb-4 w-full text-left hover:bg-accent/20 transition-colors cursor-pointer"
                >
                    <InfoIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{t('stage3.vatNotice', vatRate)}</span>
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 items-start">
                    <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.priceDetermination')}</label>
                           <select 
                             value={data.priceDetermination}
                             onChange={e => handleUpdate('priceDetermination', e.target.value)}
                             className="block w-full px-3 py-2 bg-white dark:bg-dark-blue border border-medium-gray/50 dark:border-medium-gray/70 rounded-lg focus:outline-none focus:border-navy dark:focus:border-light-gray transition"
                           >
                                <option value="" disabled>{t('general.selectPlaceholder')}</option>
                                {priceDeterminationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                           </select>
                        </div>
                        <Input
                            label={t('stage3.billingType')}
                            value={data.billingType || ''}
                            onChange={e => handleUpdate('billingType', e.target.value)}
                            placeholder={t('stage3.billingTypePlaceholder')}
                        />
                        <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4 space-y-4">
                            <div>
                                <Input
                                    label={t('stage3.baseBudget')}
                                    type="number"
                                    value={data.baseBudget}
                                    onChange={e => handleUpdate('baseBudget', e.target.value)}
                                    endAdornment="€"
                                    placeholder="0,00"
                                />
                                <p className="text-right text-sm text-medium-gray dark:text-light-gray/80 font-medium mt-1 pr-2">
                                    = {formatCurrency(calculateWithVat(data.baseBudget, vatRate))} <span className="text-xs">({t('stage3.withVat')})</span>
                                </p>
                            </div>
                            <div>
                                <Input
                                    label={t('stage3.modificationsAmount')}
                                    type="number"
                                    value={data.modificationsAmount}
                                    onChange={e => handleUpdate('modificationsAmount', e.target.value)}
                                    endAdornment="€"
                                    placeholder="0,00"
                                />
                                <p className="text-right text-sm text-medium-gray dark:text-light-gray/80 font-medium mt-1 pr-2">
                                    = {formatCurrency(calculateWithVat(data.modificationsAmount, vatRate))} <span className="text-xs">({t('stage3.withVat')})</span>
                                </p>
                            </div>
                            <div>
                                <Input
                                    label={t('stage3.extensionsAmount')}
                                    type="number"
                                    value={data.extensionsAmount}
                                    onChange={e => handleUpdate('extensionsAmount', e.target.value)}
                                    endAdornment="€"
                                    placeholder="0,00"
                                />
                                 <p className="text-right text-sm text-medium-gray dark:text-light-gray/80 font-medium mt-1 pr-2">
                                    = {formatCurrency(calculateWithVat(data.extensionsAmount, vatRate))} <span className="text-xs">({t('stage3.withVat')})</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 lg:mt-12 sticky top-28">
                         <div className="bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl p-6 text-center">
                            <h4 className="text-lg font-semibold text-primary/80 dark:text-primary/90">{t('stage3.estimatedValue')}</h4>
                            <p className="text-4xl font-bold text-primary mt-2">{formatCurrency(totalEstimatedValueWithoutVat)}</p>
                         </div>
                         <div className="bg-primary/10 dark:bg-primary/20 border-2 border-solid border-primary/50 rounded-xl p-6 text-center">
                            <h4 className="text-lg font-semibold text-primary dark:text-primary">{t('stage3.estimatedValueWithVat')}</h4>
                            <p className="text-4xl font-bold text-primary mt-2">{formatCurrency(totalEstimatedValueWithVat)}</p>
                         </div>
                    </div>
                </div>
            </Card>

            <Card title={t('stage3.creditDetailsTitle')}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.multiYearSupply')}</label>
                        <LotDivisionToggle value={data.multiYearSupply || ''} onChange={v => handleUpdate('multiYearSupply', v)} />
                    </div>

                    {data.multiYearSupply === 'yes' && (
                        <Input
                            label={t('stage3.multiYearSupplyApprovalDate')}
                            type="date"
                            value={data.multiYearSupplyApprovalDate || ''}
                            onChange={e => handleUpdate('multiYearSupplyApprovalDate', e.target.value)}
                        />
                    )}

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <h4 className="font-semibold mb-2 text-navy dark:text-white">{t('stage3.annuityDistributionTitle')}</h4>
                        <div className="space-y-2">
                            {(data.annuities || []).length > 0 && (
                                <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-medium-gray">
                                    <div className="col-span-3">{t('stage3.annuityYear')}</div>
                                    <div className="col-span-3">{t('stage3.annuityMonths')}</div>
                                    <div className="col-span-5">{t('stage3.annuityAmount')}</div>
                                    <div className="col-span-1"></div>
                                </div>
                            )}
                            {(data.annuities || []).map((annuity, index) => (
                                <div key={annuity.id} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-3">
                                        <Input 
                                            value={annuity.year}
                                            onChange={(e) => handleUpdateAnnuity(annuity.id, 'year', e.target.value)}
                                            placeholder={`${new Date().getFullYear() + index}`}
                                            type="number"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                         <Input 
                                            value={annuity.months}
                                            onChange={(e) => handleUpdateAnnuity(annuity.id, 'months', e.target.value)}
                                            placeholder="12"
                                            type="number"
                                        />
                                    </div>
                                    <div className="col-span-5">
                                         <Input 
                                            value={annuity.amount}
                                            onChange={(e) => handleUpdateAnnuity(annuity.id, 'amount', e.target.value)}
                                            placeholder="0.00"
                                            type="number"
                                            endAdornment="€"
                                        />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button onClick={() => handleRemoveAnnuity(annuity.id)} className="p-2 rounded-md hover:bg-dark-blue/10 text-medium-gray hover:text-accent dark:hover:bg-white/10" aria-label={`Remove annuity ${index + 1}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleAddAnnuity} className="mt-3">
                            <PlusIcon className="w-4 h-4 mr-2"/>
                            {t('stage3.addAnnuity')}
                        </Button>
                    </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.anticipatedExpenditure')}</label>
                        <YesNoToggle value={data.anticipatedExpenditure} onChange={v => handleUpdate('anticipatedExpenditure', v)} />
                    </div>
                </div>
            </Card>

            <Card title={t('stage3.durationAndVariantsTitle')}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={t('stage3.estimatedStartDate')}
                            type="date"
                            value={data.estimatedStartDate || ''}
                            onChange={e => handleUpdate('estimatedStartDate', e.target.value)}
                        />
                        <Input
                            label={t('stage3.contractDurationTerm')}
                            value={data.contractDuration || ''}
                            onChange={e => handleUpdate('contractDuration', e.target.value)}
                            placeholder="Ej: 4 años"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.partialTerms')}</label>
                            <YesNoToggle value={data.partialTerms} onChange={v => handleUpdate('partialTerms', v)} />
                            {data.partialTerms === true && (
                                <div className="mt-2">
                                    <TextArea
                                        label={t('stage3.partialTermsDetailsLabel')}
                                        value={data.partialTermsDetails || ''}
                                        onChange={e => handleUpdate('partialTermsDetails', e.target.value)}
                                        rows={3}
                                        placeholder="Ej: Plazo 1 para Lote A, Plazo 2 para Lote B"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.extensionsPossible')}</label>
                            <YesNoToggle value={data.extensionsPossible} onChange={v => handleUpdate('extensionsPossible', v)} />
                        </div>
                    </div>

                    {data.extensionsPossible === true && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                            <Input
                                label={t('stage3.extensionsCount')}
                                type="number"
                                value={data.extensionsCount || ''}
                                onChange={e => handleUpdate('extensionsCount', e.target.value)}
                                placeholder="1"
                            />
                            <Input
                                label={t('stage3.extensionDuration')}
                                value={data.extensionDuration || ''}
                                onChange={e => handleUpdate('extensionDuration', e.target.value)}
                                placeholder="Ej: 12 meses"
                            />
                        </div>
                    )}
                    
                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.variantsAdmission')}</label>
                        <YesNoToggle value={data.variantsAdmission} onChange={v => handleUpdate('variantsAdmission', v)} />
                         {data.variantsAdmission === true && (
                            <div className="mt-2">
                                <TextArea
                                    label={t('stage3.variantsAdmissionDetailsLabel')}
                                    value={data.variantsAdmissionDetails || ''}
                                    onChange={e => handleUpdate('variantsAdmissionDetails', e.target.value)}
                                    rows={3}
                                    placeholder="Ej: Variante 1: Mejora en calidad, Variante 2: Reducción de plazo"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card title={t('stage3.procedureTitle')}>
                 <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2 text-navy dark:text-white">{t('stage3.procedureSection')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label={t('stage3.procedureType')} 
                                value={data.procedure || ''} 
                                onChange={e => handleUpdate('procedure', e.target.value)}
                                placeholder={t('stage3.procedureTypePlaceholder')}
                            />
                             <Input 
                                label={t('stage3.processingType')} 
                                value={data.processingType || ''} 
                                onChange={e => handleUpdate('processingType', e.target.value)}
                                placeholder={t('stage3.processingTypePlaceholder')}
                            />
                        </div>
                        <p className="text-xs text-medium-gray/80 dark:text-medium-gray/70 mt-3">Article 22 i 156 i ss de la LCSP</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.harmonizedRegulation')}</label>
                            <YesNoToggle value={data.harmonizedRegulation} onChange={v => handleUpdate('harmonizedRegulation', v)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.priorNotice')}</label>
                            <YesNoToggle value={data.priorNotice} onChange={v => handleUpdate('priorNotice', v)} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.digitalEnvelope')}</label>
                            <YesNoToggle value={data.digitalEnvelope} onChange={v => handleUpdate('digitalEnvelope', v)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.electronicAuction')}</label>
                            <YesNoToggle value={data.electronicAuction} onChange={v => handleUpdate('electronicAuction', v)} />
                        </div>
                    </div>
                    <Input 
                        label={t('stage3.maxProposalDate')} 
                        value={data.maxProposalDate || ''} 
                        onChange={e => handleUpdate('maxProposalDate', e.target.value)}
                        placeholder={t('stage3.maxProposalDatePlaceholder')}
                    />
                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <h4 className="font-semibold mb-2 text-navy dark:text-white">{t('stage3.samplesSection')}</h4>
                         <div>
                            <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.samplesDelivery')}</label>
                            <LotDivisionToggle value={data.samplesDelivery || ''} onChange={v => handleUpdate('samplesDelivery', v)} />
                        </div>
                        {data.samplesDelivery === 'yes' && (
                            <div className="mt-4 p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10 space-y-4">
                                <TextArea
                                    label={t('stage3.samplesProductsLabel')}
                                    value={data.samplesProducts || ''}
                                    onChange={e => handleUpdate('samplesProducts', e.target.value)}
                                    rows={3}
                                />
                                <Input
                                    label={t('stage3.samplesLocationLabel')}
                                    value={data.samplesLocation || ''}
                                    onChange={e => handleUpdate('samplesLocation', e.target.value)}
                                />
                                <Input
                                    label={t('stage3.samplesUnitCountLabel')}
                                    type="number"
                                    value={data.samplesUnitCount || ''}
                                    onChange={e => handleUpdate('samplesUnitCount', e.target.value)}
                                />
                                <TextArea
                                    label={t('stage3.samplesIdentificationLabel')}
                                    value={data.samplesIdentification || ''}
                                    onChange={e => handleUpdate('samplesIdentification', e.target.value)}
                                    rows={3}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.samplesSubmissionTimeLabel')}</label>
                                    <select
                                        value={data.samplesSubmissionTime || ''}
                                        onChange={e => handleUpdate('samplesSubmissionTime', e.target.value)}
                                        className="block w-full px-3 py-2 bg-white dark:bg-dark-blue border border-medium-gray/50 dark:border-medium-gray/70 rounded-lg focus:outline-none focus:border-navy dark:focus:border-light-gray transition"
                                    >
                                        <option value="" disabled>{t('general.selectPlaceholder')}</option>
                                        <option value="withBid">{t('stage3.samplesSubmissionTimeOptions.withBid')}</option>
                                        <option value="onRequest">{t('stage3.samplesSubmissionTimeOptions.onRequest')}</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card title={t('stage3.guaranteeAndReviewTitle')}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.provisionalGuarantee')}</label>
                        <YesNoToggle value={data.provisionalGuarantee} onChange={v => handleUpdate('provisionalGuarantee', v)} />
                    </div>
                    {data.provisionalGuarantee && (
                        <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.provisionalGuaranteePerLotLabel')}</label>
                                <YesNoToggle value={data.provisionalGuaranteePerLot} onChange={v => handleUpdate('provisionalGuaranteePerLot', v)} />
                            </div>
                            {data.provisionalGuaranteePerLot && (
                                <TextArea
                                    label={t('stage3.provisionalGuaranteeLotAmountLabel')}
                                    value={data.provisionalGuaranteeLotAmount || ''}
                                    onChange={e => handleUpdate('provisionalGuaranteeLotAmount', e.target.value)}
                                    rows={3}
                                />
                            )}
                            <TextArea
                                label={t('stage3.provisionalGuaranteeConstitutionLabel')}
                                value={data.provisionalGuaranteeConstitution || ''}
                                onChange={e => handleUpdate('provisionalGuaranteeConstitution', e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.definitiveGuarantee')}</label>
                        <YesNoToggle value={data.definitiveGuarantee} onChange={v => handleUpdate('definitiveGuarantee', v)} />
                    </div>
                    {data.definitiveGuarantee && (
                        <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10 space-y-4">
                            <Input
                                label={t('stage3.definitiveGuaranteeDetails')}
                                value={data.definitiveGuaranteeDetails || ''}
                                onChange={e => handleUpdate('definitiveGuaranteeDetails', e.target.value)}
                                placeholder={t('stage3.definitiveGuaranteeDetailsPlaceholder')}
                            />
                            <TextArea
                                label={t('stage3.definitiveGuaranteeConstitutionLabel')}
                                value={data.definitiveGuaranteeConstitution || ''}
                                onChange={e => handleUpdate('definitiveGuaranteeConstitution', e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.complementaryGuarantee')}</label>
                        <YesNoToggle value={data.complementaryGuarantee} onChange={v => handleUpdate('complementaryGuarantee', v)} />
                    </div>
                    {data.complementaryGuarantee && (
                         <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10 space-y-4">
                            <TextArea
                                label={t('stage3.complementaryGuaranteeDetailsLabel')}
                                value={data.complementaryGuaranteeDetails || ''}
                                onChange={e => handleUpdate('complementaryGuaranteeDetails', e.target.value)}
                                rows={3}
                            />
                            <TextArea
                                label={t('stage3.complementaryGuaranteeConstitutionLabel')}
                                value={data.complementaryGuaranteeConstitution || ''}
                                onChange={e => handleUpdate('complementaryGuaranteeConstitution', e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.guaranteeTerm')}</label>
                        <YesNoToggle value={data.guaranteeTerm} onChange={v => handleUpdate('guaranteeTerm', v)} />
                    </div>
                    {data.guaranteeTerm && (
                        <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('stage3.guaranteeTermDurationLabel')}
                                value={data.guaranteeTermDuration || ''}
                                onChange={e => handleUpdate('guaranteeTermDuration', e.target.value)}
                                placeholder="Ej: 2 años"
                            />
                             <Input
                                label={t('stage3.guaranteeTermStartDateLabel')}
                                value={data.guaranteeTermStartDate || ''}
                                onChange={e => handleUpdate('guaranteeTermStartDate', e.target.value)}
                                type="date"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.priceReview')}</label>
                        <YesNoToggle value={data.priceReview} onChange={v => handleUpdate('priceReview', v)} />
                    </div>
                    {data.priceReview && (
                        <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                             <TextArea
                                label={t('stage3.priceReviewDetailsLabel')}
                                value={data.priceReviewDetails || ''}
                                onChange={e => handleUpdate('priceReviewDetails', e.target.value)}
                                placeholder={t('stage3.priceReviewDetailsNote')}
                                rows={4}
                            />
                        </div>
                    )}
                </div>
            </Card>

            <Card title={t('stage3.subcontractingAndAssignmentTitle')}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.subcontractingProceed')}</label>
                        <YesNoToggle value={data.subcontracting} onChange={v => handleUpdate('subcontracting', v)} />
                    </div>
                    {data.subcontracting === true && (
                        <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10 space-y-4">
                            <AIVersionedTextEditor
                                label={t('stage3.subcontractingDetails')}
                                document={data.subcontractingDetails || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                onUpdate={doc => handleUpdate('subcontractingDetails', doc)}
                                placeholder={t('stage3.subcontractingDetailsPlaceholder')}
                                rows={3}
                                tenderData={tenderData}
                                fieldIdentifier={t('stage3.subcontractingDetails')}
                            />
                        </div>
                    )}
                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.assignmentProceed')}</label>
                        <YesNoToggle value={data.assignment} onChange={v => handleUpdate('assignment', v)} />
                    </div>

                    {data.assignment === true && (
                        <div className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                            <AIVersionedTextEditor
                                label={t('stage3.assignmentDetails')}
                                document={data.assignmentDetails || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                onUpdate={doc => handleUpdate('assignmentDetails', doc)}
                                placeholder={t('stage3.assignmentDetailsPlaceholder')}
                                rows={5}
                                tenderData={tenderData}
                                fieldIdentifier={t('stage3.assignmentDetails')}
                            />
                        </div>
                    )}
                </div>
            </Card>

            <Card title={t('stage3.solvencyTitle')}>
                 <div className="space-y-6">
                     <p className="text-sm text-navy/80 dark:text-light-gray/80">{t('stage3.solvencyInfoText2')}</p>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <h4 className="font-semibold text-navy dark:text-white">{t('stage3.solvencyClassificationTitle')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <Input label={t('stage3.solvencyCategory')} value={data.solvencyClassificationCategory || ''} onChange={e => handleUpdate('solvencyClassificationCategory', e.target.value)} placeholder="5" />
                            <Input label={t('stage3.solvencyGroup')} value={data.solvencyClassificationGroup || ''} onChange={e => handleUpdate('solvencyClassificationGroup', e.target.value)} placeholder="M" />
                            <Input label={t('stage3.solvencySubgroup')} value={data.solvencyClassificationSubgroup || ''} onChange={e => handleUpdate('solvencyClassificationSubgroup', e.target.value)} placeholder="M-6" />
                        </div>
                    </div>

                     <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-navy dark:text-white">{t('stage3.economicSolvencyTitle')}</h4>
                            <div className="flex items-center gap-2">
                               <label className="text-sm font-medium text-navy/90 dark:text-light-gray/90">{t('stage3.perLot')}</label>
                               <YesNoToggle value={data.solvencyEconomicPerLot} onChange={v => handleUpdate('solvencyEconomicPerLot', v)} />
                            </div>
                        </div>
                        
                        {!data.solvencyEconomicPerLot && (
                             <div className="space-y-4 mt-4 p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                                <div className="space-y-3">
                                    {economicSolvencyTypeOptions.map(opt => (
                                        <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 bg-white dark:bg-navy rounded-lg hover:bg-white/80">
                                            <input
                                                type="checkbox"
                                                checked={!!data.economicSolvencyTypes?.[opt.value]}
                                                onChange={e => {
                                                    const newSelection = { ...(data.economicSolvencyTypes || {}) };
                                                    if (e.target.checked) newSelection[opt.value] = true;
                                                    else delete newSelection[opt.value];
                                                    handleUpdate('economicSolvencyTypes', newSelection);
                                                }}
                                                className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                                            />
                                            <span className="text-navy dark:text-light-gray text-sm">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                                 {data.economicSolvencyTypes?.other &&
                                      <Input
                                         label={t('stage3.economicSolvencyOtherDetailsLabel')}
                                         value={data.economicSolvencyOtherDetails || ''}
                                         onChange={(e) => handleUpdate('economicSolvencyOtherDetails', e.target.value)}
                                     />
                                 }
                                 {Object.keys(data.economicSolvencyTypes || {}).length > 0 &&
                                     <Input
                                         label={t('stage3.economicSolvencyAmount')}
                                         value={data.economicSolvencyAmount || ''}
                                         onChange={(e) => handleUpdate('economicSolvencyAmount', e.target.value)}
                                         endAdornment="€"
                                         placeholder="900.287,89"
                                     />
                                 }
                             </div>
                        )}
                        
                        {data.solvencyEconomicPerLot && (
                            <div className="space-y-4 mt-4">
                                {(data.lots || []).map(lot => (
                                    <div key={lot.id} className="p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                                        <p className="font-semibold text-navy dark:text-white">{lot.title || t('general.unspecified')}</p>
                                        <div className="space-y-2 mt-2">
                                            <div className="space-y-3">
                                                {economicSolvencyTypeOptions.map(opt => (
                                                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 bg-white dark:bg-navy rounded-lg hover:bg-white/80">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!lot.economicSolvencyTypes?.[opt.value]}
                                                            onChange={e => {
                                                                const newSelection = { ...(lot.economicSolvencyTypes || {}) };
                                                                if (e.target.checked) newSelection[opt.value] = true;
                                                                else delete newSelection[opt.value];
                                                                handleUpdateLot(lot.id, 'economicSolvencyTypes', newSelection);
                                                            }}
                                                            className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                                                        />
                                                        <span className="text-navy dark:text-light-gray text-sm">{opt.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {lot.economicSolvencyTypes?.other &&
                                                <Input
                                                    label={t('stage3.economicSolvencyOtherDetailsLabel')}
                                                    value={lot.economicSolvencyOtherDetails || ''}
                                                    onChange={(e) => handleUpdateLot(lot.id, 'economicSolvencyOtherDetails', e.target.value)}
                                                />
                                            }
                                            {Object.keys(lot.economicSolvencyTypes || {}).length > 0 &&
                                                <Input
                                                    label={t('stage3.economicSolvencyAmount')}
                                                    value={lot.economicSolvencyAmount || ''}
                                                    onChange={(e) => handleUpdateLot(lot.id, 'economicSolvencyAmount', e.target.value)}
                                                    endAdornment="€"
                                                    placeholder="900.287,89"
                                                />
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                     
                     <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-4">
                            <h4 className="font-semibold text-navy dark:text-white">{t('stage3.technicalSolvencyTitle')}</h4>
                            <div className="flex items-center gap-2">
                               <label className="text-sm font-medium text-navy/90 dark:text-light-gray/90">{t('stage3.technicalSolvencyApplication')}</label>
                               <YesNoToggle
                                    value={data.solvencyTechnicalPerLot}
                                    onChange={v => handleUpdate('solvencyTechnicalPerLot', v)}
                                    yesLabel={t('stage3.technicalSolvencyOptions.perLot')}
                                    noLabel={t('stage3.technicalSolvencyOptions.unique')}
                                />
                            </div>
                        </div>
                         <div className="mt-4 p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                            <h5 className="font-semibold text-navy dark:text-white mb-3">{t('stage3.technicalSolvencyCriteriaSelectionTitle')}</h5>
                            {!data.solvencyTechnicalPerLot ? (
                                <div className="space-y-3">
                                    {Object.entries(technicalSolvencyCriteriaOptions).map(([key, label]) => (
                                        <label key={key} className="flex items-start gap-3 cursor-pointer p-3 bg-white dark:bg-navy rounded-lg hover:bg-white/80">
                                            <input
                                                type="checkbox"
                                                checked={!!data.solvencyTechnicalCriteria?.[key]}
                                                onChange={e => {
                                                    const newSelection = { ...(data.solvencyTechnicalCriteria || {}) };
                                                    if (e.target.checked) newSelection[key] = true;
                                                    else delete newSelection[key];
                                                    handleUpdate('solvencyTechnicalCriteria', newSelection);
                                                }}
                                                className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                                            />
                                            {/* FIX: Cast label to string to resolve 'unknown' type error */}
                                            <span className="text-navy dark:text-light-gray text-sm">{label as string}</span>
                                        </label>
                                    ))}
                                    {data.solvencyTechnicalCriteria?.c9 && (
                                        <div className="pl-8 pt-2">
                                            <AIVersionedTextEditor document={{ versions: [{ id: 'v1', name: 'Version 1', content: data.solvencyTechnicalCriteriaOther || '', timestamp: ''}], activeVersionId: 'v1' }} onUpdate={doc => handleUpdate('solvencyTechnicalCriteriaOther', doc.versions.find(v => v.id === doc.activeVersionId)?.content || '')} rows={2} tenderData={tenderData} fieldIdentifier={t('stage3.technicalSolvencyCriteria.c9')} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(data.lots || []).map(lot => (
                                        <Accordion key={lot.id} title={lot.title || t('general.unspecified')} defaultOpen={false}>
                                             <div className="space-y-3">
                                                {Object.entries(technicalSolvencyCriteriaOptions).map(([key, label]) => (
                                                    <label key={key} className="flex items-start gap-3 cursor-pointer p-3 bg-light-gray dark:bg-dark-blue rounded-lg hover:bg-medium-gray/10">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!lot.technicalSolvencyCriteria?.[key]}
                                                            onChange={e => {
                                                                const newSelection = { ...(lot.technicalSolvencyCriteria || {}) };
                                                                if (e.target.checked) newSelection[key] = true;
                                                                else delete newSelection[key];
                                                                handleUpdateLot(lot.id, 'technicalSolvencyCriteria', newSelection);
                                                            }}
                                                            className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                                                        />
                                                        <span className="text-navy dark:text-light-gray text-sm">{label as string}</span>
                                                    </label>
                                                ))}
                                                {lot.technicalSolvencyCriteria?.c9 && (
                                                    <div className="pl-8 pt-2">
                                                        <AIVersionedTextEditor document={{ versions: [{ id: 'v1', name: 'Version 1', content: lot.technicalSolvencyCriteriaOther || '', timestamp: ''}], activeVersionId: 'v1' }} onUpdate={doc => handleUpdateLot(lot.id, 'technicalSolvencyCriteriaOther', doc.versions.find(v => v.id === doc.activeVersionId)?.content || '')} rows={2} tenderData={tenderData} fieldIdentifier={`${t('stage3.technicalSolvencyCriteria.c9')} - ${lot.title}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </Accordion>
                                    ))}
                                </div>
                            )}
                         </div>
                     </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.integrationExternalMeansToggle')}</label>
                        <YesNoToggle value={data.solvencyIntegrationExternalMeans} onChange={v => handleUpdate('solvencyIntegrationExternalMeans', v)} />
                        {data.solvencyIntegrationExternalMeans && (
                            <div className="mt-4 space-y-4">
                                <AIVersionedTextEditor
                                    label={t('stage3.integrationCriteriaLabel')}
                                    document={data.solvencyIntegrationCriteria || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                    onUpdate={doc => handleUpdate('solvencyIntegrationCriteria', doc)}
                                    placeholder={t('stage3.integrationCriteriaPlaceholder')}
                                    rows={4}
                                    tenderData={tenderData}
                                    fieldIdentifier={t('stage3.integrationCriteriaLabel')}
                                />
                                 <TextArea
                                    label={t('stage3.solvencyIntegrationCriteriaDetailsLabel')}
                                    value={data.solvencyIntegrationCriteriaDetails || ''}
                                    onChange={e => handleUpdate('solvencyIntegrationCriteriaDetails', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.materialPersonalResourcesDescription')}</label>
                        <YesNoToggle value={data.materialPersonalResources} onChange={v => handleUpdate('materialPersonalResources', v)} />
                         {data.materialPersonalResources && (
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                <AIVersionedTextEditor
                                    label={t('stage3.materialResourcesDetailsLabel')}
                                    document={data.materialResourcesDetails || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                    onUpdate={doc => handleUpdate('materialResourcesDetails', doc)}
                                    rows={4}
                                    tenderData={tenderData}
                                    fieldIdentifier={t('stage3.materialResourcesDetailsLabel')}
                                />
                                <AIVersionedTextEditor
                                    label={t('stage3.personalResourcesDetailsLabel')}
                                    document={data.personalResourcesDetails || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                    onUpdate={doc => handleUpdate('personalResourcesDetails', doc)}
                                    rows={4}
                                    tenderData={tenderData}
                                    fieldIdentifier={t('stage3.personalResourcesDetailsLabel')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <h4 className="font-semibold text-navy dark:text-white mb-2">{t('stage3.qualityStandardsAccreditationTitle')}</h4>
                        <div>
                           <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.qualityStandardsRequiredLabel')}</label>
                           <YesNoToggle value={data.qualityStandardsRequired} onChange={v => handleUpdate('qualityStandardsRequired', v)} />
                        </div>
                        {data.qualityStandardsRequired && (
                            <div className="mt-2 space-y-4">
                                <TextArea
                                    label={t('stage3.qualityStandardsDetailsLabel')}
                                    value={data.qualityStandardsDetails || ''}
                                    onChange={e => handleUpdate('qualityStandardsDetails', e.target.value)}
                                    placeholder={t('stage3.qualityStandardsAccreditationPlaceholder')}
                                    rows={4}
                                />
                                <TextArea
                                    label={t('stage3.qualityStandardsAccreditationDetailsLabel')}
                                    value={data.qualityStandardsAccreditationDetails || ''}
                                    onChange={e => handleUpdate('qualityStandardsAccreditationDetails', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 pt-4">
                        <h4 className="font-semibold text-navy dark:text-white">{t('stage3.nonHarmonizedCriteriaTitle')}</h4>
                        <div className="mt-2">
                             <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.nonHarmonizedCriteriaToggle')}</label>
                            <YesNoToggle value={data.nonHarmonizedCriteria} onChange={v => handleUpdate('nonHarmonizedCriteria', v)} />
                        </div>
                        {data.nonHarmonizedCriteria && (
                             <div className="mt-4 p-4 bg-light-gray dark:bg-dark-blue rounded-lg border border-medium-gray/20 dark:border-white/10">
                                <h5 className="font-semibold text-navy dark:text-white mb-3">{t('stage3.nonHarmonizedCriteriaSelectionTitle')}</h5>
                                 <div className="space-y-3">
                                    {Object.entries(nonHarmonizedCriteriaOptions).map(([key, label]) => (
                                        <label key={key} className="flex items-start gap-3 cursor-pointer p-3 bg-white dark:bg-navy rounded-lg hover:bg-white/80">
                                            <input
                                                type="checkbox"
                                                checked={!!data.nonHarmonizedCriteriaSelection?.[key]}
                                                onChange={e => {
                                                    const newSelection = { ...(data.nonHarmonizedCriteriaSelection || {}) };
                                                    if (e.target.checked) newSelection[key] = true;
                                                    else delete newSelection[key];
                                                    handleUpdate('nonHarmonizedCriteriaSelection', newSelection);
                                                }}
                                                className="h-4 w-4 mt-1 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                                            />
                                            {/* FIX: Cast label to string to resolve 'unknown' type error */}
                                            <span className="text-navy dark:text-light-gray text-sm">{label as string}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card title={t('stage3.abnormallyLowTendersTitle')}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.abnormallyLowTendersLabel')}</label>
                        <YesNoToggle value={data.abnormallyLowTenders} onChange={v => handleUpdate('abnormallyLowTenders', v)} />
                    </div>
                    {data.abnormallyLowTenders && (
                        <div>
                            <AIVersionedTextEditor
                                document={data.abnormallyLowTendersDetails || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                                onUpdate={doc => handleUpdate('abnormallyLowTendersDetails', doc)}
                                rows={5}
                                tenderData={tenderData}
                                fieldIdentifier={t('stage3.abnormallyLowTendersDetails')}
                            />
                        </div>
                    )}
                </div>
            </Card>

            <Card title={t('stage3.otherAwardDocumentationTitle')}>
                <AIVersionedTextEditor
                    document={data.otherAwardDocumentation || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                    onUpdate={doc => handleUpdate('otherAwardDocumentation', doc)}
                    rows={5}
                    tenderData={tenderData}
                    fieldIdentifier={t('stage3.otherAwardDocumentationTitle')}
                />
            </Card>

            <Card title={t('stage3.envelopesTitle')}>
                <div className="space-y-6">
                    <AIVersionedTextEditor
                        document={data.envelopeDocumentation_intro || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                        onUpdate={doc => handleUpdate('envelopeDocumentation_intro', doc)}
                        rows={4}
                        tenderData={tenderData}
                        fieldIdentifier={t('stage3.envelopesIntro')}
                    />
                    <Accordion title={t('stage3.envelopeATitle')} defaultOpen={true}>
                        <div className="space-y-4">
                             <TextArea
                                label={t('stage3.envelopeAPartA')}
                                value={data.envelopeDocumentation_A?.partA || ''}
                                onChange={e => handleUpdate('envelopeDocumentation_A', { ...data.envelopeDocumentation_A, partA: e.target.value })}
                                rows={4}
                                placeholder={t('stage3.envelopeAPartAPlaceholder')}
                            />
                        </div>
                    </Accordion>
                    <Accordion title={t('stage3.envelopeBTitle')} defaultOpen={true}>
                        <div className="space-y-4">
                            {(data.envelopeDocumentation_B || []).map((lot, index) => (
                                <div key={lot.id} className="p-3 bg-light-gray dark:bg-dark-blue rounded-md border border-medium-gray/30 dark:border-white/20 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={lot.title}
                                            onChange={(e) => handleUpdateEnvelopeBLot(lot.id, 'title', e.target.value)}
                                            placeholder={t('stage3.envelopeBLotTitlePlaceholder')}
                                            className="flex-grow font-semibold"
                                        />
                                        <button onClick={() => handleRemoveEnvelopeBLot(lot.id)} className="p-2 rounded-md hover:bg-white dark:hover:bg-navy text-medium-gray hover:text-accent" aria-label={`Remove lot ${index + 1}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <TextArea
                                        value={lot.criteria}
                                        onChange={(e) => handleUpdateEnvelopeBLot(lot.id, 'criteria', e.target.value)}
                                        placeholder={t('stage3.envelopeBLotCriteriaPlaceholder')}
                                        rows={6}
                                    />
                                </div>
                            ))}
                            <Button variant="secondary" size="sm" onClick={handleAddEnvelopeBLot}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                {t('stage3.addEnvelopeBLot')}
                            </Button>
                        </div>
                    </Accordion>
                    <Accordion title={t('stage3.envelopeCTitle')} defaultOpen={true}>
                        <div className="space-y-4">
                            {(data.envelopeDocumentation_C || []).map((lot, index) => (
                                <div key={lot.id} className="p-3 bg-light-gray dark:bg-dark-blue rounded-md border border-medium-gray/30 dark:border-white/20 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={lot.title}
                                            onChange={(e) => handleUpdateEnvelopeCLot(lot.id, 'title', e.target.value)}
                                            placeholder={t('stage3.envelopeBLotTitlePlaceholder')}
                                            className="flex-grow font-semibold"
                                        />
                                        <button onClick={() => handleRemoveEnvelopeCLot(lot.id)} className="p-2 rounded-md hover:bg-white dark:hover:bg-navy text-medium-gray hover:text-accent" aria-label={`Remove item ${index + 1}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <TextArea
                                        value={lot.criteria}
                                        onChange={(e) => handleUpdateEnvelopeCLot(lot.id, 'criteria', e.target.value)}
                                        placeholder={t('stage3.envelopeBLotCriteriaPlaceholder')}
                                        rows={6}
                                    />
                                </div>
                            ))}
                            <Button variant="secondary" size="sm" onClick={handleAddEnvelopeCLot}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                {t('stage3.addEnvelopeCLot')}
                            </Button>
                        </div>
                    </Accordion>
                </div>
            </Card>

            <Card title={t('stage3.executionConditionsTitle')}>
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_ethicalPrinciples} 
                            onChange={(e) => handleUpdate('executionConditions_ethicalPrinciples', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditionsEthicalPrinciples')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_environmentalSocial} 
                            onChange={(e) => handleUpdate('executionConditions_environmentalSocial', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditionsEnvironmentalSocial')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_genderPerspective} 
                            onChange={(e) => handleUpdate('executionConditions_genderPerspective', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditionsGenderPerspective')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_communicationDesign} 
                            onChange={(e) => handleUpdate('executionConditions_communicationDesign', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditionsCommunicationDesign')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_dataProtection} 
                            onChange={(e) => handleUpdate('executionConditions_dataProtection', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditions_dataProtection')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_labor} 
                            onChange={(e) => handleUpdate('executionConditions_labor', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditions_labor')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_ute} 
                            onChange={(e) => handleUpdate('executionConditions_ute', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditions_ute')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-light-gray dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue/80 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!data.executionConditions_healthAndSafety} 
                            onChange={(e) => handleUpdate('executionConditions_healthAndSafety', e.target.checked)} 
                            className="h-5 w-5 mt-0.5 rounded border-medium-gray/50 text-primary focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-navy dark:text-light-gray text-sm">{t('stage3.executionConditions_healthAndSafety')}</span>
                    </label>
                </div>
            </Card>

            <Card title={t('stage3.workProgramTitle')}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.workProgramLabel')}</label>
                        <YesNoToggle value={data.workProgramRequired} onChange={v => handleUpdate('workProgramRequired', v)} />
                    </div>
                    <Input
                        label={t('stage3.promotingUnitLabel')}
                        value={data.promotingUnit || ''}
                        onChange={e => handleUpdate('promotingUnit', e.target.value)}
                    />
                 </div>
                 {data.workProgramRequired && (
                    <div className="mt-4">
                        <AIVersionedTextEditor
                            label={t('stage3.workProgramDetailsLabel')}
                            document={data.workProgramDetails || { versions: [{ id: 'v1', name: 'Version 1', content: '', timestamp: ''}], activeVersionId: 'v1' }}
                            onUpdate={doc => handleUpdate('workProgramDetails', doc)}
                            rows={4}
                            placeholder={t('stage3.workProgramDetailsPlaceholder')}
                            tenderData={tenderData}
                            fieldIdentifier={t('stage3.workProgramDetailsLabel')}
                        />
                    </div>
                 )}
            </Card>

            <Card title={t('stage3.facilityVisitTitle')}>
                <div>
                    <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{t('stage3.facilityVisitLabel')}</label>
                    <YesNoToggle value={data.facilityVisitRequired} onChange={v => handleUpdate('facilityVisitRequired', v)} />
                </div>
            </Card>

        </div>
    );
};

const PPTDataForm: React.FC<{
    data: PPTData;
    updateData: (data: Partial<PPTData>) => void;
    tenderData: TenderData;
}> = ({ data, updateData, tenderData }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-2">
            <Accordion title={t('pptForm.object')}>
                <AIVersionedTextEditor
                    document={data.object}
                    onUpdate={(doc) => updateData({ object: doc })}
                    rows={2}
                    placeholder={`${t('general.edit')} ${t('pptForm.object').toLowerCase()}...`}
                    tenderData={tenderData}
                    fieldIdentifier={`${t('stage3.tabs.ppt')} - ${t('pptForm.object')}`}
                />
            </Accordion>
            <Accordion title={t('pptForm.serviceDescription')}>
                <div className="space-y-4">
                    <AIVersionedTextEditor
                        label={t('pptForm.serviceDescription_description')}
                        document={data.serviceDescription.description}
                        onUpdate={doc => updateData({ serviceDescription: { ...data.serviceDescription, description: doc }})}
                        rows={4}
                        tenderData={tenderData}
                        fieldIdentifier={`${t('stage3.tabs.ppt')} - ${t('pptForm.serviceDescription_description')}`}
                    />
                    <TextArea
                        label={t('pptForm.serviceDescription_technicalParams')}
                        value={data.serviceDescription.technicalParams}
                        onChange={(e) => updateData({ serviceDescription: { ...data.serviceDescription, technicalParams: e.target.value }})}
                        rows={3}
                    />
                </div>
            </Accordion>
             <Accordion title={t('pptForm.scope')}>
                <AIVersionedTextEditor
                    document={data.scope}
                    onUpdate={doc => updateData({ scope: doc })}
                    rows={3}
                    placeholder={`${t('general.edit')} ${t('pptForm.scope').toLowerCase()}...`}
                    tenderData={tenderData}
                    fieldIdentifier={`${t('stage3.tabs.ppt')} - ${t('pptForm.scope')}`}
                />
            </Accordion>
            <Accordion title={t('pptForm.infoSystem')}>
                <AIVersionedTextEditor
                    document={data.infoSystem}
                    onUpdate={doc => updateData({ infoSystem: doc })}
                    rows={3}
                    placeholder={`${t('general.edit')} ${t('pptForm.infoSystem').toLowerCase()}...`}
                    tenderData={tenderData}
                    fieldIdentifier={`${t('stage3.tabs.ppt')} - ${t('pptForm.infoSystem')}`}
                />
            </Accordion>
            <Accordion title={t('pptForm.personnelResources')}>
                <AIVersionedTextEditor
                    document={data.personnelResources}
                    onUpdate={doc => updateData({ personnelResources: doc })}
                    rows={3}
                    placeholder={`${t('general.edit')} ${t('pptForm.personnelResources').toLowerCase()}...`}
                    tenderData={tenderData}
                    fieldIdentifier={`${t('stage3.tabs.ppt')} - ${t('pptForm.personnelResources')}`}
                />
            </Accordion>
            <Accordion title={t('pptForm.materialResources')}>
                <AIVersionedTextEditor
                    document={data.materialResources}
                    onUpdate={doc => updateData({ materialResources: doc })}
                    rows={3}
                    placeholder={`${t('general.edit')} ${t('pptForm.materialResources').toLowerCase()}...`}
                    tenderData={tenderData}
                    fieldIdentifier={`${t('stage3.tabs.ppt')} - ${t('pptForm.materialResources')}`}
                />
            </Accordion>
            <Accordion title={t('pptForm.personnelSubrogation')}>
                <TextArea
                    value={data.personnelSubrogation}
                    onChange={(e) => updateData({ personnelSubrogation: e.target.value })}
                    rows={2}
                    placeholder={`${t('general.edit')} ${t('pptForm.personnelSubrogation').toLowerCase()}...`}
                />
            </Accordion>
            <Accordion title={t('pptForm.serviceTransition')}>
                 <TextArea
                    label={t('pptForm.serviceTransition_plan')}
                    value={data.serviceTransition.plan}
                    onChange={(e) => updateData({ serviceTransition: { ...data.serviceTransition, plan: e.target.value }})}
                    rows={3}
                />
            </Accordion>
            <Accordion title={t('pptForm.companyObligations')}>
                <div className="space-y-4">
                    <TextArea
                        label={t('pptForm.companyObligations_service')}
                        value={data.companyObligations.service}
                        onChange={(e) => updateData({ companyObligations: { ...data.companyObligations, service: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.companyObligations_regulatory')}
                        value={data.companyObligations.regulatory}
                        onChange={(e) => updateData({ companyObligations: { ...data.companyObligations, regulatory: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.companyObligations_qualityCerts')}
                        value={data.companyObligations.qualityCerts}
                        onChange={(e) => updateData({ companyObligations: { ...data.companyObligations, qualityCerts: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.companyObligations_other')}
                        value={data.companyObligations.other}
                        onChange={(e) => updateData({ companyObligations: { ...data.companyObligations, other: e.target.value }})}
                        rows={3}
                    />
                </div>
            </Accordion>
             <Accordion title={t('pptForm.penalties')}>
                <div className="space-y-4">
                    <TextArea
                        label={t('pptForm.penalties_serious')}
                        value={data.penalties.serious}
                        onChange={(e) => updateData({ penalties: { ...data.penalties, serious: e.target.value }})}
                        rows={3}
                    />
                    <TextArea
                        label={t('pptForm.penalties_minor')}
                        value={data.penalties.minor}
                        onChange={(e) => updateData({ penalties: { ...data.penalties, minor: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.penalties_other')}
                        value={data.penalties.other}
                        onChange={(e) => updateData({ penalties: { ...data.penalties, other: e.target.value }})}
                        rows={3}
                    />
                </div>
            </Accordion>
            <Accordion title={t('pptForm.liabilityInsurance')}>
                <TextArea
                    value={data.liabilityInsurance}
                    onChange={(e) => updateData({ liabilityInsurance: e.target.value })}
                    rows={2}
                    placeholder={`${t('general.edit')} ${t('pptForm.liabilityInsurance').toLowerCase()}...`}
                />
            </Accordion>
            <Accordion title={t('pptForm.maintenance')}>
                <div className="space-y-4">
                     <TextArea
                        label={t('pptForm.maintenance_preventive')}
                        value={data.maintenance.preventive}
                        onChange={(e) => updateData({ maintenance: { ...data.maintenance, preventive: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.maintenance_corrective')}
                        value={data.maintenance.corrective}
                        onChange={(e) => updateData({ maintenance: { ...data.maintenance, corrective: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.maintenance_normative')}
                        value={data.maintenance.normative}
                        onChange={(e) => updateData({ maintenance: { ...data.maintenance, normative: e.target.value }})}
                        rows={3}
                    />
                     <TextArea
                        label={t('pptForm.maintenance_wasteManagement')}
                        value={data.maintenance.wasteManagement}
                        onChange={(e) => updateData({ maintenance: { ...data.maintenance, wasteManagement: e.target.value }})}
                        rows={3}
                    />
                </div>
            </Accordion>
            <Accordion title={t('pptForm.sla')}>
                <TextArea
                    value={data.sla}
                    onChange={(e) => updateData({ sla: e.target.value })}
                    rows={3}
                    placeholder={`${t('general.edit')} ${t('pptForm.sla').toLowerCase()}...`}
                />
            </Accordion>
             <Accordion title={t('pptForm.riskPrevention')}>
                <TextArea
                    value={data.riskPrevention}
                    onChange={(e) => updateData({ riskPrevention: e.target.value })}
                    rows={3}
                    placeholder={`${t('general.edit')} ${t('pptForm.riskPrevention').toLowerCase()}...`}
                />
            </Accordion>
        </div>
    );
}


const Stage4Drafting: React.FC<Stage4DraftingProps> = ({ onComplete, onBack, data, updateData, tenderData, onNavigateToStage }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('characteristics');

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'characteristics', label: t('stage3.tabs.characteristics') },
    { id: 'pcap', label: t('stage3.tabs.pcap') },
  ];

  const activeDocument: VersionedDocument | undefined = useMemo(() => 
    (activeTab === 'pcap' || activeTab === 'characteristics') ? data[activeTab] : undefined,
    [activeTab, data]
  );
  
  const activeVersion = useMemo(() => 
    activeDocument?.versions.find(v => v.id === activeDocument.activeVersionId),
    [activeDocument]
  );

  const handleContentChange = (content: string) => {
    if (!activeVersion || !activeDocument) return;
    
    const updatedVersions = activeDocument.versions.map(v => 
        v.id === activeVersion.id ? { ...v, content } : v
    );
    
    updateData({
        [activeTab]: { ...activeDocument, versions: updatedVersions }
    });
  };

  const handleSelectVersion = (versionId: string) => {
    if (!activeDocument) return;
    updateData({
        [activeTab]: { ...activeDocument, activeVersionId: versionId }
    });
  };
  
  const handleNewVersion = () => {
    if (!activeDocument) return;
    const newVersionNumber = activeDocument.versions.length + 1;
    const newVersion: DocumentVersion = {
        id: `v_${activeTab}_${Date.now()}`,
        name: `Versión ${newVersionNumber}`,
        content: activeVersion?.content || '',
        timestamp: new Date().toISOString(),
    };
    
    const updatedVersions = [...activeDocument.versions, newVersion];

    updateData({
        [activeTab]: {
            versions: updatedVersions,
            activeVersionId: newVersion.id,
        }
    });
    showToast(t('stage3.versionCreatedSuccess'), 'success');
  };

  return (
    <div>
        {data.characteristicsData && 
            <CharacteristicsDataForm 
                data={data.characteristicsData}
                updateData={(d) => updateData({ characteristicsData: { ...data.characteristicsData, ...d } })} 
                vatRate={tenderData.stage2.creditCertificate.vatRate}
                onNavigateToStage={onNavigateToStage}
                tenderData={tenderData}
            />
        }
        
        <div className="border-t border-medium-gray/20 dark:border-white/10 mt-12 pt-8">
            <h2 className="text-2xl font-bold text-navy dark:text-white text-center mb-8">{t('stage3.tabs.ppt')}</h2>
            {data.pptData && (
                <PPTDataForm 
                    data={data.pptData}
                    updateData={(d) => updateData({ pptData: {...data.pptData, ...d}})}
                    tenderData={tenderData}
                />
            )}
        </div>
        
        <div className="border-t border-medium-gray/20 dark:border-white/10 pt-8 mt-12">
            <h2 className="text-2xl font-bold text-navy dark:text-white text-center mb-8">{t('stage3.draftsTitle')}</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4">
                    <nav className="space-y-2">
                    {tabs.map(tab => (
                        <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === tab.id
                            ? 'bg-primary text-white'
                            : 'bg-light-gray dark:bg-dark-blue text-navy dark:text-light-gray hover:bg-medium-gray/20 dark:hover:bg-white/5'
                        }`}
                        >
                        {tab.label}
                        </button>
                    ))}
                    </nav>
                </aside>

                <main className="flex-1">
                    <div className="bg-white dark:bg-navy p-6 rounded-xl shadow-md border border-medium-gray/20 dark:border-white/10">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <h3 className="text-xl font-bold text-navy dark:text-white">{tabs.find(t => t.id === activeTab)?.label}</h3>
                            
                           {activeDocument && (
                             <div className="flex items-center gap-3 bg-light-gray dark:bg-dark-blue p-2 rounded-lg border border-medium-gray/20 dark:border-white/10">
                                 <label htmlFor="version-select" className="text-sm font-medium text-navy/80 dark:text-light-gray/80 whitespace-nowrap">{t('general.version')}:</label>
                                 <select
                                     id="version-select"
                                     value={activeDocument.activeVersionId || ''}
                                     onChange={(e) => handleSelectVersion(e.target.value)}
                                     className="block w-full pl-3 pr-8 py-1.5 border-medium-gray/30 bg-white dark:bg-navy dark:border-medium-gray/70 focus:outline-none focus:ring-primary focus:border-primary rounded-md text-sm"
                                 >
                                     {activeDocument.versions.map((v) => (
                                         <option key={v.id} value={v.id}>{v.name}</option>
                                     ))}
                                 </select>
                                 <Button onClick={handleNewVersion} variant="secondary" size="sm" className="whitespace-nowrap">
                                     <PlusIcon className="w-4 h-4 mr-1"/>
                                     {t('general.newVersion')}
                                 </Button>
                             </div>
                           )}
                        </div>
                    
                        {(activeTab === 'pcap' || activeTab === 'characteristics') && activeVersion && (
                            <TextArea
                                value={activeVersion.content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                rows={20}
                                placeholder={t('stage3.editorPlaceholder', tabs.find(t => t.id === activeTab)?.label || '')}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>

        <div className="mt-10 border-t border-medium-gray/20 dark:border-white/10 pt-6 flex justify-between items-center">
            <Button variant="secondary" onClick={onBack}>
            {t('general.back')}
            </Button>
            <Button onClick={onComplete}>{t('stage3.continue')}</Button>
        </div>
    </div>
  );
};

// FIX: Add default export to fix import error in App.tsx
export default Stage4Drafting;
