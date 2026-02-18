"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSurveyQuestions } from "@/hooks/survey/useSurveyQuestions";
import { surveyService } from "@/lib/services/survey.service";
import { cn } from "@/lib/utils";
import type { SurveyOption } from "@/types/survey.types";
import { ChevronRight } from "lucide-react";
import { ArrowIcon } from "@/components/icons";
import Image from "next/image";

type SurveyState = "questions" | "loading" | "result";

export default function SurveyPage() {
  const { data: questions = [], isLoading } = useSurveyQuestions();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; value: string }>>({});
  const [state, setState] = useState<SurveyState>("questions");
  const [recommendation, setRecommendation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = questions.length;
  const question = questions[currentStep];
  const currentAnswer = question ? answers[question.id] : null;
  const isLastQuestion = currentStep === totalSteps - 1;

  const handleSelectOption = useCallback((qId: string, option: SurveyOption) => {
    setAnswers((prev) => ({ ...prev, [qId]: { optionId: option.id, value: option.value } }));
  }, []);

  const handleNext = useCallback(async () => {
    if (isLastQuestion && currentAnswer) {
      setIsSubmitting(true);
      setState("loading");
      try {
        const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          optionId: answer.optionId,
          value: answer.value,
        }));
        const response = await surveyService.submitAndGetRecommendation(answersArray);
        if (response.success && response.recommendation) {
          setRecommendation(response.recommendation);
          setState("result");
        } else {
          setRecommendation(response.error || "خطا در دریافت پیشنهاد");
          setState("result");
        }
      } catch (error) {
        setRecommendation("خطا در ارتباط با سرور");
        setState("result");
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps, isLastQuestion, currentAnswer, answers]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const progressWidth = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  if (isLoading || totalSteps === 0) {
    return (
      <main className="min-h-dvh w-full bg-stone-50 flex items-center justify-center font-iranyekan">
        <p className="text-neutral-500 text-sm">در حال بارگذاری...</p>
      </main>
    );
  }

  if (state === "loading") {
    return (
      <main className="w-full min-h-dvh flex flex-col items-center justify-center bg-stone-50 font-iranyekan">
        <div className="bg-white p-4 rounded-2xl mb-6">
          <Image src="/images/logo.svg" alt="logo" width={70} height={70} />
        </div>
        <h2 className="text-zinc-800 text-2xl font-bold font-morabba leading-9 mb-2 text-center px-5">
          در حال تحلیل مسیر شغلی تو…
        </h2>
        <p className="text-neutral-500 text-xs font-medium font-iranyekan leading-5 text-center px-5 max-w-[320px]">
          هوش مصنوعی Jobpath در حال بررسی جواب‌ها و ساختن نقشه مسیر شغلی توئه.
        </p>
      </main>
    );
  }

  if (state === "result") {
    const titleMatch = recommendation.match(/مسیر پیشنهادی شما:?\s*([^\n]+)/i);
    const careerMatch = titleMatch?.[1]?.trim() || "Product Designer";
    const description = recommendation
      .replace(/مسیر پیشنهادی شما:?\s*[^\n]+\s*/i, "")
      .trim();

    return (
      <main className="w-full min-h-dvh flex flex-col gap-4 bg-stone-50 overflow-y-auto py-8">
        <div className="w-[90%] h-48 flex rounded-3xl items-center justify-center mx-auto">
          <Image src="/images/banner.svg" alt="banner" width={300} height={200} className="w-full h-full object-cover rounded-3xl" />
        </div>
        <div className="px-5 pb-8 text-right">
          <p className="text-zinc-800 text-lg font-medium font-iranyekan leading-10 mb-1">
            مسیر پیشنهادی شما:  {careerMatch}

          </p>

          <div className="text-neutral-500 text-xs font-medium font-iranyekan leading-6 whitespace-pre-line">
            {description}
          </div>
        </div>
        <div className="sticky bottom-0 w-full bg-linear-to-b from-stone-50/0 via-stone-50/80 to-stone-50 pointer-events-none" />
        <button
          type="button"
          className="sticky bottom-4 mx-auto w-[85%] max-w-[320px] px-8 py-4 bg-linear-to-l from-[#8A9B77] to-[#6F805C] cursor-pointer rounded-[46px] flex justify-center items-center gap-3 text-white text-base font-medium font-iranyekan leading-6"
        >
          ذخیره مسیر شغلی من
        </button>
      </main>
    );
  }

  return (
    <main className="w-full min-h-dvh flex flex-col bg-stone-50 overflow-hidden">
      <header className="flex items-center gap-3 px-6 pt-11 pb-2 shrink-0">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 p-1 shrink-0 bg-stone-100 rounded-lg flex items-center justify-center"
            aria-label="سوال قبلی"
          >
            <ChevronRight />
          </button>
        ) : (
          <Link
            href="/"
            className="w-8 h-8 p-1 shrink-0 bg-stone-100 rounded-lg flex items-center justify-center"
            aria-label="بازگشت"
          >
            <ChevronRight />
          </Link>
        )}
        <div className="flex-1 flex items-center gap-2">
          <div className="min-w-0 h-2.5 rounded-xl border border-stone-300 overflow-hidden flex-1">
            <div
              className="h-full bg-[#8A9B77] rounded-xl transition-[width] duration-200"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="text-neutral-600 text-[10px] font-medium font-iranyekan leading-4 shrink-0 tabular-nums">
            سوال {currentStep + 1} از {totalSteps}
          </p>
        </div>
      </header>

      <h2 className="px-5 pt-4 text-zinc-800 text-xl font-medium font-iranyekan leading-8 max-w-[320px]">
        {question?.text}
      </h2>

      <div className="flex flex-col gap-6 px-6 pt-6 flex-1 min-h-0 overflow-auto">
        {question?.options.map((option) => {
          const isSelected = currentAnswer?.optionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectOption(question.id, option)}
              className={cn(
                "h-14 px-4 py-3 rounded-[32px] flex items-center gap-2.5 w-full text-right transition-colors",
                isSelected
                  ? "bg-linear-to-l from-[#8A9B77] to-[#6F805C] text-white outline-none"
                  : "outline outline-1 outline-offset-[-1px] outline-neutral-500 bg-white"
              )}
            >
              <span
                className={cn(
                  "text-base font-medium font-iranyekan leading-6",
                  isSelected ? "text-white" : "text-neutral-600"
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!currentAnswer}
        className="shrink-0 flex justify-between items-center gap-3 h-14 px-6 py-3 mb-8 bg-linear-to-l from-[#8A9B77] to-[#6F805C] rounded-[46px] w-[85%] self-center disabled:opacity-50 disabled:cursor-not-allowed text-white font-iranyekan"
      >
        <span className="text-base font-medium leading-6">انتخاب و ادامه</span>
        <ArrowIcon className="w-4 h-4 shrink-0" />
      </button>
    </main>
  );
}
