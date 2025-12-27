
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface SkillImpact {
  skill: string;
  automationPotential: number; // 0 to 100
  irreplaceableValue: string;
}

export interface CareerFramework {
  name: string;
  concept: string;
  actionItems: string[];
}

export interface AssessmentResult {
  role: string;
  industry: string;
  overallRisk: RiskLevel;
  riskScore: number; // 0 to 100
  justification: string;
  skillsAnalysis: SkillImpact[];
  humanCentricEdge: string;
  guidance: {
    strategicAdvice: string;
    frameworks: CareerFramework[];
    positiveActionPlan: string[];
  };
}

export interface ProfileData {
  text: string;
  hasImage: boolean;
  imageData?: string;
}
