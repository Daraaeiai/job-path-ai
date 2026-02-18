import { db } from "@/server/db";

export const SurveyDAL = {
  async getQuestions() {
    return await db.surveyQuestion.findMany({
      orderBy: { order: "asc" },
      include: { options: true },
    });
  },

  async createResult(data: {
    userId: string;
    answersJson: string;
    recommendation?: string;
  }) {
    return await db.surveyResult.create({
      data: {
        userId: data.userId,
        answersJson: data.answersJson,
        recommendation: data.recommendation,
      },
    });
  },
};
