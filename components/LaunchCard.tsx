"use client";

import Link from "next/link";

type Props = {
  id: string; // ensure this is the Supabase UUID, not a fallback
  title: string;
  completedTasks: number;
  totalTasks: number;
};

export default function LaunchCard({ id, title, completedTasks, totalTasks }: Props) {
  const percent = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

  return (
    <Link href={`/launch/${id}`} className="block rounded-lg border border-[#2b273c]/20 bg-white px-4 py-3 shadow-[0_2px_8px_-1px_rgba(9,18,55,0.08)] hover:shadow-[0_4px_12px_-2px_rgba(9,18,55,0.12)] transition-shadow">
      <div className="text-sm font-medium truncate text-[#091237]">{title}</div>
      <div className="mt-2 text-xs text-[#091237]/60">{completedTasks} / {totalTasks} tasks • {percent}%</div>
      <div className="mt-3 h-2 rounded bg-[#2b273c]/10 overflow-hidden">
        <div className="h-full bg-[#f84867]" style={{ width: `${percent}%` }} />
      </div>
    </Link>
  );
}
