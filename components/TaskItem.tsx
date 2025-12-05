"use client";

import React from "react";

export type TaskItemProps = {
  title: string;
  description: string;
  completed: boolean;
  onToggleComplete?: () => void;
};

export function TaskItem({ title, description, completed, onToggleComplete }: TaskItemProps) {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  return (
    <div className="rounded-lg border border-[#2b273c]/10 bg-white p-4 shadow-sm shadow-[#091237]/5">
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-[#2b273c]/30 text-[#f84867] focus:ring-[#f84867]"
            checked={completed}
            onChange={onToggleComplete}
          />
          <span className={`text-sm font-medium tracking-tight ${completed ? "line-through text-[#091237]/40" : "text-[#091237]/90"}`}>{title}</span>
        </label>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center justify-center rounded-sm border border-[#2b273c]/20 px-2 py-1 text-xs text-[#091237]/70 hover:bg-[#2b273c]/5 transition-colors"
        >
          <span className="mr-1">Details</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm text-[#091237]/70">
          {description || "No description provided."}
        </div>
      )}
    </div>
  );
}

export default TaskItem;


