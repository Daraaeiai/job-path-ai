import { useQuery } from "@tanstack/react-query";
import { surveyService } from "@/lib/services/survey.service";

export const SURVEY_QUESTIONS_KEY = ["survey", "questions"] as const;

export function useSurveyQuestions() {
  return useQuery({
    queryKey: SURVEY_QUESTIONS_KEY,
    queryFn: () => surveyService.getQuestions(),
    staleTime: 5 * 60 * 1000,
  });
}
