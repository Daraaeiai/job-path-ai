import type { Metadata } from "next";
import localFont from "next/font/local";
import { Agbalumo } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { MauticTracking } from "@/components/mautic/MauticTracking";
import { PostHogTracking } from "@/components/posthog/PostHogTracking";
import "./globals.css";

const agbalumo = Agbalumo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-agbalumo",
});

const morabba = localFont({
  src: [
    { path: "../../public/fonts/morabba/Morabba-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/morabba/Morabba-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/morabba/Morabba-Medium.ttf", weight: "500" },
  ],
  variable: "--font-morabba",
});

const iranYekan = localFont({
  src: [
    {
      path: "../../public/fonts/iranyekan/IRANYekanX-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/iranyekan/IRANYekanX-Medium.ttf",
      weight: "500",
    },
    {
      path: "../../public/fonts/iranyekan/IRANYekanX-Bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-iranyekan",
});

export const metadata: Metadata = {
  title: "Job Path AI | مسیر شغلی",
  description: "با پاسخ به سوالات، شغل مناسب خود را پیدا کنید",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${agbalumo.variable} ${morabba.variable} ${iranYekan.variable}`}
    >
      <body className="min-h-screen flex flex-col items-center bg-background text-foreground antialiased font-iranyekan">
        <div className="mobile-only-container w-full flex flex-col">
          <QueryProvider>{children}</QueryProvider>
        </div>
        <MauticTracking />
        <PostHogTracking />
      </body>
    </html>
  );
}
