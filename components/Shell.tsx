"use client";

import React from "react";
import Sidebar from "./Sidebar";

export type ShellProps = {
  children: React.ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="pl-60">
        <div className="px-8 py-8">{children}</div>
      </div>
    </div>
  );
}

export default Shell;


