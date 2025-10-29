import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { STAGES_CONFIG, STAGES_COUNT } from './constants';
import type { TenderProcess, TenderData, VersionedDocument } from './types';
import Sidebar from './components/Sidebar';
import Stage1InitialData from './components/Stage1_GatherInfo';
import Stage3InternalDocs from './components/Stage3_InternalDocs';
import Stage4Drafting from './components/Stage4_Drafting';
import Stage7Publication from './components/Stage7_Publication';
import TenderDashboard from './components/ProjectDashboard';
import Modal from './components/common/Modal';
import ConfirmationModal from './components/common/ConfirmationModal';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useLanguage } from './contexts/LanguageContext';
import HomeScreen from './components/HomeScreen';
import RenameModal from './components/common/RenameModal';
import TenderSummaryModal from './components/TenderSummaryModal';
import Footer from './components/Footer';
import AppHeader from './components/AppHeader';
import { supabase } from './lib/supabaseClient';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { Button } from './components/common/Button';
import { RepeatIcon } from './components/icons/RepeatIcon';

// Helper function for debouncing function calls
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
  
    const debounced = (...args: Parameters<F>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };
  
    return debounced as (...args: Parameters<F>) => void;
};


const createInitialVersionedDoc = (name: string): VersionedDocument => {
    const id = `v_${name}_${Date.now()}`;
    return {
        versions: [{
            id,
            name: 'Versión 1',
            content: '',
            timestamp: new Date().toISOString()
        }],
        activeVersionId: id
    };
};

