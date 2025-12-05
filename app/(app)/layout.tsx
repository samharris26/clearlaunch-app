// app/(app)/layout.tsx
"use client";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>

      {/* Slideout removed; individual launch now uses dedicated route */}
    </div>
  );
}
