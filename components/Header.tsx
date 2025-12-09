"use client";

import React from "react";

export function Header({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-[color:var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="flex items-center justify-between gap-6 py-4 lg:py-5 px-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
          {title}
        </h1>
        <div className="flex items-center gap-3">
          {/* search placeholder */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] px-3 py-1.5 text-sm text-[color:var(--muted)] w-64 shadow-[var(--shadow-subtle)]">
            <div className="h-3.5 w-3.5 rounded-sm border border-[color:var(--border)]" />
            <span className="text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Search
            </span>
          </div>
          {/* profile avatar placeholder */}
          <div className="h-8 w-8 rounded-full bg-[var(--card)] border border-[color:var(--border)] text-[color:var(--text)] text-xs flex items-center justify-center font-medium shadow-[var(--shadow-subtle)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            SH
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;


