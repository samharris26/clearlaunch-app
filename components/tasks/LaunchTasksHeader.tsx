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
                        className="text-xl font-semibold text-slate-50"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                    >
                        Launch command centre
                    </h2>
                    <p
                        className="text-base text-slate-300"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                    >
                        Your upcoming and in-progress work for this launch
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900 hover:border-sky-500/50 hover:text-sky-400 hover:shadow-lg hover:shadow-sky-900/20 transition-all"
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                    <Plus className="h-4 w-4" />
                    Add Task
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
