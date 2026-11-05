import type { Metadata, Viewport } from "next";
import { inter } from "./fonts";
import "./globals.css";



import { SITE_URL as siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AussieFit — High-Protein Recipes, Meal Plans & Shopping Lists",
  description: "Low calorie & high protein recipes for fitness goals. Browse 135 macro-friendly meals, plan your week, and generate shopping lists instantly.",
  keywords: ["fitness cookbook", "high protein recipes", "low calorie meals", "meal prep", "macro friendly", "aussie fitness"],
  authors: [{ name: "Aussie Fitness" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AussieFit",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "Aussie Fitness Cookbook — 135 High-Protein Recipes",
    description: "Low calorie & high protein recipes for fitness goals. Browse 135 macro-friendly meals, plan your week, and generate shopping lists instantly.",
    type: "website",
    siteName: "Aussie Fitness Cookbook",
    images: [
      {
        url: "/recipes/hero-spread.png",
        width: 1344,
        height: 768,
        alt: "Assorted healthy high-protein fitness meals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aussie Fitness Cookbook — 135 High-Protein Recipes",
    description: "Low calorie & high protein recipes for fitness goals. Plan your week, track macros, generate shopping lists.",
    images: ["/recipes/hero-spread.png"],
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Aussie Fitness Cookbook",
      description: "135 high-protein, low-calorie recipes for fitness goals.",
      url: siteUrl,
    }),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
