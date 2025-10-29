export type TenderStatus = 'draft' | 'internal_review' | 'drafting' | 'control_review' | 'legal_review' | 'ready_to_publish' | 'published' | 'awarded';

// FIX: Add ContractType to fix error in components/Stage2_GenerateConcept.tsx
export type ContractType = 'works' | 'supplies' | 'services' | 'concessions';

export interface FileAttachment {
    name: string;
    size: number;
    content?: string; // Base64 content
}

export interface Stage1Data {
    // Kept for context
    expedientNumber?: string;
    serviceName?: string;
    contractingAuthorityName?: string;
    responsibleName?: string;
    
    // New fields from proposal
    needs: VersionedDocument;
    initialDuration: string;
    extensions: string;
    modifications: string;

    // Information System
    infoSystemUsesAI: boolean | null;
    infoSystemInEurope: boolean | null;
    infoSystemName: string;
    infoSystemDetails: string;
    
    // Protected Data
    usesProtectedData: boolean | null;
    usesPersonalData: boolean | null;
    protectedDataDetails: VersionedDocument;
}

export interface Stage2Data {
    // 1. Informe de necesidad
    necessityReport: {
        background: VersionedDocument;
        evaluationCriteria: {
            valueJudgment: VersionedDocument;
            quantifiable: string;
        };
        technicalDraft: FileAttachment | null;
    };

    // 2. Certificado de crédito
    creditCertificate: {
        budgetItem: string;
        basePrice: string;
        estimatedPrice: string;
        vatRate: string;
    };

    // 3. Aprobación del contrato
    contractApproval: {
        necessityReportDate: string;
        creditCertificateDate: string;
        boardApprovalDate: string;
        legalReportDate: string;
        financialControlDate: string;
    };
    // FIX: Add properties to support Stage2_GenerateConcept.tsx
    contractType?: ContractType;
    aiSuggestedContractType?: ContractType;
}


export interface DocumentVersion {
    id: string;
    name: string;
    content: string;
    timestamp: string;
}

export interface VersionedDocument {
    versions: DocumentVersion[];
    activeVersionId: string | null;
}

export type LegalNature = 'service' | 'supply' | 'works' | 'other';
export type LotDivision = 'yes' | 'no';
export type PriceDeterminationType = 'lumpSum' | 'unitPrice';
export type EconomicSolvencyType = 'turnover' | 'insurance' | 'netWorth' | 'other';


export interface Lot {
    id: string;
    title: string;
    description: VersionedDocument;
    economicSolvencyTypes?: { [key: string]: boolean };
    economicSolvencyAmount?: string;
    economicSolvencyOtherDetails?: string;
    technicalSolvencyCriteria?: { [key: string]: boolean };
    technicalSolvencyCriteriaOther?: string;
}

export interface Annuity {
    id: string;
    year: string;
    months: string;
    amount: string;
}

export interface EnvelopeBLot {
    id: string;
    title: string;
    criteria: string;
}

export interface EnvelopeCLot {
    id: string;
    title: string;
    criteria: string;
}

