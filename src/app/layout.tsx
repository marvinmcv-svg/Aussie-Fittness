import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/Providers";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
};

export const viewport: Viewport = {
  themeColor: "#0a0f0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for the website (helps Google understand the site)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aussie Fitness Cookbook",
    description: "135 high-protein, low-calorie recipes for fitness goals.",
    url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
