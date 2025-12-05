// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "ClearLaunch – Confident product launches for busy founders",
  description: "Plan and manage product launches with ease.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased" suppressHydrationWarning>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
