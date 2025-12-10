'use client';

import { Target, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddLaunchCardProps {
    onAddLaunch?: () => void;
    variant?: 'card' | 'full';
}

export default function AddLaunchCard({ onAddLaunch, variant = 'card' }: AddLaunchCardProps) {
    if (variant === 'full') {
        return (
            <div
                className="group relative flex w-full flex-col items-center justify-between gap-6 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--border-strong)] sm:flex-row"
                onClick={onAddLaunch}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onAddLaunch?.();
                    }
                }}
            >
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/8 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative flex flex-col gap-2">
                    <h3
                        className="text-2xl font-semibold text-[color:var(--heading)]"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                    >
                        Create New Launch
                    </h3>
                    <p className="text-base text-[color:var(--muted)] max-w-xl" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                        Ready to start something new? Plan your next product launch with AI-powered tools and timeline management.
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddLaunch?.();
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)]"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                    >
                        Create Launch
                    </button>
                </div>
            </div>
        );
    }

    // Card variant (Vertical)
    return (
        <div
            className="group relative flex h-[364px] w-full flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
            onClick={onAddLaunch}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onAddLaunch?.();
                }
            }}
        >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/8 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-end">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600">
                            New
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3
                            className="text-2xl font-semibold text-[color:var(--heading)]"
                            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                        >
                            Create New Launch
                        </h3>
                        <p className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                            Start planning your next launch with our AI-powered tools.
                        </p>
                    </div>
                </div>

                <ul className="space-y-3 text-sm text-[color:var(--text)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    {[
                        { icon: Target, text: "AI-powered planning" },
                        { icon: Calendar, text: "Timeline management" },
                        { icon: CheckCircle, text: "Task tracking" }
                    ].map((item) => (
                        <li key={item.text} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                                <item.icon className="h-3 w-3" />
                            </div>
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative mt-6">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddLaunch?.();
                    }}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)]"
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                    Create Launch
                </button>
            </div>
        </div>
    );
}
