import React from 'react';
import type { TenderProcess, VersionedDocument } from '../types';
import Modal from './common/Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface TenderSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tender: TenderProcess | null;
}

const getActiveVersionContent = (doc: VersionedDocument | undefined | string): string => {
    if (!doc) return '-';
    if (typeof doc === 'string') return doc; // For legacy or non-versioned fields
    const activeVersion = doc.versions.find(v => v.id === doc.activeVersionId);
    return activeVersion?.content || '';
};

const SummarySection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-6 bg-white dark:bg-dark-blue p-4 rounded-lg border border-medium-gray/20 dark:border-white/10">
        <h3 className="text-lg font-semibold text-navy dark:text-white border-b border-medium-gray/20 dark:border-white/10 pb-2 mb-3">{title}</h3>
        <div className="space-y-2 text-sm text-navy/90 dark:text-light-gray/90">{children}</div>
    </div>
);

const SummaryField: React.FC<{label: string; value?: React.ReactNode}> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-1">
        <dt className="font-medium text-medium-gray">{label}</dt>
        <dd className="col-span-2">{value || '-'}</dd>
    </div>
);

// FIX: Made label prop optional to handle cases where only a value is displayed.
const LongTextField: React.FC<{label?: string; value?: string}> = ({ label, value }) => {
    const { t } = useLanguage();
    return (
        <div>
            {label && <dt className="font-medium text-medium-gray py-1">{label}</dt>}
            <dd className="mt-1 p-2 bg-light-gray dark:bg-navy rounded-md whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">{value || t('general.unspecified')}</dd>
        </div>
    );
};


