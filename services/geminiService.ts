
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentResult } from "../types";

export const analyzeJobRisk = async (profileUrl: string, base64Image?: string): Promise<AssessmentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  const prompt = `
    I have a LinkedIn profile URL: ${profileUrl}.
    
    TASK:
    1. Use Google Search to find the public information for this specific LinkedIn profile. 
    2. Extract their current role, industry, key responsibilities, and listed skills.
    3. Perform a comprehensive AI Risk Assessment for this specific professional.
    4. Provide holistic career guidance using frameworks like Ikigai, Skill Stacking, or Antifragility.
    
    ARCHETYPE REQUIREMENT:
    When describing the user's value, you must assign them a professional archetype (e.g., "The Polymath Synthesizer", "The Human-Tech Bridge", "The Strategic Orchestrator").
    
    CRITICAL: You must provide a simple, one-line explanation of what this archetype means in plain English.
    Example: "The Translator: Someone who turns complex data into clear stories that everyone can understand."

    OUTPUT REQUIREMENTS:
    - Overall Risk Level: Low, Medium, or High.
    - Risk Score: 0 to 100.
    - humanCentricEdge: An object with the 'archetype' name and the 'explanation' string.
    - guidance: strategicAdvice should also include an archetype and its explanation within the text.
    
    The response must be in valid JSON format.
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
      tools: [{ googleSearch: {} }],
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
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                automationPotential: { type: Type.NUMBER },
                irreplaceableValue: { type: Type.STRING }
              },
              required: ['skill', 'automationPotential', 'irreplaceableValue']
            }
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
