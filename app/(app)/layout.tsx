// app/(app)/layout.tsx
"use client";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <Sidebar />
      <div className="fixed right-4 top-4 z-20 md:hidden">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Slideout removed; individual launch now uses dedicated route */}
    </div>
  );
}
