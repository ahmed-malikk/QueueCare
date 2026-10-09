import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// next/font downloads Archivo at build time and serves it from our own site (no request to Google).
// The width axis gives the extra-condensed token numbers from the same family as the text.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "QueueCare · live clinic queue",
  description:
    "A live clinic queue: urgent patients are seen first, everyone else is served fairly, and every patient can see their place and estimated wait.",
};

export const viewport: Viewport = { themeColor: "#0f766e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="flex flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4">{children}</main>
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
