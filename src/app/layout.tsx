import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// next/font downloads Manrope at build time and serves it from our own site (no request to Google).
// One family for everything: headings, token numbers and interface text.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "QueueCare · live clinic queue",
  description:
    "A live clinic queue: urgent patients are seen first, everyone else is served fairly, and every patient can see their place and estimated wait.",
};

export const viewport: Viewport = { themeColor: "#1e3b2c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="flex flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[80rem] flex-1 px-4 sm:px-6">{children}</main>
        <SiteFooter />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
