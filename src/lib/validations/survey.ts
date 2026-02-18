import { z } from "zod";

export const surveyAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
  value: z.string(),
});

export const submitSurveySchema = z.object({
  answers: z.array(surveyAnswerSchema).min(1, "حداقل یک پاسخ الزامی است"),
});

export type SurveyAnswerInput = z.infer<typeof surveyAnswerSchema>;
export type SubmitSurveyInput = z.infer<typeof submitSurveySchema>;
