import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dotcomgen — Find Available .com Domains",
  description: "AI-powered .com domain name generator. Find available, brandable domain names for your next big idea.",
  other: {
    "impact-site-verification": "3a8ccb66-f844-4b16-a28f-23e09f4758ec",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="impact-site-verification" content="3a8ccb66-f844-4b16-a28f-23e09f4758ec" {...({ value: "3a8ccb66-f844-4b16-a28f-23e09f4758ec" } as Record<string, string>)} />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
