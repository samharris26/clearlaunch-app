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
  { href: "/privacy", label: "Privacy", icon: FileText },
  { href: "/logout", label: "Logout", icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r border-slate-800/70 bg-slate-950 p-6 md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="mb-10 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center">
          <span className="text-xs font-semibold tracking-tight text-slate-950" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            CL
          </span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight text-slate-100" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
            ClearLaunch
          </span>
          <span className="text-xs text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            Launch with clarity
          </span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col justify-between">
        {/* Top Menu Items */}
        <div className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const isLaunchesRoute = href === "/launches" && pathname?.startsWith("/launch/");
            const active =
              isLaunchesRoute ||
              pathname === href ||
              (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active
                  ? "bg-slate-900/80 text-slate-50 font-medium border border-slate-800"
                  : "text-slate-300 hover:text-slate-50 hover:bg-slate-900/40"
                  }`}
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                <Icon className="h-4 w-4" />
                <span className="flex items-center gap-2">
                  {label}
                  {href === "/templates" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[0.625rem] font-medium text-slate-400">
                      <Clock className="h-3 w-3" />
                      Soon
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Menu Items */}
        <div className="space-y-1">
          <div className="h-px bg-slate-800/70"></div>
          <div className="space-y-1">
            {bottomNav.map(({ href, label, icon: Icon }) => {
              const isLogout = href === "/logout";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${isLogout
                    ? "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
                    : "text-slate-300 hover:text-slate-50 hover:bg-slate-900/40"
                    }`}
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  <Icon className="h-4 w-4" />
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
