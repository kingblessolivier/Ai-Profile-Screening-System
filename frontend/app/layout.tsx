import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TalentAI — AI Recruitment Screening",
  description: "AI-powered candidate screening platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        ["--font-inter" as string]: "Arial, Helvetica, sans-serif",
        ["--font-display" as string]: "Arial, Helvetica, sans-serif",
      }}
    >
      <body className="min-h-full" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
