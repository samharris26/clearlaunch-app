"use client";

import { useEffect, useMemo, useState } from "react";
import TaskCard from "@/components/dashboard/TaskCard";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { Calendar, Rocket, CheckCircle, Clock } from "lucide-react";
import { TaskRecord } from "@/types/tasks";

interface TaskGridProps {
  tasks: TaskRecord[];
}

type PhaseFilter = "all" | "pre-launch" | "launch-day" | "post-launch" | "completed";

export default function TaskGrid({ tasks }: TaskGridProps) {
  const [taskList, setTaskList] = useState<TaskRecord[]>(tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return taskList.find((task) => task.id === selectedTaskId) ?? null;
  }, [selectedTaskId, taskList]);

  const handleTaskClick = (task: TaskRecord) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleTaskChange = (updatedTask: TaskRecord) => {
    setTaskList((prev) =>
      prev.map((t) => t.id === updatedTask.id ? updatedTask : t)
    );
    setSelectedTaskId(updatedTask.id);
  };

  const getDueDateDisplay = (dueDate: string | null | undefined) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due ${due.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`;
    }
  };

  const getChipTone = (task: TaskRecord) => {
    const statusValue = task.status?.toLowerCase?.() ?? "";
    if (statusValue === "completed" || statusValue === "complete") return "green";

    if (!task.due_date) return "blue";

    const today = new Date();
    const due = new Date(task.due_date);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "red";
    if (diffDays <= 1) return "orange";
    return "blue";
  };

  if (taskList.length === 0) {
    return null;
  }

  const isCompleted = (task: TaskRecord) => (task.status ?? "").toLowerCase() === "completed";

  const sortByDueDateThenOrder = (a: TaskRecord, b: TaskRecord) => {
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return ((a.order ?? 0) as number) - ((b.order ?? 0) as number);
  };

  // Helper to categorize a task phase - returns "pre-launch", "launch-day", "post-launch", or null
  const categorizePhase = (phase: string | null | undefined, dueDate: string | null | undefined): "pre-launch" | "launch-day" | "post-launch" | null => {
    if (!phase) {
      // If no phase but we have a due date, categorize based on that
      if (dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "post-launch";
        if (diffDays === 0) return "launch-day";
        return "pre-launch";
      }
      return null;
    }

    const normalized = phase.toLowerCase().trim();
    const normalizedNoPunctuation = normalized.replace(/[_-]+/g, " ");

    // Launch Day variations
    if (
      normalized === "launch day" ||
      normalized === "launchday" ||
      normalized === "launch_day" ||
      normalizedNoPunctuation === "launch day" ||
      normalized.includes("launch day")
    ) {
      return "launch-day";
    }

    // Post-launch variations
    if (
      normalized === "post-launch" ||
      normalized === "postlaunch" ||
      normalized === "post launch" ||
      normalized === "post_launch" ||
      normalizedNoPunctuation === "post launch" ||
      normalized.includes("post-launch") ||
      normalized.includes("postlaunch")
    ) {
      return "post-launch";
    }

    // Pre-launch variations (catch-all for everything else that's not launch day or post-launch)
    // This includes: "pre-launch", "prelaunch", "research & setup", "research and setup", "planning", etc.
    if (
      normalized === "pre-launch" ||
      normalized === "prelaunch" ||
      normalized === "pre launch" ||
      normalized === "pre_launch" ||
      normalizedNoPunctuation === "pre launch" ||
      normalized === "research & setup" ||
      normalized === "research and setup" ||
      normalized === "research" ||
      normalized === "setup" ||
      normalized === "planning" ||
      normalized.includes("pre-launch") ||
      normalized.includes("prelaunch") ||
      normalized.includes("research") ||
      normalized.includes("setup") ||
      normalized.includes("planning") ||
      normalized.includes("foundation") ||
      normalized.includes("teaser") ||
      normalized.includes("warm-up") ||
      normalized.includes("warmup") ||
      normalized.includes("announcement") ||
      normalized.includes("countdown")
    ) {
      return "pre-launch";
    }

    // Default to pre-launch if we can't categorize (better to show than hide)
    return "pre-launch";
  };

  // Helper to check if a task belongs to pre-launch phase
  const isPreLaunchPhase = (phase: string | null | undefined, dueDate?: string | null | undefined): boolean => {
    return categorizePhase(phase, dueDate) === "pre-launch";
  };

  // Helper to check if a task belongs to launch day phase
  const isLaunchDayPhase = (phase: string | null | undefined, dueDate?: string | null | undefined): boolean => {
    return categorizePhase(phase, dueDate) === "launch-day";
  };

  // Helper to check if a task belongs to post-launch phase
  const isPostLaunchPhase = (phase: string | null | undefined, dueDate?: string | null | undefined): boolean => {
    return categorizePhase(phase, dueDate) === "post-launch";
  };

  const preLaunchTasks = taskList
    .filter(
      (task) => isPreLaunchPhase(task.phase, task.due_date) && !isCompleted(task)
    )
    .sort(sortByDueDateThenOrder);

  const launchDayTasks = taskList
    .filter(
      (task) => isLaunchDayPhase(task.phase, task.due_date) && !isCompleted(task)
    )
    .sort(sortByDueDateThenOrder);

  const postLaunchTasks = taskList
    .filter(
      (task) => isPostLaunchPhase(task.phase, task.due_date) && !isCompleted(task)
    )
    .sort(sortByDueDateThenOrder);

  const completedTasks = taskList
    .filter(isCompleted)
    .sort((a, b) =>
      new Date(b.updated_at ?? b.created_at ?? "").getTime() -
      new Date(a.updated_at ?? a.created_at ?? "").getTime()
    );

  const getFilteredTasks = () => {
    switch (phaseFilter) {
      case "pre-launch":
        return preLaunchTasks;
      case "launch-day":
        return launchDayTasks;
      case "post-launch":
        return postLaunchTasks;
      case "completed":
        return completedTasks;
      default:
        return [...preLaunchTasks, ...launchDayTasks, ...postLaunchTasks];
    }
  };

  const filteredTasks = getFilteredTasks();

  const renderTaskCard = (task: TaskRecord) => {
    const dueDateDisplay = getDueDateDisplay(task.due_date);
    const phaseLabel = task.phase?.trim();
    const chipLabel = isCompleted(task)
      ? "Completed"
      : phaseLabel || dueDateDisplay || "Getting started";

    const handleCopyOutline = async () => {
      if (task.outline) {
        try {
          await navigator.clipboard.writeText(task.outline);
          // Could add a toast notification here
        } catch (err) {
          console.error("Failed to copy outline:", err);
        }
      }
    };

    return (
      <div
        key={task.id}
        onClick={() => handleTaskClick(task)}
        className="group h-full cursor-pointer"
      >
        <TaskCard
          id={task.id}
          title={task.title}
          description={task.category || "General"}
          chip={{
            label: chipLabel,
            tone: getChipTone(task),
          }}
          overview={task.description
            ? (task.description.length > 120
              ? task.description.substring(0, 120).trim() + "..."
              : task.description)
            : "Task description"}
          platform={task.platform}
          dueLabel={dueDateDisplay || null}
          ownerName={task.owner_name || null}
          outline={task.outline || null}
          postTime={task.post_time || null}
          onCopyOutline={task.outline ? handleCopyOutline : undefined}
        />
      </div>
    );
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Tasks", icon: Clock },
            { key: "pre-launch", label: "Pre-launch", icon: Calendar },
            { key: "launch-day", label: "Launch Day", icon: Rocket },
            { key: "post-launch", label: "Post-launch", icon: CheckCircle },
            { key: "completed", label: "Completed", icon: CheckCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPhaseFilter(key as PhaseFilter)}
              className={`group relative flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${phaseFilter === key
                ? "border-sky-500 bg-white text-sky-700 shadow-[var(--shadow-subtle)]"
                : "border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] text-[color:var(--muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]"
                }`}
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
            >
              <Icon className={`h-4 w-4 transition-colours ${phaseFilter === key ? "text-sky-600" : "text-[color:var(--muted)] group-hover:text-[color:var(--text)]"
                }`} />
              {label}
              {phaseFilter === key && (
                <div className="absolute inset-0 -z-10 rounded-full bg-sky-500/10 blur-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {phaseFilter === "all" ? (
        <>
          {preLaunchTasks.length > 0 && (
            <div className="mb-10 space-y-8">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Pre-launch</h3>
                <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  ({preLaunchTasks.length} tasks)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                {preLaunchTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {launchDayTasks.length > 0 && (
            <div className="mb-10 space-y-8">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Launch Day</h3>
                <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  ({launchDayTasks.length} tasks)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                {launchDayTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {postLaunchTasks.length > 0 && (
            <div className="mb-10 space-y-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Post-launch</h3>
                <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  ({postLaunchTasks.length} tasks)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                {postLaunchTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Completed</h3>
                <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  ({completedTasks.length} tasks)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                {completedTasks.map(renderTaskCard)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            {phaseFilter === "pre-launch" && (
              <Calendar className="h-5 w-5 text-sky-400" />
            )}
            {phaseFilter === "launch-day" && (
              <Rocket className="h-5 w-5 text-amber-400" />
            )}
            {phaseFilter === "post-launch" && (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            )}
            {phaseFilter === "completed" && (
              <CheckCircle className="h-5 w-5 text-slate-400" />
            )}
            <h3 className="text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
              {phaseFilter === "pre-launch"
                ? "Pre-launch"
                : phaseFilter === "launch-day"
                  ? "Launch Day"
                  : phaseFilter === "post-launch"
                    ? "Post-launch"
                    : "Completed"}
            </h3>
            <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              ({filteredTasks.length} tasks)
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {filteredTasks.map(renderTaskCard)}
          </div>
        </div>
      )}

      <TaskDrawer
        task={selectedTask}
        tasks={taskList}
        open={isModalOpen && !!selectedTask}
        onClose={handleCloseDrawer}
        onTaskChange={handleTaskChange}
      />
    </>
  );
}
