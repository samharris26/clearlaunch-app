// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "ClearLaunch – Confident product launches for busy founders",
  description: "Plan and manage product launches with ease.",
  icons: {
    icon: [
      { url: "/ClearLaunch-favicon.ico", sizes: "any" },
    ],
    shortcut: "/ClearLaunch-favicon.ico",
    apple: "/ClearLaunch-favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors" suppressHydrationWarning>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
