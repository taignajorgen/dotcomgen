import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import GlobalFeedbackModal from "../components/GlobalFeedbackModal";

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
    "ahrefs-site-verification": "30eb158d136fc054494f26e5a58af70efad726298c55a0a0aca284cfff682716",
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
        <meta name="ahrefs-site-verification" content="30eb158d136fc054494f26e5a58af70efad726298c55a0a0aca284cfff682716" />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="IjJIfmyvLfMEnGdD3J9sxQ"
          async
        />
      </head>
      <body>
        {children}
        <Footer />
        <GlobalFeedbackModal />
      </body>
    </html>
  );
}
