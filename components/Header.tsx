"use client";

import React from "react";

export function Header({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="flex items-center justify-between gap-6 py-4 lg:py-5 px-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-slate-50" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
          {title}
        </h1>
        <div className="flex items-center gap-3">
          {/* search placeholder */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-300 w-64">
            <div className="h-3.5 w-3.5 rounded-sm border border-slate-700/50" />
            <span className="text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Search
            </span>
          </div>
          {/* profile avatar placeholder */}
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center font-medium" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            SH
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;


