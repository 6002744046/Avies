import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SelfiE Hair Recovery",
  description:
    "AI-powered personalized hair recovery kits with progress tracking, subscription care, and a 90-day visible progress guarantee.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
