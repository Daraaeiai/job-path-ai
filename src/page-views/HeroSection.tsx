"use client";

import { siteConfig } from "@/lib/data/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  onCtaClick?: () => void;
  onDotClick?: (index: number) => void;
  activeSection?: number;
}

const heroImages = [
  { src: "/images/homunculus-1.svg", alt: "Character 1" },
  { src: "/images/homunculus-2.svg", alt: "Character 2" },
  { src: "/images/homunculus-3.svg", alt: "Character 3" },
];

export function HeroSection({
  onCtaClick,
  onDotClick,
  activeSection = 0,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // تایمر برای تغییر اسلاید هر 2.5 ثانیه (1 ثانیه مکث + زمان ترنزیشن)
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // تابع برای تعیین موقعیت هر کارت نسبت به کارت فعال
  const getCardStyle = (index: number) => {
    // محاسبه فاصله این کارت از کارت فعال (در یک دایره ۳ تایی)
    // 0: وسط، 1: راست، 2: چپ (چون 2 هم‌ارز -1 است)
    const position = (index - activeIndex + heroImages.length) % heroImages.length;

    if (position === 0) {
      // استایل کارت وسط (Active)
      return "z-20 scale-105 opacity-100 blur-0 translate-x-0";
    } else if (position === 1) {
      // استایل کارت سمت راست
      return "z-10 scale-90 opacity-80 blur-[2px] translate-x-[105%]";
    } else {
      // استایل کارت سمت چپ (position === 2)
      return "z-10 scale-90 opacity-80 blur-[2px] -translate-x-[105%]";
    }
  };

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden snap-start snap-always flex flex-col pt-12 gap-3 bg-[#F6F8F1]">
      <div className="relative z-10 flex justify-center">
        <div className="w-12 h-12 p-2 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <Image src="/images/logo.svg" alt="logo" width={36} height={36} />
        </div>
      </div>
      <div className="relative z-10 text-center">
        <h1
          className={cn(
            "w-80 mx-auto text-zinc-800 text-2xl font-bold leading-9",
            "font-morabba"
          )}
        >
          {siteConfig.heroTitle}
        </h1>
      </div>
      <div className="relative z-10 text-center mt-2">
        <p className="w-80 mx-auto text-neutral-500 text-xs font-medium leading-5 font-iranyekan">
          {siteConfig.heroDescription}
        </p>
      </div>

      {/* --- Carousel Container --- */}
      <div className="relative w-full flex-1 flex flex-col justify-center items-center overflow-hidden h-64">
        <div className="relative w-44 h-52 flex items-center justify-center">
          {heroImages.map((item, index) => (
            <div
              key={index}
              className={cn(
                "absolute top-0 w-full h-full bg-[#FAF9E3] rounded-4xl border-4 border-white shadow-sm flex items-center justify-center transition-all duration-700 ease-in-out will-change-transform",
                getCardStyle(index)
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={150}
                height={150}
                className="object-contain w-[80%] h-[80%]"
                priority={index === 0} // لود سریع‌تر عکس اول
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col justify-end pb-8 px-6">
        <Button
          className="w-full max-w-[320px] mx-auto font-iranyekan bg-linear-to-l from-[#8A9B77] to-[#6F805C] cursor-pointer"
          onClick={onCtaClick}
        >
          {siteConfig.ctaStart}
        </Button>
      </div>
    </section>
  );
}