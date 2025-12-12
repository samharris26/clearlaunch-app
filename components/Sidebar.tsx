// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Rocket, FileText, BarChart3, Settings, LogOut, Clock } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/launches", label: "Launches", icon: Rocket },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomNav = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/logout", label: "Logout", icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen hidden w-64 flex-col border-r border-[color:var(--border)] bg-[var(--surface)] p-7 text-[color:var(--text)] md:flex overflow-y-auto">
      {/* Logo */}
      <Link href="/dashboard" className="mb-12 flex items-center hover:opacity-80 transition-opacity">
        <img
          src="/ClearLaunch-logo.svg"
          alt="ClearLaunch"
          className="h-9 w-auto"
        />
      </Link>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col justify-between gap-6">
        {/* Top Menu Items */}
        <div className="space-y-1.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const isLaunchesRoute = href === "/launches" && pathname?.startsWith("/launch/");
            const active =
              isLaunchesRoute ||
              pathname === href ||
              (href !== "/" && pathname?.startsWith(href));
            const isTemplates = href === "/templates";
            return (
              <div
                key={href}
                onClick={isTemplates ? (e) => e.preventDefault() : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${isTemplates ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${active && !isTemplates
                  ? "bg-[var(--card)] text-[color:var(--heading)] font-semibold border border-[color:var(--border-strong)] shadow-[var(--shadow-subtle)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--card)_70%,transparent)]"
                  }`}
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                {isTemplates ? (
                  <>
                    <Icon className="h-4 w-4 text-[color:var(--muted)]" />
                    <span className="flex items-center gap-2">
                      {label}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--card)_90%,transparent)] border border-[color:var(--border)] px-2 py-0.5 text-[0.625rem] font-medium text-[color:var(--muted)]">
                        <Clock className="h-3 w-3" />
                        Soon
                      </span>
                    </span>
                  </>
                ) : (
                  <Link
                    href={href}
                    className="flex items-center gap-3 w-full"
                  >
                    <Icon className="h-4 w-4 text-[color:var(--muted)]" />
                    <span>{label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Menu Items */}
        <div className="space-y-2">
          <div className="h-px bg-[color:var(--border)]"></div>
          <div className="space-y-1.5">
            {bottomNav.map(({ href, label, icon: Icon }) => {
              const isLogout = href === "/logout";
              const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${active
                    ? "bg-[var(--card)] text-[color:var(--heading)] font-semibold border border-[color:var(--border-strong)] shadow-[var(--shadow-subtle)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--card)_70%,transparent)]"
                    }`}
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[color:var(--heading)]" : "text-[color:var(--muted)]"}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
