export interface SurveyQuestion {
  id: string;
  text: string;
  options: SurveyOption[];
  order: number;
}

export interface SurveyOption {
  id: string;
  text: string;
  value: string;
  emoji?: string;
}

export interface SurveyAnswer {
  questionId: string;
  optionId: string;
  value: string;
}

export interface CareerRecommendationResponse {
  success: boolean;
  recommendation?: string;
  error?: string;
}
