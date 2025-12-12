import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, createClient } from "@/lib/supabase/server";
import HeaderBanner from "@/components/dashboard/HeaderBanner";
import SectionHeader from "@/components/dashboard/SectionHeader";
import ToolkitCard from "@/components/dashboard/ToolkitCard";
import CTABanner from "@/components/dashboard/CTABanner";
import DashboardClient from "./DashboardClient";
import { FileText, BarChart3 } from "lucide-react";

type Launch = {
  id: string;
  name: string;
  type: string;
  progress: number;
  completed: number;
  total: number;
  phase: string;
  launchDate?: string;
  nextTask?: string;
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }
  const userId = user.id;

  const supabase = await createClient();
  
  // Check for business profile first (new approach)
  const { data: businessProfile } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  // Fallback: check onboarded flag for existing users
  const { data: profile } = await supabase
    .from("users")
    .select("onboarded,plan")
    .eq("userId", userId)
    .maybeSingle();

  // Redirect to onboarding if no business profile exists
  // Keep onboarded check as fallback for existing users who haven't migrated yet
  if (!businessProfile && (!profile || profile.onboarded === false)) {
    redirect("/onboarding");
  }

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "friend";

  // Get user plan
  const userPlan = (profile?.plan as "free" | "pro" | "power") || "free";

  // Fetch active launches (exclude deleted and archived)
  const { data: launchesData, error: launchesError } = await supabase
    .from("launches")
    .select("*")
    .eq("userId", userId)
    .neq("status", "deleted")
    .neq("status", "archived")
    .in("status", ["active", "planning"])
    .order("target_date", { ascending: true })
    .order("createdAt", { ascending: false });

  if (launchesError) {
    console.error("Error fetching launches:", launchesError);
  }

  // Transform Supabase data to match expected Launch type
  const launches: Launch[] = await Promise.all((launchesData || []).map(async (launch) => {
    // Get all tasks for this launch to calculate accurate counts
    const { data: allTasks } = await supabase
      .from("tasks")
      .select("status, title")
      .eq("launchId", launch.id);

    const totalTasks = allTasks?.length || 0;
    const completedTasks = allTasks?.filter(
      (task) => task.status === "completed" || task.status === "done"
    ).length || 0;

    // Get the next incomplete task for this launch
    // Match the same query logic as the task view: order by order, filter out completed
    // Use .or() to filter for valid incomplete statuses
    const { data: nextTaskData } = await supabase
      .from("tasks")
      .select("title, status, order")
      .eq("launchId", launch.id)
      .or("status.eq.active,status.eq.todo,status.eq.in_progress,status.is.null")
      .order("order", { ascending: true })
      .order("due_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Dynamic Phase Logic
    let phase = "Research & Setup";
    if (progress >= 90) phase = "Final Push";
    else if (progress >= 50) phase = "Execution";
    else if (progress >= 20) phase = "Planning";

    return {
      id: launch.id,
      name: launch.launchName || "Untitled Launch",
      type: launch.launchType || "Product",
      progress: progress,
      completed: completedTasks,
      total: totalTasks,
      phase: phase,
      launchDate: launch.target_date || launch.launch_date,
      nextTask: nextTaskData?.title || "No tasks yet",
    };
  }));

  // Calculate total completed tasks across all launches
  const totalCompletedTasks = launches.reduce((sum, launch) => sum + launch.completed, 0);
  const totalLaunches = launches.length;

  // Check if user can create more launches
  const { getPlanLimits } = await import("@/lib/plans");
  const planLimits = getPlanLimits(userPlan);
  const canCreateLaunch = totalLaunches < planLimits.maxLaunches;
  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-14 px-2 sm:px-4 pt-14 pb-24">
      {/* Header Banner */}
      <HeaderBanner
        userName={displayName}
        statusMessage={
          totalLaunches === 0
            ? "Ready to start your first launch?"
            : `You have ${totalLaunches} active launch${totalLaunches === 1 ? '' : 'es'} and ${totalCompletedTasks} completed tasks`
        }
      />

      {/* My Launches Section */}
      <div className="flex w-full max-w-6xl flex-col gap-3">
        <SectionHeader
          title="My launches"
          description="Track progress and manage your active launches"
        />

        {/* Launch Cards with Promotional Card */}
        <DashboardClient launches={launches} />
      </div>

      {/* Your Toolkit Section */}
      <div className="flex w-full max-w-6xl flex-col gap-3">
        <SectionHeader
          title="Your toolkit"
          description="Essential tools and resources for successful launches"
        />

        {/* Toolkit Cards Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolkitCard
            title="Analytics Dashboard"
            description="Track your launch performance with detailed analytics"
            buttonText="View Analytics"
            href="/analytics"
            icon={<BarChart3 className="h-6 w-6 text-cyan-600" />}
          />
          <ToolkitCard
            title="Launch Templates"
            description="Pre-built templates for different types of launches to get you started quickly"
            buttonText="Browse Templates"
            comingSoon
            hideChip
            icon={<FileText className="h-6 w-6 text-cyan-600" />}
          />
        </div>
      </div>
      <div className="mb-20"></div>
    </div >
  );
}
