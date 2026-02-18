import { api } from "@/lib/api";
import type {
  SurveyQuestion,
  CareerRecommendationResponse,
} from "@/types/survey.types";

const SURVEY_ENDPOINTS = {
  QUESTIONS: "/survey/questions",
  SUBMIT: "/survey/submit",
} as const;

export const surveyService = {
  async getQuestions(): Promise<SurveyQuestion[]> {
    const { data } = await api.get<{ success: boolean; data?: SurveyQuestion[] }>(
      SURVEY_ENDPOINTS.QUESTIONS
    );
    return data?.data ?? [];
  },

  async submitAndGetRecommendation(answers: Array<{ questionId: string; optionId: string; value: string }>): Promise<CareerRecommendationResponse> {
    const { data } = await api.post<CareerRecommendationResponse>(
      SURVEY_ENDPOINTS.SUBMIT,
      { answers },
      { timeout: 60000 }
    );
    return data;
  },
};
