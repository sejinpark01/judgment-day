// client/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider"; // ✅ 추가

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}