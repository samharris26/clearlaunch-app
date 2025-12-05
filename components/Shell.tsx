"use client";

import React from "react";
import Sidebar from "./Sidebar";

export type ShellProps = {
  children: React.ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-60">
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export default Shell;


