import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LangProvider } from "@/providers/LangProvider";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Tagzo AI — UI to Code",
  description: "UI 이미지를 HTML 컴포넌트 코드로 즉시 변환합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LangProvider>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
