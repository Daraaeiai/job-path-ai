import { NextResponse } from "next/server";
import { FALLBACK_SURVEY_QUESTIONS } from "@/lib/data/survey-questions";

function getFallbackData() {
  return FALLBACK_SURVEY_QUESTIONS.map((q) => ({
    id: q.id,
    text: q.text,
    order: q.order,
    options: q.options.map((o) => ({ id: o.id, text: o.text, value: o.value, emoji: o.emoji })),
  }));
}

export async function GET() {
  try {
    const { SurveyService } = await import("@/server/services/survey.service");
    const questions = await SurveyService.getQuestions();
    const data =
      questions.length > 0
        ? questions.map((q: { id: string; text: string; order: number; options: Array<{ id: string; text: string; value: string }> }) => ({
            id: q.id,
            text: q.text,
            order: q.order,
            options: q.options.map((o) => ({ id: o.id, text: o.text, value: o.value })),
          }))
        : getFallbackData();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: getFallbackData() });
  }
}
