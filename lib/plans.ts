export type Plan = 'free' | 'pro' | 'power';

export interface PlanLimits {
  maxLaunches: number;
  maxAiCalls: number;
  name: string;
  description: string;
  priceMonthly: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxLaunches: 1,
    maxAiCalls: 5,
    name: 'Free',
    description: 'Perfect for getting started',
    priceMonthly: 0
  },
  pro: {
    maxLaunches: 3,
    maxAiCalls: 100,
    name: 'Pro',
    description: 'For growing businesses',
    priceMonthly: 10
  },
  power: {
    maxLaunches: 10,
    maxAiCalls: 300,
    name: 'Power',
    description: 'For power users and agencies',
    priceMonthly: 30
  }
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canCreateLaunch(plan: Plan, currentLaunches: number): boolean {
  const limits = getPlanLimits(plan);
  return currentLaunches < limits.maxLaunches;
}

export function canMakeAiCall(plan: Plan, currentAiCalls: number): boolean {
  const limits = getPlanLimits(plan);
  return currentAiCalls < limits.maxAiCalls;
}

export function getUpgradeMessage(type: 'launches' | 'ai', currentPlan: Plan): string {
  const limits = getPlanLimits(currentPlan);
  
  if (type === 'launches') {
    if (currentPlan === 'free') {
      return `Free plan includes 1 launch slot. Archive or reset your current launch, or upgrade to create more.`;
    }
    return `You've reached your plan limit of ${limits.maxLaunches} launch slot${limits.maxLaunches === 1 ? '' : 's'}. Upgrade to create more launches.`;
  } else {
    return `You've reached your monthly AI limit of ${limits.maxAiCalls} calls. Upgrade to unlock more AI-powered features.`;
  }
}

export function isFreePlan(plan: Plan): boolean {
  return plan === 'free';
}

export function getNextPlan(currentPlan: Plan): Plan | null {
  switch (currentPlan) {
    case 'free': return 'pro';
    case 'pro': return 'power';
    case 'power': return null; // Already at highest tier
    default: return 'pro';
  }
}

