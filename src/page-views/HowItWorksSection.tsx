"use client";

import { siteConfig } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

interface HowItWorksSectionProps {
  onNext?: () => void;
}

export function HowItWorksSection({ onNext }: HowItWorksSectionProps) {
  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden snap-start snap-always flex flex-col justify-center items-center bg-white px-8 gap-1">

      <div className="absolute bg-[#F8F8F8] w-full h-[75%] top-0 right-0 z-10" />

      <Image src="/images/polygon.svg" alt="polygon" width={700} height={700} className="absolute left-0 bottom-12 scale-120 z-20" />

      <div className="z-10 flex justify-center my-4">
        <Image src="/images/homunculus-1.svg" alt="homunculus" width={220} height={220} />
      </div>
      <div className="z-30 text-center">
        <h2
          className={cn(
            "mx-auto text-zinc-800 text-3xl font-bold leading-9",
            "font-morabba"
          )}
        >
          {siteConfig.howItWorksTitle(siteConfig.platformName)}
        </h2>
      </div>
      <div className="z-30 px-[17.19px] pt-6 text-center">
        <p className="mx-auto text-neutral-500 text-sm font-medium leading-relaxed font-iranyekan whitespace-pre-line">
          {`ما ازت چند سؤال چهارگزینه‌ای می‌پرسیم. جواب‌هات توسط هوش مصنوعی تحلیل می‌شه تا:
سبک کاری‌ات مشخص بشه
توانمندی‌هات شناسایی بشه
مسیرهای شغلی مناسب بهت پیشنهاد داده بشه
هیچ جواب درست یا غلطی وجود نداره، فقط خودِ واقعی‌ات باش❗️`}
        </p>
      </div>
      <div className="relative z-30 flex-1 flex flex-col justify-end items-center pb-9">
        <button
          type="button"
          onClick={onNext}
          aria-label="ادامه"
          className="w-12 h-12 p-1 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
        >
          <ArrowDown className="text-black" />
        </button>
      </div>
    </section>
  );
}