export interface Stage3CharacteristicsData {
    object: VersionedDocument;
    cpvCodes: string;
    legalNature: LegalNature | '';
    innovativePurchase: boolean | null; // null for unset
    lotDivision: LotDivision | '';
    numberOfLots?: string;
    lots?: Lot[];
    lotDivisionJustification?: VersionedDocument;
    priceDetermination: PriceDeterminationType | '';
    billingType?: string;
    baseBudget: string; // Using string to handle empty input
    modificationsAmount: string;
    extensionsAmount: string;
    // New fields for lot options
    allLotsMandatory?: boolean;
    canBidOnOneOrAllLots?: boolean;
    minLotsToBidRequired?: boolean;
    minLotsToBidCount?: string;
    minLotsToBidSelection?: { [lotId: string]: boolean };
    mandatoryLotsToBid?: boolean;
    mandatoryLotsToBidSelection?: { [lotId: string]: boolean };
    mustBidOnFullLots?: boolean;
    // New fields from user request
    multiYearSupply?: LotDivision | '';
    multiYearSupplyApprovalDate?: string;
    annuities?: Annuity[];
    anticipatedExpenditure?: boolean | null;
    // New fields for contract duration and variants
    estimatedStartDate?: string;
    contractDuration?: string;
    partialTerms?: boolean | null;
    partialTermsDetails?: string;
    extensionsPossible?: boolean | null;
    extensionsCount?: string;
    extensionDuration?: string;
    variantsAdmission?: boolean | null;
    variantsAdmissionDetails?: string;
    // New fields for procedure
    procedure?: string;
    processingType?: string;
    harmonizedRegulation?: boolean | null;
    priorNotice?: boolean | null;
    digitalEnvelope?: boolean | null;
    electronicAuction?: boolean | null;
    maxProposalDate?: string;
    samplesDelivery?: LotDivision | '';
    samplesProducts?: string;
    samplesLocation?: string;
    samplesUnitCount?: string;
    samplesIdentification?: string;
    samplesSubmissionTime?: 'withBid' | 'onRequest' | '';
    // New fields for guarantees
    provisionalGuarantee?: boolean | null;
    provisionalGuaranteePerLot?: boolean | null;
    provisionalGuaranteeLotAmount?: string;
    provisionalGuaranteeConstitution?: string;
    definitiveGuarantee?: boolean | null;
    definitiveGuaranteeDetails?: string;
    definitiveGuaranteeConstitution?: string;
    complementaryGuarantee?: boolean | null;
    complementaryGuaranteeDetails?: string;
    complementaryGuaranteeConstitution?: string;
    guaranteeTerm?: boolean | null;
    guaranteeTermDuration?: string;
    guaranteeTermStartDate?: string;
    priceReview?: boolean | null;
    priceReviewDetails?: string;
    // New fields for subcontracting and assignment
    subcontracting?: boolean | null;
    subcontractingDetails?: VersionedDocument;
    assignment?: boolean | null;
    assignmentDetails?: VersionedDocument;
    // New fields for solvency
    solvencyClassificationCategory?: string;
    solvencyClassificationGroup?: string;
    solvencyClassificationSubgroup?: string;
    solvencyEconomicPerLot?: boolean | null;
    economicSolvencyTypes?: { [key: string]: boolean };
    economicSolvencyAmount?: string;
    economicSolvencyOtherDetails?: string;
    solvencyTechnicalPerLot?: boolean | null;
    solvencyTechnicalCriteria?: { [key: string]: boolean };
    solvencyTechnicalCriteriaOther?: string;
    solvencyIntegrationExternalMeans?: boolean | null;
    solvencyIntegrationCriteria?: VersionedDocument;
    solvencyIntegrationCriteriaDetails?: string;
    qualityStandardsRequired?: boolean | null;
    qualityStandardsDetails?: string;
    qualityStandardsAccreditationDetails?: string;
    nonHarmonizedCriteria?: boolean | null;
    nonHarmonizedCriteriaSelection?: { [key: string]: boolean };
    materialPersonalResources?: boolean | null;
    materialResourcesDetails?: VersionedDocument;
    materialResourcesAdscriptionDetails?: string;
    personalResourcesDetails?: VersionedDocument;
    abnormallyLowTenders?: boolean | null;
    abnormallyLowTendersDetails?: VersionedDocument;
    otherAwardDocumentation?: VersionedDocument;
    envelopeDocumentation_intro?: VersionedDocument;
    envelopeDocumentation_A?: { partA: string; };
    envelopeDocumentation_B?: EnvelopeBLot[];
    envelopeDocumentation_C?: EnvelopeCLot[];
    executionConditions_ethicalPrinciples?: boolean;
    executionConditions_environmentalSocial?: boolean;
    executionConditions_genderPerspective?: boolean;
    executionConditions_communicationDesign?: boolean;
    executionConditions_dataProtection?: boolean;
    executionConditions_labor?: boolean;
    executionConditions_ute?: boolean;
    executionConditions_healthAndSafety?: boolean;
    workProgramRequired?: boolean | null;
    workProgramDetails?: VersionedDocument;
    promotingUnit?: string;
    facilityVisitRequired?: boolean | null;
    facilityVisitIsExclusionary?: boolean | null;
}

export interface PPTData {
  object: VersionedDocument;
  serviceDescription: {
    description: VersionedDocument;
    technicalParams: string;
  };
  scope: VersionedDocument;
  infoSystem: VersionedDocument;
  personnelResources: VersionedDocument;
  materialResources: VersionedDocument;
  personnelSubrogation: string;
  serviceTransition: {
    plan: string;
  };
  companyObligations: {
    service: string;
    regulatory: string;
    qualityCerts: string;
    other: string;
  };
  penalties: {
    serious: string;
    minor: string;
    other: string;
  };
  liabilityInsurance: string;
  maintenance: {
    preventive: string;
    corrective: string;
    normative: string;
    wasteManagement: string;
  };
  sla: string;
  riskPrevention: string;
}


export interface Stage3Data {
    justificationText: string;
    legalChecklist: {
        necessityAndEfficiency: boolean;
        legalityAndTransparency: boolean;
        equalityAndCompetition: boolean;
    };
    justificationDocuments: FileAttachment[];
    pcap: VersionedDocument;
    pptData?: PPTData;
    characteristics: VersionedDocument;
    characteristicsData?: Stage3CharacteristicsData;
}

export interface Stage4Data {
    publicationDate?: string;
    platform?: 'PLACSP' | 'DOUE' | 'BOE' | string;
    link?: string;
    procedureType?: 'open' | 'restricted' | 'negotiated' | 'dialogue';
}

// FIX: Add Stage5Data to support Stage6_LegalReport component.
export interface Stage5Data {
    checklist: {
        procedure: boolean;
        clauses: boolean;
        compatibility: boolean;
    };
    validationDate: string;
    validatorName: string;
    reportContent: VersionedDocument;
    status?: 'favorable' | 'reparo';
}

export interface TenderData {
    id: string;
    name:string;
    stage1: Stage1Data;
    stage2: Stage2Data;
    stage3: Stage3Data;
    stage4: Stage4Data;
    // FIX: Add stage5 to support Stage6_LegalReport component.
    stage5: Stage5Data;
}

export interface TenderProcess {
    id: string;
    name: string;
    status: TenderStatus;
    lastModified: string;
    tenderData: TenderData;
}

export type Project = TenderProcess;
export type GrantData = TenderData;
