'use client';

import { Target, Calendar, CheckCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddLaunchCardProps {
    onAddLaunch?: () => void;
    variant?: 'card' | 'full';
}

export default function AddLaunchCard({ onAddLaunch, variant = 'card' }: AddLaunchCardProps) {
    if (variant === 'full') {
        return (
            <div
                className="group relative flex w-full flex-col items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-8 shadow-xl shadow-slate-950/60 transition-all hover:-translate-y-1 hover:border-emerald-500/30 sm:flex-row"
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
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <h3
                            className="text-2xl font-semibold text-slate-50"
                            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                        >
                            Create New Launch
                        </h3>
                    </div>
                    <p className="text-base text-slate-300 max-w-xl" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                        Ready to start something new? Plan your next product launch with AI-powered tools and timeline management.
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddLaunch?.();
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/20 transition-transform hover:-translate-y-0.5 hover:shadow-emerald-900/40"
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
            className="group relative flex h-[364px] w-full flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-6 shadow-xl shadow-slate-950/60 transition-all hover:-translate-y-1 hover:border-emerald-500/30"
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
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            New
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3
                            className="text-2xl font-semibold text-slate-50"
                            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                        >
                            Create New Launch
                        </h3>
                        <p className="text-sm text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                            Start planning your next launch with our AI-powered tools.
                        </p>
                    </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    {[
                        { icon: Target, text: "AI-powered planning" },
                        { icon: Calendar, text: "Timeline management" },
                        { icon: CheckCircle, text: "Task tracking" }
                    ].map((item) => (
                        <li key={item.text} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
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
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/20 transition-transform hover:-translate-y-0.5 hover:shadow-emerald-900/40"
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                    Create Launch
                </button>
            </div>
        </div>
    );
}
