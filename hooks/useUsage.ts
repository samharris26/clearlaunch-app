"use client";

import { useState, useEffect } from "react";
import { Plan } from "@/lib/plans";

interface UsageData {
  plan: Plan;
  currentLaunches: number;
  maxLaunches: number;
  currentAiCalls: number;
  maxAiCalls: number;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use API route instead of direct server action call for better reliability
      const response = await fetch("/api/usage", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setUsage(data);
    } catch (err) {
      console.error("Error fetching usage:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch usage data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const canCreateLaunch = usage ? usage.currentLaunches < usage.maxLaunches : false;
  const canMakeAiCall = usage ? usage.currentAiCalls < usage.maxAiCalls : false;

  const launchesRemaining = usage ? Math.max(0, usage.maxLaunches - usage.currentLaunches) : 0;
  const aiCallsRemaining = usage ? Math.max(0, usage.maxAiCalls - usage.currentAiCalls) : 0;

  return {
    usage,
    loading,
    error,
    canCreateLaunch,
    canMakeAiCall,
    launchesRemaining,
    aiCallsRemaining,
    refetch: fetchUsage
  };
}
