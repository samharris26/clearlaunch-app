"use client";

import Link from "next/link";
import { Home, Rocket, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-subtle)]">
            <Rocket className="h-10 w-10 text-[color:var(--primary)]" />
          </div>
          <h1
            className="text-6xl font-bold text-[color:var(--heading)] sm:text-7xl"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            }}
          >
            404
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <h2
            className="text-2xl font-semibold text-[color:var(--heading)] sm:text-3xl"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            }}
          >
            Page not found
          </h2>
          <p
            className="text-base text-[color:var(--muted)] leading-7 max-w-md mx-auto"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            Looks like this launch plan got lost in space. The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-[color:var(--text)] shadow-[var(--shadow-subtle)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color-mix(in_srgb,var(--surface)_94%,transparent)]"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
