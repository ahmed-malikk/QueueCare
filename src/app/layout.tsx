import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueueCare · live clinic queue",
  description:
    "A live clinic queue: urgent patients are seen first, everyone else is served fairly, and every patient can see their place and estimated wait.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <span className="brand">QueueCare</span>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
