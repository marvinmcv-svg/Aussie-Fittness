import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aussie Fitness Cookbook — 135 High-Protein Recipes",
  description: "Low calorie & high protein recipes for fitness goals. Browse 135 macro-friendly meals, plan your week, and generate shopping lists instantly.",
  keywords: ["fitness cookbook", "high protein recipes", "low calorie meals", "meal prep", "macro friendly", "aussie fitness"],
  authors: [{ name: "Aussie Fitness" }],
};

export const viewport = {
  themeColor: "#0a0f0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
