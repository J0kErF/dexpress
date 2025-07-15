// app/layout.tsx
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import TopBar from "@/components/custom/TopBar";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dexpress",
  description: "מערכת משלוחים וניהול חכם",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  // Apply bottom padding only for /store routes

  return (
    <ClerkProvider>
      <html lang="he" dir="rtl">
        <body className={`bg-background text-foreground`}>
          <TopBar />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
