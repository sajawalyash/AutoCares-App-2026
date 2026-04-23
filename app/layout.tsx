import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsClient } from '@/components/analytics'

// ✅ Optimize fonts (avoid unused vars + enable display swap)
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

// ✅ SEO + Performance Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"), // 🔥 change this
  title: {
    default: "AutoCares - Roadside Assistance",
    template: "%s | AutoCares",
  },
  description:
    "Quick roadside help and AI-based vehicle troubleshooting platform.",
  keywords: [
    "roadside assistance",
    "vehicle help",
    "car breakdown",
    "AutoCares",
    "AI vehicle diagnostics",
  ],
  authors: [{ name: "AutoCares Team" }],
  creator: "AutoCares",

  // ✅ Open Graph (for social sharing)
  openGraph: {
    title: "AutoCares",
    description:
      "AI-powered roadside assistance and vehicle troubleshooting.",
    url: "https://your-domain.com",
    siteName: "AutoCares",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "AutoCares Logo",
      },
    ],
    type: "website",
  },

  // ✅ Icons
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

// ✅ Viewport optimized
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0066FF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <AnalyticsClient />
      </body>
    </html>
  );
}
