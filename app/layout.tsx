import type { Metadata } from "next";
import { WhatsAppButton } from "@/components/support/whatsapp-button";
import { AuthProvider } from "@/context/authContext";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aviex Hair Recovery",
  description:
    "AI-powered personalized hair recovery kits with progress tracking, subscription care, and a 90-day visible progress guarantee.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <AuthProvider initialUser={user}>
          {children}
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
