import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snortle — Your AI Doctor",
  description: "AI-powered health platform backed by board-certified clinicians.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
