import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/dashboard/SectionHeader";
import LaunchCardNew from "@/components/dashboard/LaunchCardNew";
import CTABanner from "@/components/dashboard/CTABanner";
import LaunchesPageClient from "./LaunchesPageClient";

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

export default async function LaunchesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  const supabase = await createClient();
  // Fetch real launches from Supabase
  const { data: launchesData, error: launchesError } = await supabase
    .from("launches")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (launchesError) {
    console.error("Error fetching launches:", launchesError);
  }

  // Transform Supabase data to match expected Launch type
  const launches: Launch[] = await Promise.all((launchesData || []).map(async (launch) => {
    // Get all tasks for this launch to calculate accurate counts
    const { data: allTasks } = await supabase
      .from("tasks")
      .select("status")
      .eq("launchId", launch.id);

    const totalTasks = allTasks?.length || 0;
    const completedTasks = allTasks?.filter(
      (task) => task.status === "completed" || task.status === "done"
    ).length || 0;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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

    return {
      id: launch.id,
      name: launch.launchName || "Untitled Launch",
      type: launch.launchType || "Product",
      progress: progress,
      completed: completedTasks,
      total: totalTasks,
      phase: launch.phase || "Getting started",
      launchDate: launch.target_date || launch.launch_date,
      nextTask: nextTaskData?.title || "No tasks yet",
    };
  }));

  return <LaunchesPageClient launches={launches} />;
}
