"use client";

import Link from "next/link";
import { Plan } from "@/lib/plans";
import { getPlanLimits } from "@/lib/plans";
import { Crown, Zap } from "lucide-react";

interface PlanStatusProps {
  plan: Plan;
  currentLaunches: number;
  maxLaunches: number;
}

export default function PlanStatus({ plan, currentLaunches, maxLaunches }: PlanStatusProps) {
  const limits = getPlanLimits(plan);
  const isFree = plan === 'free';
  const isAtLimit = currentLaunches >= maxLaunches;
  const launchesRemaining = Math.max(0, maxLaunches - currentLaunches);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
        {isFree ? (
          <span className="text-xs font-medium text-slate-600">Free Plan</span>
        ) : plan === 'pro' ? (
          <>
            <Zap className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Pro</span>
          </>
        ) : (
          <>
            <Crown className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Team</span>
          </>
        )}
      </div>
      
      {isAtLimit && (
        <Link
          href="/pricing"
          className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 transition-colors"
        >
          Upgrade
        </Link>
      )}
      
      {!isAtLimit && (
        <span className="text-xs text-slate-500">
          {launchesRemaining} launch{launchesRemaining === 1 ? '' : 'es'} remaining
        </span>
      )}
    </div>
  );
}