const blankTenderData: Omit<TenderData, 'id' | 'name'> = {
  stage1: {
    expedientNumber: '',
    serviceName: '',
    contractingAuthorityName: '',
    responsibleName: '',
    needs: createInitialVersionedDoc('needs'),
    initialDuration: '',
    extensions: '',
    modifications: '',
    infoSystemUsesAI: null,
    infoSystemInEurope: null,
    infoSystemName: '',
    infoSystemDetails: '',
    usesProtectedData: null,
    usesPersonalData: null,
    protectedDataDetails: createInitialVersionedDoc('protectedDataDetails'),
  },
  stage2: {
    necessityReport: { 
      background: createInitialVersionedDoc('necessity_background'), 
      evaluationCriteria: { 
        valueJudgment: createInitialVersionedDoc('necessity_valueJudgment'), 
        quantifiable: '' 
      }, 
      technicalDraft: null 
    },
    creditCertificate: { budgetItem: '', basePrice: '', estimatedPrice: '', vatRate: '21' },
    contractApproval: {
      necessityReportDate: '',
      creditCertificateDate: '',
      boardApprovalDate: '',
      legalReportDate: '',
      financialControlDate: '',
    },
  },
  stage3: { 
    justificationText: '',
    legalChecklist: {
      necessityAndEfficiency: false,
      legalityAndTransparency: false,
      equalityAndCompetition: false,
    },
    justificationDocuments: [],
    pcap: createInitialVersionedDoc('pcap'),
    pptData: {
      object: createInitialVersionedDoc('ppt_object'),
      serviceDescription: {
        description: createInitialVersionedDoc('ppt_serviceDescription'),
        technicalParams: '',
      },
      scope: createInitialVersionedDoc('ppt_scope'),
      infoSystem: createInitialVersionedDoc('ppt_infoSystem'),
      personnelResources: createInitialVersionedDoc('ppt_personnelResources'),
      materialResources: createInitialVersionedDoc('ppt_materialResources'),
      personnelSubrogation: '',
      serviceTransition: {
        plan: '',
      },
      companyObligations: {
        service: '',
        regulatory: '',
        qualityCerts: '',
        other: '',
      },
      penalties: {
        serious: '',
        minor: '',
        other: '',
      },
      liabilityInsurance: '',
      maintenance: {
        preventive: '',
        corrective: '',
        normative: '',
        wasteManagement: '',
      },
      sla: '',
      riskPrevention: '',
    },
    characteristics: createInitialVersionedDoc('characteristics'),
    characteristicsData: {
      object: createInitialVersionedDoc('characteristics_object'),
      cpvCodes: '',
      legalNature: '',
      innovativePurchase: null,
      lotDivision: '',
      numberOfLots: '',
      lots: [],
      lotDivisionJustification: createInitialVersionedDoc('lotDivisionJustification'),
      priceDetermination: '',
      billingType: '',
      baseBudget: '',
      modificationsAmount: '',
      extensionsAmount: '',
      allLotsMandatory: false,
      canBidOnOneOrAllLots: false,
      minLotsToBidRequired: false,
      minLotsToBidCount: '',
      minLotsToBidSelection: {},
      mandatoryLotsToBid: false,
      mandatoryLotsToBidSelection: {},
      mustBidOnFullLots: false,
      multiYearSupply: '',
      multiYearSupplyApprovalDate: '',
      annuities: [],
      anticipatedExpenditure: null,
      estimatedStartDate: '',
      contractDuration: '',
      partialTerms: null,
      partialTermsDetails: '',
      extensionsPossible: null,
      extensionsCount: '',
      extensionDuration: '',
      variantsAdmission: null,
      variantsAdmissionDetails: '',
      procedure: '',
      processingType: '',
      harmonizedRegulation: null,
      priorNotice: null,
      digitalEnvelope: null,
      electronicAuction: null,
      maxProposalDate: '',
      samplesDelivery: '',
      samplesProducts: '',
      samplesLocation: '',
      samplesUnitCount: '',
      samplesIdentification: '',
      samplesSubmissionTime: '',
      provisionalGuarantee: null,
      provisionalGuaranteePerLot: null,
      provisionalGuaranteeLotAmount: '',
      provisionalGuaranteeConstitution: '',
      definitiveGuarantee: null,
      definitiveGuaranteeDetails: '',
      definitiveGuaranteeConstitution: '',
      complementaryGuarantee: null,
      complementaryGuaranteeDetails: '',
      complementaryGuaranteeConstitution: '',
      guaranteeTerm: null,
      guaranteeTermDuration: '',
      guaranteeTermStartDate: '',
      priceReview: null,
      priceReviewDetails: '',
      subcontracting: null,
      subcontractingDetails: createInitialVersionedDoc('subcontractingDetails'),
      assignment: null,
      assignmentDetails: createInitialVersionedDoc('assignmentDetails'),
      solvencyClassificationCategory: '',
      solvencyClassificationGroup: '',
      solvencyClassificationSubgroup: '',
      solvencyEconomicPerLot: null,
      economicSolvencyTypes: {},
      economicSolvencyAmount: '',
      economicSolvencyOtherDetails: '',
      solvencyTechnicalPerLot: null,
      solvencyTechnicalCriteria: {},
      solvencyTechnicalCriteriaOther: '',
      solvencyIntegrationExternalMeans: null,
      solvencyIntegrationCriteria: createInitialVersionedDoc('solvencyIntegrationCriteria'),
      qualityStandardsRequired: null,
      qualityStandardsDetails: '',
      nonHarmonizedCriteria: null,
      nonHarmonizedCriteriaSelection: {},
      materialPersonalResources: null,
      materialResourcesDetails: createInitialVersionedDoc('materialResourcesDetails'),
      personalResourcesDetails: createInitialVersionedDoc('personalResourcesDetails'),
      abnormallyLowTenders: null,
      abnormallyLowTendersDetails: createInitialVersionedDoc('abnormallyLowTendersDetails'),
      otherAwardDocumentation: createInitialVersionedDoc('otherAwardDocumentation'),
      envelopeDocumentation_intro: createInitialVersionedDoc('envelopeDocumentation_intro'),
      envelopeDocumentation_A: { partA: '' },
      envelopeDocumentation_B: [],
      envelopeDocumentation_C: [],
      executionConditions_ethicalPrinciples: false,
      executionConditions_environmentalSocial: false,
      executionConditions_genderPerspective: false,
      executionConditions_communicationDesign: false,
      executionConditions_dataProtection: false,
      executionConditions_labor: false,
      executionConditions_ute: false,
      executionConditions_healthAndSafety: false,
      workProgramRequired: false,
      workProgramDetails: createInitialVersionedDoc('workProgramDetails'),
      promotingUnit: 'Direcció Serveis Generals i Infraestructures del CSA',
      facilityVisitRequired: false,
      facilityVisitIsExclusionary: null,
    },
  },
  stage4: { publicationDate: '', platform: '', link: '', procedureType: 'open' },
  // FIX: Add missing 'stage5' property to satisfy the TenderData type.
  stage5: {
    checklist: {
      procedure: false,
      clauses: false,
      compatibility: false,
    },
    validationDate: '',
    validatorName: '',
    reportContent: createInitialVersionedDoc('stage5_reportContent'),
    status: 'favorable',
  },
};