const TenderSummaryModal: React.FC<TenderSummaryModalProps> = ({ isOpen, onClose, tender }) => {
    const { t } = useLanguage();

    if (!tender) return null;

    const { tenderData: data } = tender;
    const characteristics = data.stage3.characteristicsData;

    const renderCriteriaList = (criteria: { [key: string]: boolean } | undefined, otherText: string | undefined, translationKey: string) => {
        if (!criteria) return '-';
        const selected = Object.keys(criteria).filter(key => criteria[key]);
        if (selected.length === 0 && !otherText) return '-';

        return (
            <ul className="list-disc list-inside space-y-1">
                {selected.map(key => (
                    <li key={key}>{t(`${translationKey}.${key}`)}</li>
                ))}
                {otherText && <li>{otherText}</li>}
            </ul>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('app.summaryTitle')}>
            <div className="p-2">
                <h2 className="text-2xl font-bold text-primary mb-4">{tender.name}</h2>
                
                {/* Stage 1 */}
                <SummarySection title={t('tenderSummary.stage1Title')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <SummaryField label={t('tenderSummary.expedientNumber')} value={data.stage1.expedientNumber} />
                        <SummaryField label={t('tenderSummary.needs')} value={getActiveVersionContent(data.stage1.needs)} />
                        <SummaryField label={t('tenderSummary.initialDuration')} value={data.stage1.initialDuration} />
                        <SummaryField label={t('tenderSummary.infoSystemName')} value={data.stage1.infoSystemName} />
                    </div>
                </SummarySection>

                {/* Stage 2 */}
                <SummarySection title={t('tenderSummary.stage2Title')}>
                    <LongTextField label={t('tenderSummary.background')} value={getActiveVersionContent(data.stage2.necessityReport.background)}/>
                    <LongTextField label={t('tenderSummary.valueJudgmentCriteria')} value={getActiveVersionContent(data.stage2.necessityReport.evaluationCriteria.valueJudgment)}/>
                    <LongTextField label={t('tenderSummary.quantifiableCriteria')} value={data.stage2.necessityReport.evaluationCriteria.quantifiable}/>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <SummaryField label={t('tenderSummary.budgetItem')} value={data.stage2.creditCertificate.budgetItem} />
                        <SummaryField label={t('tenderSummary.basePrice')} value={`${data.stage2.creditCertificate.basePrice} €`} />
                     </div>
                </SummarySection>


                {/* Stage 3 */}
                <SummarySection title={t('tenderSummary.stage3Title')}>
                    <LongTextField label={t('tenderSummary.justification')} value={data.stage3.justificationText}/>
                     <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <SummaryField label={t('tenderSummary.multiYearSupply')} value={characteristics?.multiYearSupply ? t(`stage3.lotDivisionOptions.${characteristics.multiYearSupply}`) : '-'} />
                        <SummaryField label={t('tenderSummary.anticipatedExpenditure')} value={characteristics?.anticipatedExpenditure === null ? '-' : (characteristics?.anticipatedExpenditure ? t('general.yes') : t('general.no'))} />
                        
                        {(characteristics?.annuities?.length || 0) > 0 && (
                            <div>
                                <dt className="font-medium text-medium-gray py-1">{t('tenderSummary.annuities')}</dt>
                                <dd className="mt-1 p-2 bg-light-gray dark:bg-navy rounded-md text-sm">
                                    <table className="w-full text-left table-auto">
                                        <thead>
                                            <tr className="border-b border-medium-gray/20 dark:border-white/10">
                                                <th className="py-1 font-semibold">{t('stage3.annuityYear')}</th>
                                                <th className="py-1 font-semibold">{t('stage3.annuityMonths')}</th>
                                                <th className="py-1 font-semibold text-right">{t('stage3.annuityAmount')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {characteristics?.annuities?.map(a => (
                                                <tr key={a.id}>
                                                    <td className="py-1">{a.year}</td>
                                                    <td className="py-1">{a.months}</td>
                                                    <td className="py-1 text-right">{a.amount} €</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </dd>
                            </div>
                        )}
                     </div>

                    {characteristics?.lotDivision === 'yes' && (
                        <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                            <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.lotBiddingOptionsTitle')}</h4>
                            <SummaryField label={t('tenderSummary.allLotsMandatory')} value={characteristics?.allLotsMandatory ? t('general.yes') : t('general.no')} />
                            <SummaryField label={t('tenderSummary.canBidOnOneOrAllLots')} value={characteristics?.canBidOnOneOrAllLots ? t('general.yes') : t('general.no')} />
                            <SummaryField label={t('tenderSummary.mustBidOnFullLots')} value={characteristics?.mustBidOnFullLots ? t('general.yes') : t('general.no')} />
                            
                            <div className="py-1">
                                <dt className="font-medium text-medium-gray">{t('tenderSummary.minLotsToBidRequired')}</dt>
                                <dd className="mt-1">
                                    {characteristics?.minLotsToBidRequired ? `${t('general.yes')} - ${t('tenderSummary.minLotsToBidCount')}: ${characteristics.minLotsToBidCount || '-'}` : t('general.no')}
                                    {characteristics?.minLotsToBidRequired && characteristics.minLotsToBidSelection && Object.keys(characteristics.minLotsToBidSelection).length > 0 && (
                                        <div className="mt-1 pl-4 text-xs">
                                            <p className="font-semibold">{t('tenderSummary.applicableLots')}:</p>
                                            <ul className="list-disc list-inside">
                                                {characteristics.lots?.filter(l => characteristics.minLotsToBidSelection?.[l.id]).map(l => <li key={l.id}>{l.title}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </dd>
                            </div>

                            <div className="py-1">
                                <dt className="font-medium text-medium-gray">{t('tenderSummary.mandatoryLotsToBid')}</dt>
                                <dd className="mt-1">
                                    {characteristics?.mandatoryLotsToBid ? t('general.yes') : t('general.no')}
                                    {characteristics?.mandatoryLotsToBid && characteristics.mandatoryLotsToBidSelection && Object.keys(characteristics.mandatoryLotsToBidSelection).length > 0 && (
                                        <div className="mt-1 pl-4 text-xs">
                                            <p className="font-semibold">{t('tenderSummary.applicableLots')}:</p>
                                            <ul className="list-disc list-inside">
                                                {characteristics.lots?.filter(l => characteristics.mandatoryLotsToBidSelection?.[l.id]).map(l => <li key={l.id}>{l.title}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </dd>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.durationAndVariantsTitle')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <SummaryField label={t('tenderSummary.estimatedStartDate')} value={characteristics?.estimatedStartDate} />
                            <SummaryField label={t('tenderSummary.contractDurationTerm')} value={characteristics?.contractDuration} />
                            <SummaryField label={t('tenderSummary.partialTerms')} value={characteristics?.partialTerms ? t(`general.yes`) : t('general.no')} />
                            <SummaryField label={t('tenderSummary.extensionsPossible')} value={characteristics?.extensionsPossible ? t(`general.yes`) : t('general.no')} />
                            {characteristics?.extensionsPossible && (
                                <>
                                    <SummaryField label={t('tenderSummary.extensionsCount')} value={characteristics?.extensionsCount} />
                                    <SummaryField label={t('tenderSummary.extensionDuration')} value={characteristics?.extensionDuration} />
                                </>
                            )}
                            <SummaryField label={t('tenderSummary.variantsAdmission')} value={characteristics?.variantsAdmission ? t('general.yes') : t('general.no')} />
                        </div>
                    </div>
                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.procedureTitle')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                             <SummaryField label={t('tenderSummary.procedureType')} value={characteristics?.procedure} />
                             <SummaryField label={t('tenderSummary.processingType')} value={characteristics?.processingType} />
                             <SummaryField label={t('tenderSummary.harmonizedRegulation')} value={characteristics?.harmonizedRegulation ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.priorNotice')} value={characteristics?.priorNotice ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.digitalEnvelope')} value={characteristics?.digitalEnvelope ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.electronicAuction')} value={characteristics?.electronicAuction ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.maxProposalDate')} value={characteristics?.maxProposalDate} />
                             <SummaryField label={t('tenderSummary.samplesDelivery')} value={characteristics?.samplesDelivery ? t(`stage3.lotDivisionOptions.${characteristics.samplesDelivery}`) : '-'} />
                        </div>
                    </div>
                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.guaranteesAndReviewTitle')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                             <SummaryField label={t('tenderSummary.provisionalGuarantee')} value={characteristics?.provisionalGuarantee ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.definitiveGuarantee')} value={characteristics?.definitiveGuarantee ? t('general.yes') : t('general.no')} />
                             {characteristics?.definitiveGuarantee && (
                                <SummaryField label={t('tenderSummary.definitiveGuaranteeDetails')} value={characteristics?.definitiveGuaranteeDetails} />
                             )}
                             <SummaryField label={t('tenderSummary.complementaryGuarantee')} value={characteristics?.complementaryGuarantee ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.guaranteeTerm')} value={characteristics?.guaranteeTerm ? t('general.yes') : t('general.no')} />
                             <SummaryField label={t('tenderSummary.priceReview')} value={characteristics?.priceReview ? t('general.yes') : t('general.no')} />
                        </div>
                    </div>
                </SummarySection>

                <SummarySection title={t('tenderSummary.subcontractingAndAssignmentTitle')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <SummaryField label={t('tenderSummary.subcontracting')} value={characteristics?.subcontracting ? t('general.yes') : t('general.no')} />
                        <SummaryField label={t('tenderSummary.assignment')} value={characteristics?.assignment ? t('general.yes') : t('general.no')} />
                    </div>
                    {characteristics?.subcontractingDetails && <LongTextField label={t('tenderSummary.subcontractingDetails')} value={getActiveVersionContent(characteristics.subcontractingDetails)} />}
                    {characteristics?.assignmentDetails && <LongTextField label={t('tenderSummary.assignmentDetails')} value={getActiveVersionContent(characteristics.assignmentDetails)} />}
                </SummarySection>

                <SummarySection title={t('tenderSummary.solvencyTitle')}>
                    <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.classification')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 mb-4">
                        <SummaryField label={t('tenderSummary.solvencyCategory')} value={characteristics?.solvencyClassificationCategory} />
                        <SummaryField label={t('tenderSummary.solvencyGroup')} value={characteristics?.solvencyClassificationGroup} />
                        <SummaryField label={t('tenderSummary.solvencySubgroup')} value={characteristics?.solvencyClassificationSubgroup} />
                    </div>
                    
                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.economicSolvency')}</h4>
                        { (characteristics?.lots?.length || 0) > 0 && characteristics?.solvencyEconomicPerLot ? (
                                characteristics?.lots?.map(lot => {
                                    const lotTypes = lot.economicSolvencyTypes ?
                                        Object.keys(lot.economicSolvencyTypes)
                                            .filter(key => lot.economicSolvencyTypes?.[key])
                                            .map(key => t(`stage3.economicSolvencyTypes.${key}`))
                                            .join(', ')
                                        : '';
                                    return <SummaryField key={lot.id} label={lot.title} value={`${lot.economicSolvencyAmount || '0'} € (${lotTypes})`} />
                                })
                            ) :  (() => {
                                const economicSolvencyTypes = characteristics?.economicSolvencyTypes ?
                                    Object.keys(characteristics.economicSolvencyTypes)
                                        .filter(key => characteristics.economicSolvencyTypes?.[key])
                                        .map(key => t(`stage3.economicSolvencyTypes.${key}`))
                                        .join(', ')
                                    : '';
                                return economicSolvencyTypes ?
                                    <SummaryField label={economicSolvencyTypes} value={`${characteristics?.economicSolvencyAmount || '0'} €`} />
                                    : <p className="text-sm text-medium-gray">{t('general.unspecified')}</p>
                            })()
                        }
                    </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <h4 className="font-semibold text-md text-navy dark:text-white mb-2">{t('tenderSummary.technicalSolvency')}</h4>
                        { (characteristics?.lots?.length || 0) > 0 && characteristics?.solvencyTechnicalPerLot ? (
                                characteristics?.lots?.map(lot => (
                                    <div key={lot.id} className="py-2">
                                        <p className="font-semibold text-navy dark:text-white">{lot.title || t('general.unspecified')}</p>
                                        {renderCriteriaList(lot.technicalSolvencyCriteria, lot.technicalSolvencyCriteriaOther, 'stage3.technicalSolvencyCriteria')}
                                    </div>
                                ))
                            ) : renderCriteriaList(characteristics?.solvencyTechnicalCriteria, characteristics?.solvencyTechnicalCriteriaOther, 'stage3.technicalSolvencyCriteria')
                        }
                    </div>

                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <SummaryField label={t('tenderSummary.integrationExternalMeans')} value={characteristics?.solvencyIntegrationExternalMeans ? t('general.yes') : t('general.no')} />
                        {characteristics?.solvencyIntegrationExternalMeans && (
                            <>
                                <LongTextField label={t('stage3.integrationCriteriaLabel')} value={getActiveVersionContent(characteristics.solvencyIntegrationCriteria)} />
                                <LongTextField label={t('stage3.solvencyIntegrationCriteriaDetailsLabel')} value={characteristics.solvencyIntegrationCriteriaDetails} />
                            </>
                        )}
                    </div>
                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <SummaryField label={t('tenderSummary.materialPersonalResourcesDescription')} value={characteristics?.materialPersonalResources === null ? '-' : (characteristics?.materialPersonalResources ? t('general.yes') : t('general.no'))} />
                        {characteristics?.materialPersonalResources && (
                            <>
                                <LongTextField label={t('tenderSummary.materialResources')} value={getActiveVersionContent(characteristics.materialResourcesDetails)} />
                                <LongTextField label={t('stage3.materialResourcesAdscriptionDetailsLabel')} value={characteristics.materialResourcesAdscriptionDetails} />
                                <LongTextField label={t('tenderSummary.personalResources')} value={getActiveVersionContent(characteristics.personalResourcesDetails)} />
                            </>
                        )}
                    </div>
                    <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <SummaryField label={t('stage3.qualityStandardsRequiredLabel')} value={characteristics?.qualityStandardsRequired === null ? '-' : (characteristics?.qualityStandardsRequired ? t('general.yes') : t('general.no'))} />
                        {characteristics?.qualityStandardsRequired && (
                             <>
                                <LongTextField label={t('stage3.qualityStandardsDetailsLabel')} value={characteristics?.qualityStandardsDetails} />
                                <LongTextField label={t('stage3.qualityStandardsAccreditationDetailsLabel')} value={characteristics?.qualityStandardsAccreditationDetails} />
                            </>
                        )}
                    </div>
                     <div className="border-t border-medium-gray/20 dark:border-white/10 mt-4 pt-4">
                        <SummaryField label={t('tenderSummary.nonHarmonizedCriteria')} value={characteristics?.nonHarmonizedCriteria ? t('general.yes') : t('general.no')} />
                        {characteristics?.nonHarmonizedCriteria && (
                           <div className="py-2">
                               {renderCriteriaList(characteristics.nonHarmonizedCriteriaSelection, undefined, 'stage3.nonHarmonizedCriteria')}
                           </div>
                        )}
                    </div>
                </SummarySection>

                <SummarySection title={t('tenderSummary.abnormallyLowTendersTitle')}>
                    <SummaryField label={t('stage3.abnormallyLowTendersLabel')} value={characteristics?.abnormallyLowTenders === null ? '-' : (characteristics?.abnormallyLowTenders ? t('general.yes') : t('general.no'))} />
                    {characteristics?.abnormallyLowTenders && (
                        <LongTextField value={getActiveVersionContent(characteristics.abnormallyLowTendersDetails)} />
                    )}
                </SummarySection>

                {characteristics?.otherAwardDocumentation && (
                    <SummarySection title={t('tenderSummary.otherAwardDocumentationTitle')}>
                        <p className="whitespace-pre-wrap text-sm">{getActiveVersionContent(characteristics.otherAwardDocumentation)}</p>
                    </SummarySection>
                )}

                <SummarySection title={t('tenderSummary.envelopesTitle')}>
                    {characteristics?.envelopeDocumentation_intro && (
                        // FIX: Added missing label prop.
                        <LongTextField label={t('tenderSummary.envelopesIntro')} value={getActiveVersionContent(characteristics.envelopeDocumentation_intro)} />
                    )}
                    {characteristics?.envelopeDocumentation_A && (
                       <LongTextField label={t('tenderSummary.envelopeAPartA')} value={characteristics.envelopeDocumentation_A.partA} />
                    )}
                    {characteristics?.envelopeDocumentation_B && characteristics.envelopeDocumentation_B.length > 0 && (
                        <div className="py-1">
                            <dt className="font-medium text-medium-gray">{t('tenderSummary.envelopeB')}</dt>
                            <dd className="mt-1 space-y-3">
                                {characteristics.envelopeDocumentation_B.map(lot => (
                                    <div key={lot.id} className="p-3 bg-light-gray dark:bg-navy rounded-md border border-medium-gray/20 dark:border-white/10">
                                        <p className="font-semibold text-navy dark:text-light-gray">{lot.title || t('general.unspecified')}</p>
                                        <p className="whitespace-pre-wrap text-sm mt-1 text-navy/90 dark:text-light-gray/90">{lot.criteria || '-'}</p>
                                    </div>
                                ))}
                            </dd>
                        </div>
                    )}
                    {characteristics?.envelopeDocumentation_C && characteristics.envelopeDocumentation_C.length > 0 && (
                        <div className="py-1">
                            <dt className="font-medium text-medium-gray">{t('tenderSummary.envelopeC')}</dt>
                             <dd className="mt-1 space-y-3">
                                {characteristics.envelopeDocumentation_C.map(lot => (
                                    <div key={lot.id} className="p-3 bg-light-gray dark:bg-navy rounded-md border border-medium-gray/20 dark:border-white/10">
                                        <p className="font-semibold text-navy dark:text-light-gray">{lot.title || t('general.unspecified')}</p>
                                        <p className="whitespace-pre-wrap text-sm mt-1 text-navy/90 dark:text-light-gray/90">{lot.criteria || '-'}</p>
                                    </div>
                                ))}
                            </dd>
                        </div>
                    )}
                </SummarySection>
                
                <SummarySection title={t('tenderSummary.executionConditionsTitle')}>
                    <SummaryField label={t('tenderSummary.executionConditionsEthicalPrinciples')} value={characteristics?.executionConditions_ethicalPrinciples ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditionsEnvironmentalSocial')} value={characteristics?.executionConditions_environmentalSocial ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditionsGenderPerspective')} value={characteristics?.executionConditions_genderPerspective ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditionsCommunicationDesign')} value={characteristics?.executionConditions_communicationDesign ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditions_dataProtection')} value={characteristics?.executionConditions_dataProtection ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditions_labor')} value={characteristics?.executionConditions_labor ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditions_ute')} value={characteristics?.executionConditions_ute ? t('general.yes') : t('general.no')} />
                    <SummaryField label={t('tenderSummary.executionConditions_healthAndSafety')} value={characteristics?.executionConditions_healthAndSafety ? t('general.yes') : t('general.no')} />
                </SummarySection>

                <SummarySection title={t('stage3.workProgramTitle')}>
                    <SummaryField label={t('stage3.workProgramLabel')} value={characteristics?.workProgramRequired ? t('general.yes') : t('general.no')} />
                    {characteristics?.workProgramRequired && (
                        <LongTextField label={t('stage3.workProgramDetailsLabel')} value={getActiveVersionContent(characteristics.workProgramDetails)} />
                    )}
                </SummarySection>

                <SummarySection title={t('stage3.facilityVisitTitle')}>
                    <SummaryField 
                        label={t('tenderSummary.facilityVisit')} 
                        value={characteristics?.facilityVisitRequired === null ? '-' : (characteristics?.facilityVisitRequired ? t('general.yes') : t('general.no'))}
                    />
                     {characteristics?.facilityVisitRequired && (
                        <SummaryField 
                            label={t('tenderSummary.facilityVisitIsExclusionary')}
                            value={characteristics.facilityVisitIsExclusionary === null ? '-' : (characteristics.facilityVisitIsExclusionary ? t('general.yes') : t('general.no'))}
                        />
                     )}
                </SummarySection>
                
                {/* Stage 4 */}
                <SummarySection title={t('tenderSummary.stage4Title')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <SummaryField label={t('tenderSummary.publicationDate')} value={data.stage4.publicationDate ? new Date(data.stage4.publicationDate).toLocaleString() : '-'} />
                        <SummaryField label={t('tenderSummary.platform')} value={data.stage4.platform} />
                        <SummaryField label={t('tenderSummary.link')} value={data.stage4.link ? <a href={data.stage4.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{data.stage4.link}</a> : '-'} />
                        <SummaryField label={t('tenderSummary.procedureType')} value={data.stage4.procedureType ? t(`stage4.procedureTypes.${data.stage4.procedureType}`) : '-'} />
                    </div>
                </SummarySection>
            </div>
        </Modal>
    );
};

export default TenderSummaryModal;
