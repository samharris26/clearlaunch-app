import type { LaunchTemplate } from "@/lib/launchTemplates";
import type { TaskRecord } from "@/types/tasks";

export interface LaunchHealthMetrics {
  planCompleteness: number; // 0-100
  platformCoverageCount: number;
  averageTasksPerDay: number;
  teamWorkloadLabel: "Light" | "Balanced" | "Heavy";
  todaysKeyMoments: TaskRecord[];
}

export interface LaunchData {
  id: string;
  launch_start_date?: string | null;
  launch_end_date?: string | null;
  template_id?: string | null;
}

/**
 * Calculate launch health metrics based on launch, tasks, and template
 */
export function calculateLaunchHealth(
  launch: LaunchData,
  tasks: TaskRecord[],
  _template: LaunchTemplate | undefined
): LaunchHealthMetrics {
  // Plan completeness: % of tasks marked completed
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => (task.status ?? "").toLowerCase() === "completed"
  ).length;
  const planCompleteness =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Platform coverage: number of unique platforms
  const platforms = new Set(
    tasks
      .map((t) => t.platform)
      .filter((platform): platform is string => platform !== null && platform !== undefined)
  );
  const platformCoverageCount = platforms.size;

  // Average tasks per day
  let averageTasksPerDay = 0;
  if (launch.launch_start_date && launch.launch_end_date) {
    const start = new Date(launch.launch_start_date);
    const end = new Date(launch.launch_end_date);
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    averageTasksPerDay = tasks.length / daysDiff;
  } else if (tasks.length > 0) {
    // Fallback: assume 14-day window if dates not available
    averageTasksPerDay = tasks.length / 14;
  }

  // Team workload label
  let teamWorkloadLabel: "Light" | "Balanced" | "Heavy";
  if (averageTasksPerDay <= 2) {
    teamWorkloadLabel = "Light";
  } else if (averageTasksPerDay <= 5) {
    teamWorkloadLabel = "Balanced";
  } else {
    teamWorkloadLabel = "Heavy";
  }

  // Today's key moments: tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysKeyMoments = tasks.filter((task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  return {
    planCompleteness,
    platformCoverageCount,
    averageTasksPerDay,
    teamWorkloadLabel,
    todaysKeyMoments,
  };
}

