import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "たくらむ",
  description: "AIが生成する、エモーショナルな飲食店紹介",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}