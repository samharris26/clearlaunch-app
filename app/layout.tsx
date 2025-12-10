// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "ClearLaunch – Confident product launches for busy founders",
  description: "Plan and manage product launches with ease.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('cl-theme');
                  const theme = stored === 'dark' ? 'dark' : 'light';
                  document.documentElement.dataset.theme = theme;
                  if (theme === 'dark') {
                    document.documentElement.classList.add('theme-dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
