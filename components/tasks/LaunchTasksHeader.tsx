"use client";

import { useState } from "react";
import CreateTaskModal from "./CreateTaskModal";
import { Plus } from "lucide-react";

interface LaunchTasksHeaderProps {
    launchId: string;
}

export default function LaunchTasksHeader({ launchId }: LaunchTasksHeaderProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                    <h2
                        className="text-xl font-semibold text-[color:var(--heading)]"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                    >
                        Launch command centre
                    </h2>
                    <p
                        className="text-base text-[color:var(--muted)]"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                    >
                        Your upcoming and in-progress work for this launch
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all shadow-[var(--shadow-subtle)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--heading)] cursor-pointer"
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-[color:var(--heading)] theme-light:text-[color:var(--heading)]">
                      Add Task
                    </span>
                </button>
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                launchId={launchId}
            />
        </>
    );
}