const createInitialTender = (): TenderProcess => {
    const id = `tender_${Date.now()}`;
    return {
        id,
        name: "Nueva Licitación de Suministro de Oficina",
        status: 'draft',
        lastModified: new Date().toISOString(),
        tenderData: {
            ...blankTenderData,
            stage3: {
              ...blankTenderData.stage3,
              pcap: createInitialVersionedDoc('pcap'),
              characteristics: createInitialVersionedDoc('characteristics'),
            },
            id,
            name: "Nueva Licitación de Suministro de Oficina",
        }
    };
};

const AppContent: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [tenders, setTenders] = useState<TenderProcess[]>([]);
    const [activeTenderId, setActiveTenderId] = useState<string | null>(null);
    const [currentStage, setCurrentStage] = useState<number>(1);
    const [completedStages, setCompletedStages] = useState<number[]>([]);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [tenderToDelete, setTenderToDelete] = useState<TenderProcess | null>(null);
    const [tenderToRename, setTenderToRename] = useState<TenderProcess | null>(null);
    const [tenderToView, setTenderToView] = useState<TenderProcess | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchTenders = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        const { data, error } = await supabase.from('tenders').select('*').order('last_modified', { ascending: false });

        if (error) {
            console.error("Error fetching tenders from Supabase:", error);
            const detailedError = `Detalles: ${error.message}.\n\nCausa probable: La Seguridad a Nivel de Fila (RLS) está habilitada en la tabla 'tenders' de Supabase, pero no existe una política que permita el acceso de lectura ('SELECT'). Por favor, crea una política en el panel de Supabase para permitir la lectura de datos.`;
            setFetchError(detailedError);
            showToast('Error al cargar las licitaciones', 'error');
        } else if (data) {
            const transformedTenders: TenderProcess[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                status: item.status,
                lastModified: item.last_modified,
                tenderData: item.tender_data,
            }));
            setTenders(transformedTenders.length > 0 ? transformedTenders : []);
            try {
                const savedActiveId = localStorage.getItem('govSupplyActiveTender');
                if (savedActiveId && data.some(t => t.id === JSON.parse(savedActiveId))) {
                    setActiveTenderId(JSON.parse(savedActiveId));
                }
            } catch (e) {
                console.error("Failed to parse active tender ID from localStorage", e);
                localStorage.removeItem('govSupplyActiveTender');
            }
        } else {
             setTenders([]);
        }
        
        setIsLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchTenders();
    }, [fetchTenders]);

    useEffect(() => {
        try {
            if (activeTenderId) {
                localStorage.setItem('govSupplyActiveTender', JSON.stringify(activeTenderId));
            } else {
                localStorage.removeItem('govSupplyActiveTender');
            }
        } catch (error) {
            console.error("Failed to save active tender ID to localStorage", error);
        }
    }, [activeTenderId]);

    const activeTender = useMemo(() => tenders.find(p => p.id === activeTenderId), [tenders, activeTenderId]);
    
    const updateTender = async (tenderId: string, updatedData: Partial<TenderProcess>) => {
        const originalTenders = tenders;
        let updatedTender: TenderProcess | undefined;

        const newTenders = tenders.map(p => {
            if (p.id === tenderId) {
                updatedTender = { ...p, ...updatedData, lastModified: new Date().toISOString() };
                return updatedTender;
            }
            return p;
        });
        setTenders(newTenders);

        if (!updatedTender) return;

        setIsSaving(true);
        const { error } = await supabase
            .from('tenders')
            .update({
                name: updatedTender.name,
                status: updatedTender.status,
                last_modified: updatedTender.lastModified,
                tender_data: updatedTender.tenderData,
            })
            .eq('id', updatedTender.id);
        setIsSaving(false);

        if (error) {
            console.error('Error updating tender in Supabase:', error);
            showToast(`Error al guardar los cambios: ${error.message}`, 'error');
            setTenders(originalTenders);
        }
    }
    
    const saveTenderData = useCallback(async (tenderToSave: TenderProcess) => {
        setIsSaving(true);
        const { error } = await supabase
            .from('tenders')
            .update({
                last_modified: tenderToSave.lastModified,
                tender_data: tenderToSave.tenderData,
            })
            .eq('id', tenderToSave.id);
        
        setIsSaving(false);

        if (error) {
            console.error('Error auto-saving tender data to Supabase:', error);
            showToast(`Error de guardado automático: ${error.message}`, 'error');
            fetchTenders();
        }
    }, [showToast, fetchTenders]);

    const debouncedSave = useMemo(() => debounce(saveTenderData, 1500), [saveTenderData]);

    const updateStageData = useCallback(<S extends keyof TenderData>(stageKey: S, updatedData: Partial<TenderData[S]>) => {
        setTenders(currentTenders => {
            const tenderToUpdate = currentTenders.find(t => t.id === activeTenderId);
            if (!tenderToUpdate) return currentTenders;
            
            const newTenderData = {
                ...tenderToUpdate.tenderData,
                [stageKey]: {
                    ...(tenderToUpdate.tenderData[stageKey] as object),
                    ...updatedData,
                }
            };

            const updatedTender = { ...tenderToUpdate, tenderData: newTenderData, lastModified: new Date().toISOString() };
            
            debouncedSave(updatedTender);

            return currentTenders.map(t => t.id === activeTenderId ? updatedTender : t);
        });
    }, [activeTenderId, debouncedSave]);


    const handleCreateNewTender = async () => {
        const tenderNumber = tenders.length + 1;
        const newTenderName = `Nueva Licitación ${tenderNumber}`;

        const tenderDataPayload = {
            ...blankTenderData,
            stage3: { 
                ...blankTenderData.stage3,
                pcap: createInitialVersionedDoc('pcap'),
                characteristics: createInitialVersionedDoc('characteristics'),
            },
            name: newTenderName,
        };

        const newTenderForSupabase = {
            name: newTenderName,
            status: 'draft',
            last_modified: new Date().toISOString(),
            tender_data: tenderDataPayload,
        };

        const { data: insertedTender, error } = await supabase
            .from('tenders')
            .insert(newTenderForSupabase)
            .select()
            .single();

        if (error) {
            console.error('Error creating new tender in Supabase:', error);
            showToast(`Error al crear la nueva licitación: ${error.message}`, 'error');
            return;
        }

        if (insertedTender) {
            const finalNewTender: TenderProcess = {
                id: insertedTender.id,
                name: insertedTender.name,
                status: insertedTender.status as TenderProcess['status'],
                lastModified: insertedTender.last_modified,
                tenderData: {
                    ...(insertedTender.tender_data as Omit<TenderData, 'id' | 'name'>),
                    id: insertedTender.id,
                    name: insertedTender.name,
                },
            };

            setTenders(prev => [finalNewTender, ...prev]);
            setActiveTenderId(finalNewTender.id);
            setCurrentStage(1);
            setCompletedStages([]);
            setIsDashboardOpen(false);
        }
    };
    
    const handleSelectTender = (tenderId: string) => {
        setActiveTenderId(tenderId);
        setCurrentStage(1); 
        setCompletedStages([]);
        setIsDashboardOpen(false);
    };

    const handleDeleteTender = (tender: TenderProcess) => {
        setTenderToDelete(tender);
    };

    const confirmDeleteTender = async () => {
        if (!tenderToDelete) return;

        const { error } = await supabase
            .from('tenders')
            .delete()
            .eq('id', tenderToDelete.id);
        
        if (error) {
            console.error('Error deleting tender from Supabase:', error);
            showToast(`Error al eliminar la licitación: ${error.message}`, 'error');
            setTenderToDelete(null);
            return;
        }

        setTenders(prev => prev.filter(p => p.id !== tenderToDelete.id));
        if (activeTenderId === tenderToDelete.id) {
            const remainingTenders = tenders.filter(p => p.id !== tenderToDelete.id);
            setActiveTenderId(remainingTenders.length > 0 ? remainingTenders[0].id : null);
        }
        setTenderToDelete(null);
    };

    const confirmRenameTender = async (newName: string) => {
        if (!tenderToRename) return;
        await updateTender(tenderToRename.id, { name: newName });
        setTenderToRename(null);
    };
    
    const handleNextStage = async () => {
        if (!completedStages.includes(currentStage)) {
            setCompletedStages(prev => [...prev, currentStage]);
        }
        if (currentStage < STAGES_COUNT) {
            setCurrentStage(currentStage + 1);
        } else {
            if(activeTender) {
                await updateTender(activeTender.id, { status: 'ready_to_publish' });
                showToast(t('app.tenderCreatedSuccess'), 'success');
                handleGoHome();
            }
        }
    };

    const handlePrevStage = () => {
        if (currentStage > 1) {
            setCurrentStage(currentStage - 1);
        }
    };

    const handleSetStage = (stageNumber: number) => {
        if(completedStages.includes(stageNumber) || stageNumber < currentStage) {
            setCurrentStage(stageNumber);
        }
    }
    
    const handleGoHome = () => {
        setActiveTenderId(null);
        setIsDashboardOpen(false);
        setCurrentStage(1);
        setCompletedStages([]);
    };
    
    const handleRenameActiveTender = () => {
        if (activeTender) {
            setTenderToRename(activeTender);
        }
    };

    const renderCurrentStage = () => {
        if (!activeTender?.tenderData) return null;
        const onGoHomeProp = currentStage === 1 ? handleGoHome : undefined;
        const tenderData = activeTender.tenderData;

        switch (currentStage) {
            case 1: return <Stage1InitialData onComplete={handleNextStage} data={tenderData.stage1} updateData={(d) => updateStageData('stage1', d)} onGoHome={onGoHomeProp} tenderData={tenderData} />;
            case 2: return <Stage3InternalDocs onComplete={handleNextStage} onBack={handlePrevStage} data={tenderData.stage2} updateData={(d) => updateStageData('stage2', d)} tenderData={tenderData} />;
            case 3: return <Stage4Drafting onComplete={handleNextStage} onBack={handlePrevStage} data={tenderData.stage3} updateData={(d) => updateStageData('stage3', d)} tenderData={tenderData} onNavigateToStage={handleSetStage} />;
            case 4: return <Stage7Publication onComplete={handleNextStage} onBack={handlePrevStage} data={tenderData.stage4} updateData={(d) => updateStageData('stage4', d)} />;
            default: return <Stage1InitialData onComplete={handleNextStage} data={tenderData.stage1} updateData={(d) => updateStageData('stage1', d)} onGoHome={onGoHomeProp} tenderData={tenderData} />;
        }
    };
    
    const currentStageData = activeTenderId ? {
        name: t(`stages.${currentStage}.name`),
        description: t(`stages.${currentStage}.description`),
    } : undefined;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-light-gray dark:bg-dark-blue">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold text-navy dark:text-light-gray">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-light-gray dark:bg-dark-blue p-4">
                <div className="text-center p-8 bg-white dark:bg-navy rounded-xl shadow-lg max-w-lg w-full">
                    <XCircleIcon className="h-12 w-12 text-accent mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-navy dark:text-light-gray">Error de Conexión</h2>
                    <p className="mt-2 text-navy/80 dark:text-light-gray/80">No se pudieron cargar las licitaciones desde la base de datos.</p>
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
                        <p className="font-semibold">Información del Error:</p>
                        <p>{fetchError}</p>
                    </div>
                    <div className="mt-6">
                        <Button onClick={fetchTenders}>
                            <RepeatIcon className="w-5 h-5 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-light-gray dark:bg-dark-blue text-navy dark:text-light-gray">
            <div className="flex flex-1">
                {activeTenderId && (
                    <Sidebar
                        currentStage={currentStage}
                        completedStages={completedStages}
                        onStageSelect={handleSetStage}
                        onShowDashboard={() => setIsDashboardOpen(true)}
                        onGoHome={handleGoHome}
                    />
                )}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AppHeader 
                        onShowDashboard={() => setIsDashboardOpen(true)} 
                        onGoHome={handleGoHome} 
                        activeTenderName={activeTender?.name}
                        onRename={handleRenameActiveTender}
                        isSidebarVisible={!!activeTenderId}
                        isSaving={isSaving}
                    />
                    
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8">
                        <div className={`${activeTenderId ? 'max-w-5xl' : 'max-w-7xl'} mx-auto`}>
                            {activeTenderId && activeTender.tenderData ? (
                                <>
                                    {currentStageData && (
                                        <header className="my-8 text-center">
                                            <h1 className="text-4xl font-bold text-navy dark:text-white">{currentStageData.name}</h1>
                                            <p className="text-navy/70 dark:text-light-gray/70 mt-2 max-w-2xl mx-auto">{currentStageData.description}</p>
                                        </header>
                                    )}
                                    
                                    <div className="bg-white dark:bg-navy rounded-xl shadow-lg p-6 sm:p-10 border border-medium-gray/20 dark:border-white/10">
                                        {renderCurrentStage()}
                                    </div>
                                </>
                            ) : (
                                <HomeScreen 
                                    onShowDashboard={() => setIsDashboardOpen(true)} 
                                    onCreateNewTender={handleCreateNewTender}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <Footer />

            <Modal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} title={t('app.myTenders')}>
                <TenderDashboard
                    tenders={tenders}
                    onSelectTender={handleSelectTender}
                    onCreateNewTender={handleCreateNewTender}
                    onDeleteTender={handleDeleteTender}
                    onRenameTender={(tender) => setTenderToRename(tender)}
                    onViewTender={(tender) => setTenderToView(tender)}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={!!tenderToDelete}
                onClose={() => setTenderToDelete(null)}
                onConfirm={confirmDeleteTender}
                title={t('app.deleteTenderTitle')}
                message={tenderToDelete ? t('app.deleteTenderMessage', tenderToDelete.name) : ''}
            />

            <RenameModal
                isOpen={!!tenderToRename}
                onClose={() => setTenderToRename(null)}
                onConfirm={confirmRenameTender}
                currentName={tenderToRename?.name || ''}
                title={t('app.renameTenderTitle')}
                label={t('app.newNameLabel')}
            />

            <TenderSummaryModal
                isOpen={!!tenderToView}
                onClose={() => setTenderToView(null)}
                tender={tenderToView}
            />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
};

export default App;