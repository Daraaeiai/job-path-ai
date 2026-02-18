"use client";

import { useRef, useState, useCallback } from "react";
import { HeroSection } from "@/page-views/HeroSection";
import { HowItWorksSection } from "@/page-views/HowItWorksSection";
import { LoginSection } from "@/page-views/LoginSection";

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  const scrollToSection = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const section = el.children[index] as HTMLElement;
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(index);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const sectionHeight = el.clientHeight;
    const index = Math.round(scrollTop / sectionHeight);
    setActiveSection(Math.min(Math.max(0, index), 2));
  }, []);

  return (
    <div
      ref={scrollRef}
      className="h-dvh w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-stone-50"
      onScroll={handleScroll}
    >
      <HeroSection
        activeSection={activeSection}
        onCtaClick={() => scrollToSection(1)}
        onDotClick={scrollToSection}
      />
      <HowItWorksSection onNext={() => scrollToSection(2)} />
      <LoginSection />
    </div>
  );
}
