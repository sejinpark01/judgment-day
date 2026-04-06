// client/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider"; // ✅ 추가
import { Navbar } from "@/components/Navbar"; // ✅ Navbar 임포트 - Ver 2026.03.20
import { Analytics } from "@vercel/analytics/next"  // Vercel 웹분석 추가 - Ver 2026.04.06
import { SpeedInsights } from "@vercel/speed-insights/next" // Vercel 속도 측정 추가 - Ver 2026.04.06

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "심판의 날",
  description: "교통사고 과실 비율 투표 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ✅ suppressHydrationWarning 추가 필수!
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ✅ ThemeProvider로 감싸기 */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar /> {/* ✅ 여기에 한 줄 추가! (모든 페이지 상단에 헤더 고정) */}
          {children}
          <Analytics />       {/* 방문자 분석 센서 */}
          <SpeedInsights />   {/* 속도 측정 센서 */}
        </ThemeProvider>
      </body>
    </html>
  );
}