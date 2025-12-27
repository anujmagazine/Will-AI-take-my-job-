
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentResult } from "../types";

export const analyzeJobRisk = async (profileUrl: string, base64Image?: string): Promise<AssessmentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  // Using a more detailed prompt with an explicit scoring rubric and skill prioritization
  const prompt = `
    PROFILE TO ANALYZE: ${profileUrl}
    
    TASK: Perform a RIGOROUS, REPRODUCIBLE, and PRIORITIZED AI Risk Assessment for this professional.
    
    SKILLS ANALYSIS REQUIREMENT:
    1. Analyze the profile to identify the top 5 most predominant skills that define this person's professional value.
    2. Rank these 5 skills in order of prominence (from most essential/frequent to least).
    3. For each of these 5 skills, provide the automation potential (0-100) and the irreplaceable human value.

    EVALUATION RUBRIC (Use these 4 dimensions to calculate the final Risk Score):
    1. Cognitive Routine (High Risk): Repetitive data processing, scheduling, or basic reporting.
    2. Social Intelligence (Low Risk): High-stakes negotiation, therapy, mentorship, or complex stakeholder management.
    3. Creative Synthesis (Low Risk): Developing novel solutions, multi-disciplinary strategy, or original artistic output.
    4. Unstructured Physicality (Low Risk): Navigating complex, non-standardized physical environments.

    SCORING STANDARDS:
    - 0-30 (Low): Roles requiring high social empathy, physical dexterity, or unique creative synthesis.
    - 31-70 (Medium): Roles with a mix of data-driven tasks and human-centric coordination.
    - 71-100 (High): Roles primarily focused on information retrieval, synthesis of existing data, or routine administrative tasks.

    ARCHETYPE REQUIREMENT:
    Assign a professional archetype (e.g., "The Human-Tech Bridge", "The Strategic Orchestrator").
    Provide a simple, one-line explanation of the archetype in plain English.

    INSTRUCTIONS:
    - Base the assessment on current AI capabilities (LLMs, Agentic workflows).
    - Be objective and consistent.
    - Ensure the output is valid JSON.
  `;

  const contents: any[] = [{ text: prompt }];
  
  if (base64Image) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction: "You are a professional Labor Economist and AI Impact Auditor. Your goal is to provide objective, data-driven, and highly consistent assessments. You prioritize analysis on the top 5 core skills of a professional and evaluate them against state-of-the-art AI automation capabilities.",
      tools: [{ googleSearch: {} }],
      // Deterministic settings to reduce variability
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          industry: { type: Type.STRING },
          overallRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          riskScore: { type: Type.NUMBER },
          justification: { type: Type.STRING },
          skillsAnalysis: {
            type: Type.ARRAY,
            minItems: 5,
            maxItems: 5,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                automationPotential: { type: Type.NUMBER },
                irreplaceableValue: { type: Type.STRING }
              },
              required: ['skill', 'automationPotential', 'irreplaceableValue']
            },
            description: "Top 5 predominant skills, ordered by prominence from index 0."
          },
          humanCentricEdge: {
            type: Type.OBJECT,
            properties: {
              archetype: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['archetype', 'explanation']
          },
          guidance: {
            type: Type.OBJECT,
            properties: {
              strategicAdvice: { type: Type.STRING },
              frameworks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    concept: { type: Type.STRING },
                    actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['name', 'concept', 'actionItems']
                }
              },
              positiveActionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['strategicAdvice', 'frameworks', 'positiveActionPlan']
          }
        },
        required: ['role', 'industry', 'overallRisk', 'riskScore', 'justification', 'skillsAnalysis', 'humanCentricEdge', 'guidance']
      }
    }
  });

  const result = JSON.parse(response.text || "{}") as AssessmentResult;
  return result;
};
