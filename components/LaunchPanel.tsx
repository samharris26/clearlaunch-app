"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckSquare,
  Square,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const GENERATION_LIMIT = 10;

const normalizePhase = (value: string | null | undefined) =>
  value && value.trim().length > 0 ? value.trim() : "General";

type Launch = {
  id: string;
  userId: string;
  launchName: string;
  launchType: string;
  toneOfVoice: string;
  progress: number;
  createdAt: string | null;
};

type TaskStatus = "todo" | "in_progress" | "done";

type Task = {
  id: string;
  launchId: string;
  title: string;
  description: string | null;
  phase: string | null;
  status: TaskStatus;
  order: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type DraftTask = {
  title: string;
  description: string;
  phase: string;
};

const generateMockTasks = (
  launchType: string | null | undefined,
  toneOfVoice: string | null | undefined,
): DraftTask[] => {
  const typeLabel = launchType?.toLowerCase() || "launch";
  const toneLabel = toneOfVoice || "your preferred tone";

  return [
    {
      title: `Define ${typeLabel} success metrics`,
      description: `Document the KPIs that will signal a successful ${typeLabel}. Keep the messaging in a ${toneLabel} style.`,
      phase: "Planning",
    },
    {
      title: "Outline audience persona",
      description: `Write a one-page overview of the ideal customer for this ${typeLabel}.`,
      phase: "Planning",
    },
    {
      title: "Prepare teaser content",
      description: `Draft teaser content that matches the ${toneLabel} tone to build anticipation.`,
      phase: "Pre-launch",
    },
    {
      title: "Schedule launch emails",
      description: "Plan a three-email sequence covering announcement, social proof, and final reminder.",
      phase: "Launch",
    },
    {
      title: "Recap performance",
      description: "Set up a template to capture metrics, wins, and learnings one week after launch.",
      phase: "Post-launch",
    },
  ];
};

export default function LaunchPanel({ id }: { id: string }) {
  const router = useRouter();
  const closePanel = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const [launchLoading, setLaunchLoading] = React.useState(true);
  const [launch, setLaunch] = React.useState<Launch | null>(null);
  const [launchError, setLaunchError] = React.useState<string | null>(null);

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = React.useState(true);
  const [tasksError, setTasksError] = React.useState<string | null>(null);
  const [progressError, setProgressError] = React.useState<string | null>(null);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null);

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDescription, setNewTaskDescription] = React.useState("");
  const [newTaskPhase, setNewTaskPhase] = React.useState("");
  const [addTaskLoading, setAddTaskLoading] = React.useState(false);

  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = React.useState("");
  const [editTaskDescription, setEditTaskDescription] = React.useState("");
  const [editTaskPhase, setEditTaskPhase] = React.useState("");
  const [editTaskLoading, setEditTaskLoading] = React.useState(false);

  const [isGenerating, setIsGenerating] = React.useState(false);

  const calculateProgress = React.useCallback((taskList: Task[]) => {
    if (taskList.length === 0) return 0;
    const doneTasks = taskList.filter((task) => task.status === "done").length;
    return Math.round((doneTasks / taskList.length) * 100);
  }, []);

  const updateLaunchProgress = React.useCallback(
    async (taskList: Task[]) => {
      const progressValue = calculateProgress(taskList);
      setLaunch((prev) => (prev ? { ...prev, progress: progressValue } : prev));

      const { error } = await supabase
        .from("launches")
        .update({ progress: progressValue })
        .eq("id", id);

      if (error) {
        throw error;
      }

      return progressValue;
    },
    [calculateProgress, id],
  );

  const computeNextOrder = React.useCallback(
    (phaseName: string | null | undefined) => {
      const normalized = normalizePhase(phaseName);
      const inPhase = tasks.filter(
        (task) => normalizePhase(task.phase) === normalized,
      );

      const maxOrder = inPhase.reduce((max, task) => {
        if (typeof task.order === "number") {
          return Math.max(max, task.order);
        }
        return max;
      }, -1);

      return maxOrder + 1;
    },
    [tasks],
  );

  const loadTasks = React.useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    setProgressError(null);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("launchId", id)
        .order("phase", { ascending: true })
        .order("order", { ascending: true });

      if (error) {
        throw error;
      }

      const fetchedTasks = data ?? [];
      setTasks(fetchedTasks);

      try {
        await updateLaunchProgress(fetchedTasks);
      } catch (err) {
        console.error("Failed to sync launch progress", err);
        setProgressError("Failed to sync progress. Changes will retry shortly.");
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
      setTasksError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setTasksLoading(false);
    }
  }, [id, updateLaunchProgress]);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLaunchLoading(true);
      try {
        const { data, error } = await supabase
          .from("launches")
          .select("*")
          .eq("id", id)
          .single();

        if (cancelled) return;

        if (error) {
          setLaunchError(error.message);
          setLaunch(null);
          return;
        }

        setLaunch(data ?? null);
      } catch (err) {
        if (cancelled) return;
        setLaunchError(err instanceof Error ? err.message : "Failed to load launch.");
        setLaunch(null);
      } finally {
        if (cancelled) return;
        setLaunchLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePanel]);

  const toggleTaskStatus = React.useCallback(
    async (taskId: string) => {
      const taskIndex = tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      setTasksError(null);
      setProgressError(null);

      const originalTasks = tasks;
      const targetTask = tasks[taskIndex];
      const nextStatus: TaskStatus = targetTask.status === "done" ? "todo" : "done";
      const optimisticTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      );

      const previousProgress = calculateProgress(originalTasks);
      const optimisticProgress = calculateProgress(optimisticTasks);

      setTasks(optimisticTasks);
      setLaunch((prev) =>
        prev ? { ...prev, progress: optimisticProgress } : prev,
      );

      try {
        const { error } = await supabase
          .from("tasks")
          .update({ status: nextStatus })
          .eq("id", taskId);

        if (error) {
          throw error;
        }

        try {
          await updateLaunchProgress(optimisticTasks);
        } catch (progressErr) {
          console.error("Failed to sync progress", progressErr);
          setProgressError(
            progressErr instanceof Error
              ? progressErr.message
              : "Failed to sync progress. Changes will retry shortly.",
          );
        }
      } catch (err) {
        console.error("Failed to update task status", err);
        setTasks(originalTasks);
        setLaunch((prev) =>
          prev ? { ...prev, progress: previousProgress } : prev,
        );
        setTasksError(
          err instanceof Error ? err.message : "Failed to update task status.",
        );
      }
    },
    [tasks, calculateProgress, updateLaunchProgress],
  );

  const handleAddTaskSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newTaskTitle.trim()) {
        setTasksError("Task title is required.");
        return;
      }

      const normalizedPhase = normalizePhase(newTaskPhase);
      const nextOrder = computeNextOrder(normalizedPhase);

      setAddTaskLoading(true);
      setTasksError(null);

      try {
        const { error } = await supabase.from("tasks").insert([
          {
            launchId: id,
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim() || null,
            phase: normalizedPhase,
            status: "todo",
            order: nextOrder,
          },
        ]);

        if (error) {
          throw error;
        }

        setShowAddForm(false);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewTaskPhase("");

        await loadTasks();
      } catch (err) {
        console.error("Failed to add task", err);
        setTasksError(err instanceof Error ? err.message : "Failed to add task.");
      } finally {
        setAddTaskLoading(false);
      }
    },
    [
      computeNextOrder,
      id,
      loadTasks,
      newTaskDescription,
      newTaskPhase,
      newTaskTitle,
    ],
  );

  const startEditTask = React.useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description ?? "");
    setEditTaskPhase(task.phase ?? "");
    setTasksError(null);
  }, []);

  const cancelEditTask = React.useCallback(() => {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskDescription("");
    setEditTaskPhase("");
  }, []);

  const handleEditTaskSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editingTaskId) return;
      if (!editTaskTitle.trim()) {
        setTasksError("Task title is required.");
        return;
      }

      const existingTask = tasks.find((task) => task.id === editingTaskId);
      if (!existingTask) {
        setTasksError("Task not found.");
        return;
      }

      const normalizedPhase = normalizePhase(editTaskPhase);
      const existingPhase = normalizePhase(existingTask.phase);

      const updates: Partial<Task> = {
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim() || null,
        phase: normalizedPhase,
      };

      if (normalizedPhase !== existingPhase) {
        updates.order = computeNextOrder(normalizedPhase);
      }

      setEditTaskLoading(true);
      setTasksError(null);

      try {
        const { error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", editingTaskId);

        if (error) {
          throw error;
        }

        cancelEditTask();
        await loadTasks();
      } catch (err) {
        console.error("Failed to update task", err);
        setTasksError(
          err instanceof Error ? err.message : "Failed to update task.",
        );
      } finally {
        setEditTaskLoading(false);
      }
    },
    [
      cancelEditTask,
      computeNextOrder,
      editTaskDescription,
      editTaskPhase,
      editTaskTitle,
      editingTaskId,
      loadTasks,
      tasks,
    ],
  );

  const handleDeleteTask = React.useCallback(
    async (taskId: string) => {
      const confirmed = window.confirm("Delete this task?");
      if (!confirmed) return;

      setDeletingTaskId(taskId);
      setTasksError(null);

      try {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);

        if (error) {
          throw error;
        }

        if (editingTaskId === taskId) {
          cancelEditTask();
        }

        await loadTasks();
      } catch (err) {
        console.error("Failed to delete task", err);
        setTasksError(
          err instanceof Error ? err.message : "Failed to delete task.",
        );
      } finally {
        setDeletingTaskId(null);
      }
    },
    [cancelEditTask, editingTaskId, loadTasks],
  );

  const handleGeneratePlan = React.useCallback(async () => {
    if (tasks.length >= GENERATION_LIMIT) {
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setTasksError(null);

    try {
      const mockTasks = generateMockTasks(
        launch?.launchType,
        launch?.toneOfVoice,
      );

      if (mockTasks.length === 0) {
        setGenerateError("No mock tasks available.");
        return;
      }

      const phaseOrders = new Map<string, number>();
      const rows = mockTasks.map((task) => {
        const normalized = normalizePhase(task.phase);
        const baseOrder =
          phaseOrders.get(normalized) ?? computeNextOrder(normalized);
        phaseOrders.set(normalized, baseOrder + 1);

        return {
          launchId: id,
          title: task.title,
          description: task.description,
          phase: normalized,
          status: "todo" as TaskStatus,
          order: baseOrder,
        };
      });

      const { error } = await supabase.from("tasks").insert(rows);
      if (error) {
        throw error;
      }

      await loadTasks();
    } catch (err) {
      console.error("Failed to generate plan", err);
      setGenerateError(
        err instanceof Error ? err.message : "Failed to generate plan.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [computeNextOrder, id, launch, loadTasks, tasks.length]);

  const groupedTasks = React.useMemo(() => {
    const map = new Map<string, Task[]>();

    tasks.forEach((task) => {
      const phaseName = normalizePhase(task.phase);
      if (!map.has(phaseName)) {
        map.set(phaseName, []);
      }
      map.get(phaseName)!.push(task);
    });

    return Array.from(map.entries());
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progressDisplay = !tasksLoading
    ? calculateProgress(tasks)
    : launch?.progress ?? 0;
  const generationLimitReached = tasks.length >= GENERATION_LIMIT;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={closePanel}
      />

      <motion.aside
        key="panel"
        className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-black/10 bg-white shadow-xl sm:w-[520px] md:w-[700px] lg:w-[820px]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 24,
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-black/10 px-4">
          <div className="min-w-0">
            <div className="text-sm text-black/50">Launch</div>
            <div className="truncate text-base font-semibold">
              {launchLoading ? "Loading…" : launch?.launchName || "Unknown launch"}
            </div>
          </div>
          <button
            onClick={closePanel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/[0.06]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2 border-b border-black/10 pb-6">
            {launchLoading && (
              <div className="text-sm text-black/60">Loading launch…</div>
            )}
            {launchError && (
              <div className="text-sm text-red-600">Error: {launchError}</div>
            )}
            {!launchLoading && !launchError && launch && (
              <div>
                <div className="text-xs uppercase tracking-wide text-black/50">
                  Overview
                </div>
                <div className="mt-2 space-y-1.5 text-sm text-black/80">
                  <div>
                    <span className="text-black/50">Type:</span>{" "}
                    {launch.launchType || "—"}
                  </div>
                  <div>
                    <span className="text-black/50">Tone:</span>{" "}
                    {launch.toneOfVoice || "—"}
                  </div>
                  <div>
                    <span className="text-black/50">Progress:</span>{" "}
                    {progressDisplay}%
                  </div>
                  <div>
                    <span className="text-black/50">Created:</span>{" "}
                    {launch.createdAt
                      ? new Date(launch.createdAt).toLocaleString()
                      : "—"}
                  </div>
                  <div>
                    <span className="text-black/50">Completed:</span>{" "}
                    {completedTasks} / {totalTasks}
                  </div>
                  {progressError && (
                    <div className="text-xs text-red-600">{progressError}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Tasks</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => {
                  setShowAddForm((prev) => !prev);
                  setTasksError(null);
                }}
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.05] transition disabled:opacity-50"
                disabled={addTaskLoading || editTaskLoading}
              >
                {showAddForm ? "Cancel" : "+ Add Task"}
              </button>
              <button
                onClick={handleGeneratePlan}
                className="flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-1.5 text-sm transition hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isGenerating || generationLimitReached}
              >
                {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Generate Plan (mock)
              </button>
            </div>
          </div>

          {(generateError || generationLimitReached) && (
            <div className="mt-2 text-xs text-black/60">
              {generateError
                ? generateError
                : "Upgrade to generate more tasks."}
            </div>
          )}

          {showAddForm && (
            <form
              onSubmit={handleAddTaskSubmit}
              className="mt-4 space-y-3 rounded-lg border border-black/10 bg-black/[0.03] p-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/60">
                  Title
                </label>
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Plan the launch kickoff"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/60">
                  Description
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(event) => setNewTaskDescription(event.target.value)}
                  className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Optional details to remember"
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/60">Phase</label>
                <input
                  value={newTaskPhase}
                  onChange={(event) => setNewTaskPhase(event.target.value)}
                  className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Planning"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={addTaskLoading}
                >
                  {addTaskLoading ? "Adding…" : "Add Task"}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.05]"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle("");
                    setNewTaskDescription("");
                    setNewTaskPhase("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {tasksLoading && (
            <div className="mt-6 text-sm text-black/60">Loading tasks…</div>
          )}

          {tasksError && !tasksLoading && (
            <div className="mt-6 text-sm text-red-600">Error: {tasksError}</div>
          )}

          {!tasksLoading && !tasksError && groupedTasks.length === 0 && (
            <div className="mt-6 text-sm text-black/50">No tasks yet</div>
          )}

          {!tasksLoading &&
            !tasksError &&
            groupedTasks.map(([phaseName, phaseTasks]) => (
              <div key={phaseName} className="mt-6">
                <h3 className="text-xs uppercase tracking-wide text-black/50">
                  {phaseName}
                </h3>
                <div className="mt-2 space-y-2">
                  {phaseTasks.map((task) => {
                    const isDone = task.status === "done";
                    const isDeleting = deletingTaskId === task.id;
                    const isDisabled = isDeleting || editTaskLoading;

                    if (editingTaskId === task.id) {
                      return (
                        <form
                          key={task.id}
                          onSubmit={handleEditTaskSubmit}
                          className="space-y-3 rounded-lg border border-black/10 bg-black/[0.03] p-3"
                        >
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-black/60">
                              Title
                            </label>
                            <input
                              value={editTaskTitle}
                              onChange={(event) =>
                                setEditTaskTitle(event.target.value)
                              }
                              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-black/60">
                              Description
                            </label>
                            <textarea
                              value={editTaskDescription}
                              onChange={(event) =>
                                setEditTaskDescription(event.target.value)
                              }
                              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-black/60">
                              Phase
                            </label>
                            <input
                              value={editTaskPhase}
                              onChange={(event) =>
                                setEditTaskPhase(event.target.value)
                              }
                              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={editTaskLoading}
                            >
                              {editTaskLoading ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.05]"
                              onClick={cancelEditTask}
                              disabled={editTaskLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleTaskStatus(task.id);
                        }}
                        onKeyDown={(event) => {
                          if (isDisabled) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleTaskStatus(task.id);
                          }
                        }}
                        className={`group flex items-start gap-3 rounded-lg bg-black/[0.03] p-2 transition hover:bg-black/[0.05] ${
                          isDisabled ? "cursor-wait opacity-60" : "cursor-pointer"
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckSquare className="h-4 w-4 text-black" />
                          ) : (
                            <Square className="h-4 w-4 text-black/50" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-medium text-black/80">
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="mt-1 text-xs text-black/60">
                              {task.description}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isDisabled) return;
                              startEditTask(task);
                            }}
                            className="rounded-md p-1 text-black/60 hover:bg-black/[0.08] hover:text-black"
                            aria-label="Edit task"
                            disabled={isDisabled}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isDisabled) return;
                              handleDeleteTask(task.id);
                            }}
                            className="rounded-md p-1 text-black/60 hover:bg-black/[0.08] hover:text-red-600"
                            aria-label="Delete task"
                            disabled={isDisabled}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
