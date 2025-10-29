import { GoogleGenAI } from '@google/genai';
import type { TenderData, VersionedDocument } from '../types';

export enum AITextAction {
    GENERATE = 'GENERATE',
    EXPAND = 'EXPAND',
    SHORTEN = 'SHORTEN',
    REWRITE = 'REWRITE',
}

function simplifyTenderDataForPrompt(tenderData: TenderData): string {
    const context = {
        name: tenderData.name,
        stage1: tenderData.stage1,
        stage2: {
            necessityReport: {
                background: tenderData.stage2.necessityReport.background,
                evaluationCriteria: tenderData.stage2.necessityReport.evaluationCriteria,
            },
            creditCertificate: {
                basePrice: tenderData.stage2.creditCertificate.basePrice,
                estimatedPrice: tenderData.stage2.creditCertificate.estimatedPrice,
            },
        },
        stage3: {
            characteristicsData: {
                object: tenderData.stage3.characteristicsData?.object,
                legalNature: tenderData.stage3.characteristicsData?.legalNature,
                lotDivision: tenderData.stage3.characteristicsData?.lotDivision,
                numberOfLots: tenderData.stage3.characteristicsData?.numberOfLots,
                baseBudget: tenderData.stage3.characteristicsData?.baseBudget,
            }
        }
    };
    
    // Replacer function to handle VersionedDocument and remove empty fields
    const replacer = (key: string, value: any) => {
        if (value && typeof value === 'object' && value.hasOwnProperty('versions') && value.hasOwnProperty('activeVersionId')) {
            const doc = value as VersionedDocument;
            const activeVersion = doc.versions.find(v => v.id === doc.activeVersionId);
            return activeVersion ? activeVersion.content : '';
        }
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            return undefined;
        }
        return value;
    };

    return JSON.stringify(context, replacer, 2);
}

export async function processAIText(
    contextData: TenderData,
    fieldName: string,
    action: AITextAction,
    currentText?: string,
): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const tenderContext = simplifyTenderDataForPrompt(contextData);
        let instruction = '';

        switch (action) {
            case AITextAction.GENERATE:
                instruction = `Basándote en el contexto proporcionado, genera una propuesta de texto concisa, profesional y técnicamente adecuada para el campo solicitado. El texto debe ser un borrador inicial que el usuario pueda editar y mejorar fácilmente. No incluyas introducciones como "Aquí tienes una sugerencia de texto". Devuelve únicamente el texto para el campo.`;
                break;
            case AITextAction.EXPAND:
                if (!currentText) throw new Error('Current text is required for EXPAND action.');
                instruction = `Toma el siguiente texto y expándelo, añadiendo más detalles y elaborando los puntos clave, manteniendo el tono profesional y el contexto del expediente. No incluyas introducciones. Devuelve únicamente el texto expandido.\n\nTexto a expandir:\n"""\n${currentText}\n"""`;
                break;
            case AITextAction.SHORTEN:
                if (!currentText) throw new Error('Current text is required for SHORTEN action.');
                instruction = `Resume y acorta el siguiente texto, haciéndolo más conciso y directo sin perder la información esencial. Mantén el tono profesional y el contexto del expediente. No incluyas introducciones. Devuelve únicamente el texto acortado.\n\nTexto a acortar:\n"""\n${currentText}\n"""`;
                break;
            case AITextAction.REWRITE:
                if (!currentText) throw new Error('Current text is required for REWRITE action.');
                instruction = `Reescribe el siguiente texto con un estilo alternativo, mejorando la claridad o la redacción, pero manteniendo el mismo significado. Mantén el tono profesional y el contexto del expediente. No incluyas introducciones. Devuelve únicamente el texto reescrito.\n\nTexto a reescribir:\n"""\n${currentText}\n"""`;
                break;
        }

        const prompt = `
Eres un asistente experto en contratación pública en España. Tu tarea es ayudar a un funcionario a redactar borradores para un expediente de licitación.

**Contexto del Expediente (datos ya introducidos):**
\`\`\`json
${tenderContext}
\`\`\`

**Campo en el que se trabaja:**
"${fieldName}"

**Instrucción:**
${instruction}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error processing AI text:", error);
        throw new Error("Failed to generate text from AI.");
    }
}