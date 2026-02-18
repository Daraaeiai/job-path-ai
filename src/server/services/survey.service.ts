import { SurveyDAL } from "@/server/dal/survey.dal";

export const SurveyService = {
  async getQuestions() {
    return SurveyDAL.getQuestions();
  },

  async saveResult(userId: string, answers: unknown[], recommendation?: string) {
    return SurveyDAL.createResult({
      userId,
      answersJson: JSON.stringify(answers),
      recommendation,
    });
  },
};
