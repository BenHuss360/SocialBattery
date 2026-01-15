import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Social Battery - Share your social energy",
    template: "%s | Social Battery",
  },
  description:
    "Set and share your social battery level. Let friends know when you're open to plans or need recharge time.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Social Battery",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Social Battery",
    title: "Social Battery - Share your social energy",
    description:
      "Set and share your social battery level. Let friends know when you're open to plans or need recharge time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Battery - Share your social energy",
    description:
      "Set and share your social battery level. Let friends know when you're open to plans or need recharge time.",
  },
  keywords: [
    "social battery",
    "social energy",
    "introvert",
    "extrovert",
    "social status",
    "energy level",
    "mental health",
  ],
  authors: [{ name: "Social Battery" }],
  creator: "Social Battery",
};

// JSON-LD structured data for the website
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Social Battery",
  description:
    "Set and share your social battery level. Let friends know when you're open to plans or need recharge time.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://socialbattery.app",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Social Battery",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${nunito.variable} antialiased min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
