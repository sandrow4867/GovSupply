import React, { useEffect, useState } from 'react';
import type { TenderData, ContractType } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { BuildingIcon } from './icons/BuildingIcon';
import { PackageIcon } from './icons/PackageIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { LandmarkIcon } from './icons/LandmarkIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../contexts/ToastContext';
import { AIIcon } from './icons/AIIcon';

interface Stage2ContractTypeProps {
  onComplete: () => void;
  onBack: () => void;
  data: TenderData['stage2'];
  updateData: (data: Partial<TenderData['stage2']>) => void;
  contractPurpose: string;
}

const contractTypes: { id: ContractType; icon: React.FC<any> }[] = [
    { id: 'works', icon: BuildingIcon },
    { id: 'supplies', icon: PackageIcon },
    { id: 'services', icon: WrenchIcon },
    { id: 'concessions', icon: LandmarkIcon },
];

const ContractCard: React.FC<{
    type: ContractType;
    Icon: React.FC<any>;
    isSelected: boolean;
    isSuggested: boolean;
    onSelect: () => void;
}> = ({ type, Icon, isSelected, isSuggested, onSelect }) => {
    const { t } = useLanguage();
    return (
        <button 
            onClick={onSelect}
            className={`relative p-6 text-left border-2 rounded-xl transition-all duration-200 transform hover:-translate-y-1 ${isSelected ? 'bg-primary/10 border-primary shadow-lg' : isSuggested ? 'bg-accent/10 border-accent shadow-md' : 'bg-white dark:bg-navy border-medium-gray/20 dark:border-white/10 hover:shadow-md'}`}
            aria-pressed={isSelected}
        >
            {isSuggested && !isSelected && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold bg-accent text-white px-2 py-1 rounded-full">
                    <AIIcon className="w-3 h-3" />
                    {t('stage2.aiSuggestion')}
                </div>
            )}
            <Icon className={`w-10 h-10 mb-4 ${isSelected ? 'text-primary' : isSuggested ? 'text-accent' : 'text-navy/60 dark:text-light-gray/60'}`} />
            <h3 className="text-xl font-bold text-navy dark:text-white">{t(`stage2.types.${type}.title`)}</h3>
            <p className="text-sm text-navy/70 dark:text-light-gray/70 mt-1">{t(`stage2.types.${type}.description`)}</p>
        </button>
    );
};


const Stage2ContractType: React.FC<Stage2ContractTypeProps> = ({ onComplete, onBack, data, updateData, contractPurpose }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isSuggesting, setIsSuggesting] = useState(false);
    const selectedType = data.contractType;
  
    useEffect(() => {
        const suggestType = async () => {
            if (contractPurpose && !data.aiSuggestedContractType) {
                setIsSuggesting(true);
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const prompt = `Based on the contract purpose: "${contractPurpose}", classify it as one of the following: 'works', 'supplies', 'services', or 'concessions'. Return only the single-word classification in lowercase.`;
                    
                    const response = await ai.models.generateContent({
                      model: "gemini-2.5-flash",
                      contents: prompt,
                    });

                    const suggested = response.text.trim() as ContractType;

                    if (contractTypes.some(ct => ct.id === suggested)) {
                        updateData({ aiSuggestedContractType: suggested });
                    }
                } catch (error) {
                    console.error("Error suggesting contract type:", error);
                    showToast(t('stage2.aiSuggestionError'), "error");
                } finally {
                    setIsSuggesting(false);
                }
            }
        };
        suggestType();
    }, [contractPurpose, data.aiSuggestedContractType, updateData, showToast]);

    const handleSelect = (type: ContractType) => {
      updateData({ contractType: type });
    };

    return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {contractTypes.map(({ id, icon }) => (
                <ContractCard 
                    key={id}
                    type={id}
                    Icon={icon}
                    isSelected={selectedType === id}
                    isSuggested={data.aiSuggestedContractType === id}
                    onSelect={() => handleSelect(id)}
                />
            ))}
        </div>

        {selectedType && (
            <div className="bg-light-gray dark:bg-dark-blue border border-medium-gray/20 dark:border-white/10 p-6 rounded-xl transition-opacity duration-500 opacity-100">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg flex-shrink-0">
                        <ScaleIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-navy dark:text-white">{t(`stage2.types.${selectedType}.legalTitle`)}</h3>
                        <p className="text-sm text-navy/70 dark:text-light-gray/70 mt-2 whitespace-pre-wrap">{t(`stage2.types.${selectedType}.legalSummary`)}</p>
                    </div>
                </div>
            </div>
        )}
        
        <div className="mt-6 bg-accent/10 dark:bg-accent/20 border-l-4 border-accent p-4 rounded-r-lg">
            <p className="text-sm text-navy dark:text-accent/90 font-semibold">{t('stage2.riskWarning')}</p>
        </div>

        <div className="mt-10 border-t border-medium-gray/20 dark:border-white/10 pt-6 flex justify-between items-center">
            <Button variant="secondary" onClick={onBack}>
                {t('general.back')}
            </Button>
            <Button onClick={onComplete} disabled={!selectedType}>{t('stage2.continue')}</Button>
        </div>
    </div>
    );
};

export default Stage2ContractType;