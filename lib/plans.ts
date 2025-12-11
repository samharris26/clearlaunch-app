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
    maxAiCalls: 20,
    name: 'Free',
    description: 'Perfect for getting started',
    priceMonthly: 0
  },
  pro: {
    maxLaunches: 5, // 5 launches for Pro
    maxAiCalls: 100,
    name: 'Pro',
    description: 'For growing businesses',
    priceMonthly: 10
  },
  power: {
    maxLaunches: Infinity, // Unlimited launches for Power
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
  // For unlimited plans (Infinity), always allow
  if (limits.maxLaunches === Infinity) {
    return true;
  }
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
      return `You've reached the Free plan limit of 1 launch. Upgrade to Pro to create more launches.`;
    }
    if (currentPlan === 'pro') {
      return `You've reached your Pro plan limit of ${limits.maxLaunches} launches. Upgrade to Power for unlimited launches.`;
    }
    // Power has unlimited launches, so this shouldn't happen
    return `You've reached your plan limit. Upgrade to create more launches.`;
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

