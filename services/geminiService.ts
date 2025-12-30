
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentResult } from "../types";

export const analyzeJobRisk = async (profileUrl: string): Promise<AssessmentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  const prompt = `
    PROFILE TO ANALYZE: ${profileUrl}
    
    TASK: Perform a RIGOROUS, REPRODUCIBLE, and PERSONALIZED AI Risk Assessment.
    
    EXTRACTION REQUIREMENTS:
    1. NAME: Extract the person's full name clearly from the profile.
    2. PROFESSIONAL ROLE: Synthesize a concise, high-fidelity job description for the 'role' field. 
       - PRIMARY SOURCE: The current LinkedIn headline title.
       - SECONDARY SOURCE: The most recent job titles in their experience section.
       - FORMAT: Combine these to reflect their current professional identity accurately (e.g., "Senior Software Engineer & AI Consultant" or "Creative Director at X").
    3. INDUSTRY: Identify the primary industry they operate in based on their work history.

    SKILLS ANALYSIS REQUIREMENT:
    1. Identify the top 5 most predominant skills. 
    2. CRITERIA FOR PREDOMINANCE: 
       - Frequency of mention in experience descriptions.
       - Level of responsibility/seniority associated with the skill.
       - Strategic importance to their current job title and industry.
    3. Rank these 5 skills in order of prominence (from most essential/frequent to least).
    4. For each, provide automation potential (0-100) and the irreplaceable human value.
    5. PROVIDE A SKILLS METHODOLOGY: Write a short, 1-2 sentence note explaining how these specific 5 skills were identified.

    CAREER GUIDANCE REQUIREMENT:
    1. Offer EXACTLY 3 distinct suggestions for career growth.
    2. Each MUST use a specific career framework (e.g., Ikigai, Skill Stacking, T-Shaped).
    3. Use easy, accessible, and encouraging language. Avoid jargon.

    EVALUATION RUBRIC:
    - Cognitive Routine (High Risk)
    - Social Intelligence (Low Risk)
    - Creative Synthesis (Low Risk)
    - Unstructured Physicality (Low Risk)

    INSTRUCTIONS:
    - Base assessment on current AI capabilities (LLMs, Agents).
    - Be objective and consistent.
    - Ensure output is valid JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ text: prompt }],
    config: {
      systemInstruction: "You are a top-tier Career Guidance Expert and AI Impact Auditor. You provide clear, objective assessments. You MUST extract the person's name and focus on their current/most recent professional role. Determine skills through frequency, seniority level, and industry impact. Use temperature 0 for maximum consistency.",
      tools: [{ googleSearch: {} }],
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
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
            }
          },
          skillsMethodology: { type: Type.STRING },
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
                minItems: 3,
                maxItems: 3,
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
        required: ['name', 'role', 'industry', 'overallRisk', 'riskScore', 'justification', 'skillsAnalysis', 'skillsMethodology', 'humanCentricEdge', 'guidance']
      }
    }
  });

  return JSON.parse(response.text || "{}") as AssessmentResult;
};
