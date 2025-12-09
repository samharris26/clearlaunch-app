"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./Providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      className="inline-flex items-center gap-3 rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-2 py-1 text-sm font-medium text-[color:var(--text)] shadow-[var(--shadow-subtle)] transition-all hover:border-[color:var(--border-strong)] cursor-pointer"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      <div className="relative flex items-center gap-3">
        <div className="flex h-5 w-9 items-center rounded-full bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] transition-colors">
          <div
            className={`h-4 w-4 rounded-full bg-[color:var(--text)] transition-transform`}
            style={{ transform: isLight ? "translateX(0.2rem)" : "translateX(1.6rem)" }}
          />
        </div>
        {isLight ? (
          <span className="flex items-center gap-1 text-[color:var(--heading)]">
            <Sun className="h-4 w-4 text-[color:var(--muted)]" />
            Light
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[color:var(--heading)]">
            <Moon className="h-4 w-4 text-[color:var(--muted)]" />
            Dark
          </span>
        )}
      </div>
    </button>
  );
}

export default ThemeToggle;

