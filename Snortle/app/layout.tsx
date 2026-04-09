import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clara — Your AI Doctor",
  description: "Primary care, supported by AI, that never closes, never rushes you, and never forgets the details.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
