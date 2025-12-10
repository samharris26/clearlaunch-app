"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Calendar,
  X,
  Pencil,
  Wand2,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskRecord } from "@/types/tasks";
import { updateTask } from "@/app/(app)/launch/[id]/update-task/action";
import { deleteTask } from "@/lib/actions/tasks";
import { generateTaskContentAction } from "@/app/(app)/launch/[id]/generate-task-content/action";
import { generateContentAction } from "@/app/(app)/launch/[id]/generate-content/action";
import { useUsage } from "@/hooks/useUsage";
import { AI_BUTTON_ACTIVE_CLASS, AI_BUTTON_DISABLED_CLASS } from "@/lib/aiButtonStyles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type TaskDrawerProps = {
  task: TaskRecord | null;
  tasks: TaskRecord[];
  open: boolean;
  onClose: () => void;
  onTaskChange?: (task: TaskRecord) => void;
};

type StatusOption = {
  label: string;
  value: "todo" | "in_progress" | "completed";
};

type GeneratedTaskContent = {
  task_title?: string;
  platform_content?: {
    Notes?: string;
    Instagram_Reel?: string;
    Instagram_Carousel?: string[];
    Instagram_Story?: string[];
    TikTok?: string;
    Email?: {
      subject: string;
      body: string;
    };
    [key: string]: any;
  };
  visual_direction?: string;
  cta_options?: string[];
  hashtags?: string[];
};

const STATUS_OPTIONS: StatusOption[] = [
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Complete", value: "completed" },
];

const STATUS_STORAGE_MAP: Record<string, StatusOption["value"]> = {
  todo: "todo",
  "to do": "todo",
  active: "todo",
  in_progress: "in_progress",
  "in progress": "in_progress",
  completed: "completed",
  complete: "completed",
};

const DATABASE_STATUS_MAP: Record<StatusOption["value"], string> = {
  todo: "active",
  in_progress: "in_progress",
  completed: "completed",
};

const STATUS_META: Record<StatusOption["value"], { label: string; badge: string; button: string; helper: string }> = {
  todo: {
    label: "To do",
    badge: "bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-[color:var(--muted)] border border-[color:var(--border)]",
    button: "Mark as in progress",
    helper: "Ready to kick off",
  },
  in_progress: {
    label: "In progress",
    badge: "bg-sky-500/12 text-sky-600 border border-sky-400/50",
    button: "Mark as complete",
    helper: "Work underway",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-500/12 text-emerald-600 border border-emerald-400/60",
    button: "Reopen task",
    helper: "All done",
  },
};

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;

function normaliseRichText(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (HTML_TAG_REGEX.test(trimmed)) {
    return trimmed;
  }
  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      const withBreaks = paragraph.split(/\n/).join("<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("");
  return paragraphs;
}

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  showToolbar?: boolean;
  editorRef?: React.RefObject<HTMLDivElement>;
};

function RichTextEditor({ value, onChange, onBlur, placeholder, showToolbar = true, editorRef: externalRef }: RichTextEditorProps) {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const editorRef = externalRef || internalRef;

  useEffect(() => {
    if (!editorRef.current) return;
    const htmlValue = normaliseRichText(value);
    if (editorRef.current.innerHTML !== htmlValue) {
      editorRef.current.innerHTML = htmlValue || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const applyCommand = useCallback((command: string) => {
    if (typeof document === "undefined") return;
    document.execCommand(command, false);
    handleInput();
  }, [handleInput]);

  const handleBlur = useCallback(() => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    onBlur?.(content);
  }, [onBlur]);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[var(--shadow-subtle)] transition-shadow focus-within:shadow-[var(--shadow-soft)] focus-within:ring-2 focus-within:ring-sky-400/40",
        !showToolbar && "overflow-hidden"
      )}
    >
      {showToolbar && (
        <div className="flex items-center gap-1 border-b border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 py-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] hover:text-[color:var(--text)] transition-colors"
            onClick={() => applyCommand("bold")}
            aria-label="Bold"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] hover:text-[color:var(--text)] transition-colors"
            onClick={() => applyCommand("italic")}
            aria-label="Italic"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] hover:text-[color:var(--text)] transition-colors"
            onClick={() => applyCommand("underline")}
            aria-label="Underline"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-[color:var(--border)]" />
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] hover:text-[color:var(--text)] transition-colors"
            onClick={() => applyCommand("insertUnorderedList")}
            aria-label="Bullet list"
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--muted)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] hover:text-[color:var(--text)] transition-colors"
            onClick={() => applyCommand("insertOrderedList")}
            aria-label="Numbered list"
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>
      )}
      <div
        ref={editorRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "min-h-[300px] max-h-[600px] w-full px-4 py-4 text-base leading-7 text-[color:var(--text)] focus:outline-none overflow-y-auto",
          showToolbar ? "rounded-b-lg" : "rounded-lg"
        )}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleBlur}
        suppressContentEditableWarning
      />
      <style jsx>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

function formatGeneratedDescription(content: GeneratedTaskContent) {
  const platformContent = content.platform_content || {};

  const notesValue = platformContent.Notes;
  if (typeof notesValue === "string" && notesValue.trim().length > 0) {
    return notesValue;
  }

  const sections: string[] = [];

  if (platformContent.Email) {
    sections.push(`<p><strong>Subject:</strong> ${platformContent.Email.subject || ""}</p>`);
    sections.push(`<p>${platformContent.Email.body || ""}</p>`);
  }

  if (platformContent.Instagram_Reel) {
    sections.push(`<p><strong>Reel Script:</strong></p><p>${platformContent.Instagram_Reel}</p>`);
  }

  if (Array.isArray(platformContent.Instagram_Carousel) && platformContent.Instagram_Carousel.length > 0) {
    platformContent.Instagram_Carousel.forEach((slide, index) => {
      sections.push(`<p><strong>Slide ${index + 1}:</strong> ${slide}</p>`);
    });
  }

  if (Array.isArray(platformContent.Instagram_Story) && platformContent.Instagram_Story.length > 0) {
    platformContent.Instagram_Story.forEach((frame, index) => {
      sections.push(`<p><strong>Story Frame ${index + 1}:</strong> ${frame}</p>`);
    });
  }

  if (platformContent.TikTok) {
    sections.push(`<p><strong>TikTok Script:</strong></p><p>${platformContent.TikTok}</p>`);
  }

  for (const [key, value] of Object.entries(platformContent)) {
    if (["Notes", "Email", "Instagram_Reel", "Instagram_Carousel", "Instagram_Story", "TikTok"].includes(key)) {
      continue;
    }

    const label = key.replace(/_/g, " ");
    if (typeof value === "string" && value.trim()) {
      sections.push(`<p><strong>${label}:</strong> ${value}</p>`);
    } else if (Array.isArray(value) && value.length > 0) {
      const listItems = value.map((item) => `<li>${item}</li>`).join("");
      sections.push(`<p><strong>${label}:</strong></p><ul>${listItems}</ul>`);
    }
  }

  if (content.visual_direction) {
    sections.push(`<p><strong>Visual direction:</strong> ${content.visual_direction}</p>`);
  }

  if (content.cta_options && content.cta_options.length > 0) {
    sections.push(`<p><strong>CTA:</strong> ${content.cta_options.join(" | ")}</p>`);
  }

  if (content.hashtags && content.hashtags.length > 0) {
    sections.push(`<p><strong>Hashtags:</strong> ${content.hashtags.join(" ")}</p>`);
  }

  return sections.join("\n") || "";
}

function formatDate(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TaskDrawer({ task, tasks, open, onClose, onTaskChange }: TaskDrawerProps) {
  const router = useRouter();
  const [localTask, setLocalTask] = useState<TaskRecord | null>(task);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title ?? "");
  const [workspaceContent, setWorkspaceContent] = useState(task?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<GeneratedTaskContent | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [lastGeneratedContent, setLastGeneratedContent] = useState<string | null>(null);

  const workspaceEditorRef = useRef<HTMLDivElement | null>(null);
  const { aiCallsRemaining, usage, loading: usageLoading, refetch: refetchUsage } = useUsage();
  const safeCredits = typeof aiCallsRemaining === "number" ? Math.max(aiCallsRemaining, 0) : 0;
  const totalCredits = usage?.maxAiCalls ?? undefined;

  const isFreePlan = usage?.plan === 'free';
  const creditLabel = "AI credit";
  const creditsLabel = "AI credits";
  const creditsDetailText = usageLoading
    ? "Checking…"
    : totalCredits !== undefined
      ? `you have ${safeCredits} ${safeCredits === 1 ? creditLabel : creditsLabel} remaining`
      : `${safeCredits} ${safeCredits === 1 ? creditLabel : creditsLabel} remaining`;
  const [initialAIGenerated, setInitialAIGenerated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!localTask?.launchId || !isFreePlan) {
      setInitialAIGenerated(null);
      return;
    }

    const fetchLaunchData = async () => {
      try {
        const response = await fetch(`/api/launch/${localTask.launchId}/initial-ai-check`);
        if (response.ok) {
          const data = await response.json();
          setInitialAIGenerated(data.initialAIGenerated || false);
        }
      } catch (error) {
        console.error("Error fetching launch initial AI status:", error);
        setInitialAIGenerated(false);
      }
    };

    fetchLaunchData();
  }, [localTask?.launchId, isFreePlan]);

  const canUseAI = !isFreePlan || (isFreePlan && initialAIGenerated === false);

  useEffect(() => {
    if (!task) return;
    const contentFromDb = task.notes ?? "";
    setWorkspaceContent((prev) => {
      if (prev === contentFromDb) return prev;
      return contentFromDb;
    });
    setLastGeneratedContent(null);
  }, [task?.id]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (task) {
      setLocalTask(task);
      setTitleValue(task.title ?? "");
      setEditingTitle(false);
      setError(null);
      setAiContent(null);
      setAiError(null);
      setIsGeneratingContent(false);
    } else if (!task && open) {
      // If drawer is open but task is null, close it
      onClose();
    }
  }, [task, open, onClose]);

  const workspaceContentRef = useRef(workspaceContent);
  useEffect(() => {
    workspaceContentRef.current = workspaceContent;
  }, [workspaceContent]);

  const statusValue = useMemo<StatusOption["value"]>(() => {
    if (!localTask) return "todo";
    const normalised = STATUS_STORAGE_MAP[localTask.status?.toLowerCase?.() ?? ""] ?? "todo";
    return normalised;
  }, [localTask?.status]);

  const shouldShowAiSection = useMemo(() => {
    if (!localTask) return false;
    const category = (localTask.category || "").toLowerCase();
    const platform = (localTask.platform || "").toLowerCase();
    const title = (localTask.title || "").toLowerCase();
    return (
      category.includes("content") ||
      category.includes("social") ||
      category.includes("marketing") ||
      platform !== "" ||
      title.includes("post") ||
      title.includes("campaign")
    );
  }, [localTask?.category, localTask?.platform, localTask?.title]);

  const detectedContentType = useMemo((): "general" | "instagram" | "carousel" | "reels" | "email" => {
    if (!localTask) return "general";
    const title = (localTask.title || "").toLowerCase();
    const platform = (localTask.platform || "").toLowerCase();
    const description = (localTask.description || "").toLowerCase();
    const category = (localTask.category || "").toLowerCase();

    if (title.includes("email") || title.includes("newsletter") || title.includes("mail")) {
      return "email";
    }
    if (title.includes("carousel") || title.includes("multi-slide")) {
      return "carousel";
    }
    if (title.includes("reel") || title.includes("reels") || title.includes("video script")) {
      return "reels";
    }
    if (title.includes("instagram") || title.includes("ig post") || title.includes("insta")) {
      if (title.includes("reel") || title.includes("video")) {
        return "reels";
      }
      return "instagram";
    }

    if (platform === "instagram") {
      if (description.includes("reel") || description.includes("video")) {
        return "reels";
      }
      return "instagram";
    }
    if (platform === "email") {
      return "email";
    }

    if (category.includes("email") || description.includes("email campaign")) {
      return "email";
    }
    if (description.includes("carousel") || description.includes("slides")) {
      return "carousel";
    }
    if (description.includes("reel") || description.includes("video script")) {
      return "reels";
    }

    return "general";
  }, [localTask?.title, localTask?.platform, localTask?.description, localTask?.category]);

  // Find current task index and get prev/next
  const currentTaskIndex = useMemo(() => {
    if (!task || !tasks.length) return -1;
    return tasks.findIndex((t) => t.id === task.id);
  }, [task, tasks]);

  const previousTask = useMemo(() => {
    if (currentTaskIndex <= 0) return null;
    return tasks[currentTaskIndex - 1];
  }, [currentTaskIndex, tasks]);

  const nextTask = useMemo(() => {
    if (currentTaskIndex < 0 || currentTaskIndex >= tasks.length - 1) return null;
    return tasks[currentTaskIndex + 1];
  }, [currentTaskIndex, tasks]);

  const handleLocalUpdate = (updates: Partial<TaskRecord>) => {
    if (!localTask) return;
    let nextTask: TaskRecord | null = null;
    setLocalTask((prev) => {
      if (!prev) return null;
      nextTask = { ...prev, ...updates };
      return nextTask;
    });

    if (nextTask && onTaskChange) {
      onTaskChange(nextTask);
    }
  };

  const persistUpdates = (updates: Parameters<typeof updateTask>[1]) => {
    if (!localTask) return;
    const launchId = localTask.launchId;
    startTransition(async () => {
      try {
        const result = await updateTask(localTask.id, updates, launchId);
        if (result?.task) {
          const nextTask = result.task as TaskRecord;
          setLocalTask(nextTask);
          if (updates.title !== undefined) {
            setTitleValue(nextTask.title ?? "");
          }
          if (updates.notes !== undefined && nextTask.notes !== undefined) {
            setWorkspaceContent(nextTask.notes ?? "");
          }
          onTaskChange?.(nextTask);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to update task");
        if (task) {
          setLocalTask(task);
          setTitleValue(task.title ?? "");
          if (onTaskChange) {
            onTaskChange(task);
          }
        }
      }
    });
  };

  const saveWorkspaceContentInternal = async (content: string) => {
    if (!localTask?.id) {
      return { success: false, error: "Task ID missing" };
    }

    const normalisedContent = normaliseRichText(content);
    const launchId = localTask.launchId;

    try {
      const result = await updateTask(localTask.id, { notes: normalisedContent || null }, launchId);

      if (result && result.success) {
        if (result.task) {
          const nextTask = result.task as TaskRecord;
          setLocalTask(nextTask);
          if (nextTask.notes !== undefined) {
            setWorkspaceContent(nextTask.notes ?? "");
          }
          onTaskChange?.(nextTask);
        }
        return { success: true };
      }

      return { success: false, error: "Update task returned unsuccessful result" };
    } catch (err) {
      console.error("Failed to save workspace content:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMessage };
    }
  };

  const persistWorkspaceContent = async (content: string) => {
    if (!localTask?.id) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const result = await saveWorkspaceContentInternal(content);

      if (result.success) {
        setIsSaving(false);
        setSaveStatus("saved");

        if (savedStatusTimeoutRef.current) clearTimeout(savedStatusTimeoutRef.current);
        savedStatusTimeoutRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } else {
        setIsSaving(false);
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error("Failed to save workspace content", error);
      setIsSaving(false);
      setSaveStatus("idle");
    }
  };

  const handleStatusChange = (value: StatusOption["value"]) => {
    if (value === statusValue || !localTask) return;
    handleLocalUpdate({ status: value });
    persistUpdates({ status: DATABASE_STATUS_MAP[value] });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitleValue(newTitle);
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    const trimmedTitle = titleValue.trim();

    if (!trimmedTitle || !localTask) {
      setTitleValue(localTask?.title ?? "");
      return;
    }

    if (trimmedTitle === (localTask.title ?? "")) {
      return;
    }

    handleLocalUpdate({ title: trimmedTitle });
    persistUpdates({ title: trimmedTitle });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setTitleValue(localTask?.title ?? "");
      e.currentTarget.blur();
    }
  };

  const formatContentForWorkspace = (result: any, type: "general" | "instagram" | "carousel" | "reels" | "email"): string => {
    if (type === "general") {
      return formatGeneratedDescription(result);
    } else if (type === "instagram") {
      const hashtags = result.hashtags?.length > 0 ? `\n\n${result.hashtags.join(" ")}` : "";
      return `<p><strong>${result.caption || ""}</strong></p>${hashtags ? `<p>${hashtags}</p>` : ""}${result.suggested_visual ? `<p><em>Visual: ${result.suggested_visual}</em></p>` : ""}`;
    } else if (type === "carousel") {
      const slidesHtml = result.slides?.map((slide: any) =>
        `<p><strong>Slide ${slide.slide_number}:</strong> ${slide.headline}</p><p>${slide.body_copy}</p><p><em>Visual: ${slide.visual_description}</em></p>`
      ).join("") || "";
      const hashtags = result.hashtags?.length > 0 ? `\n\n${result.hashtags.join(" ")}` : "";
      return `${slidesHtml}<p><strong>Caption:</strong> ${result.caption || ""}</p>${hashtags ? `<p>${hashtags}</p>` : ""}`;
    } else if (type === "reels") {
      const visualCues = result.visual_cues?.length > 0 ? `<p><strong>Visual Cues:</strong><ul>${result.visual_cues.map((cue: string) => `<li>${cue}</li>`).join("")}</ul></p>` : "";
      const hashtags = result.hashtags?.length > 0 ? `\n\n${result.hashtags.join(" ")}` : "";
      return `<p><strong>Hook (first 3s):</strong> ${result.hook || ""}</p><p>${result.script || ""}</p>${visualCues}<p><strong>Caption:</strong> ${result.caption || ""}</p>${hashtags ? `<p>${hashtags}</p>` : ""}`;
    } else if (type === "email") {
      return `<p><strong>Subject:</strong> ${result.subject_line || ""}</p><p><strong>Preheader:</strong> ${result.preheader || ""}</p><p>${result.body || ""}</p><p><strong>CTA:</strong> ${result.cta_text || ""} → ${result.cta_link_suggestion || ""}</p>`;
    }
    return "";
  };

  const handleGenerateContent = async () => {
    if (isGeneratingContent || isSaving || !localTask) return;
    if (!localTask.launchId) {
      setAiError("Launch reference missing for this task.");
      return;
    }
    setAiError(null);
    setIsGeneratingContent(true);
    try {
      const contentType = detectedContentType;
      let result;
      if (contentType === "general") {
        result = await generateTaskContentAction(localTask.launchId, localTask.id);
        setAiContent(result);
      } else {
        result = await generateContentAction(
          localTask.launchId,
          localTask.id,
          contentType as "instagram" | "carousel" | "reels" | "email"
        );
      }

      const generatedDraft = formatContentForWorkspace(result, contentType);
      const normalisedGenerated = normaliseRichText(generatedDraft);

      setWorkspaceContent(normalisedGenerated);
      setLastGeneratedContent(normalisedGenerated);

      await persistWorkspaceContent(normalisedGenerated);

      if (workspaceEditorRef.current) {
        workspaceEditorRef.current.focus();
      }

      setAiError(null);
      refetchUsage();
    } catch (err) {
      console.error("AI generation error:", err);
      setAiError(
        err instanceof Error
          ? err.message
          : "We couldn't generate content just now. Please try again."
      );
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleWorkspaceChange = (value: string) => {
    setWorkspaceContent(value);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistWorkspaceContent(value);
    }, 800);
  };

  const handleWorkspaceBlur = async (value: string) => {
    if (!localTask) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const normalisedContent = normaliseRichText(value);
    const existingContent = normaliseRichText(localTask.notes ?? "");

    if (normalisedContent === existingContent) {
      return;
    }

    await persistWorkspaceContent(normalisedContent);
  };

  const handleNavigateTask = (targetTask: TaskRecord | null) => {
    if (!targetTask) return;
    // Update local state immediately
    setLocalTask(targetTask);
    setTitleValue(targetTask.title ?? "");
    setWorkspaceContent(targetTask.notes ?? "");
    setEditingTitle(false);
    setError(null);
    setAiContent(null);
    setAiError(null);
    setIsGeneratingContent(false);
    setLastGeneratedContent(null);
    // Update the task in parent component
    if (onTaskChange) {
      onTaskChange(targetTask);
    }
  };

  const handleDelete = async () => {
    if (!localTask?.id || !localTask.launchId) return;

    try {
      await deleteTask(localTask.id, localTask.launchId);
      onClose();
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("Failed to delete task");
    }
  };

  // Don't render if no task (but allow AnimatePresence to handle open/close)
  if (!task || !localTask) {
    return null;
  }

  const dueDate = formatDate(localTask.due_date);
  const statusMeta = STATUS_META[statusValue];
  const descriptionHtml = normaliseRichText(localTask.description ?? "");
  const hasDescription = descriptionHtml.trim().length > 0;

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] sm:w-[600px] md:w-[700px] lg:w-[800px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Minimal & Sticky */}
            <div className="flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-6 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
              <div className="flex items-center gap-2">
                  <button
                  onClick={() => handleNavigateTask(previousTask)}
                  disabled={!previousTask}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-[color:var(--muted)] transition-all hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous task"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                  <button
                  onClick={() => handleNavigateTask(nextTask)}
                  disabled={!nextTask}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-[color:var(--muted)] transition-all hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next task"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-1 py-1 shadow-[var(--shadow-subtle)]">
                  {STATUS_OPTIONS.map((option) => {
                    const isActive = statusValue === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        disabled={isPending}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-all border border-transparent",
                          isActive
                            ? "bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] text-[color:var(--heading)] border-[color:var(--border-strong)] shadow-[var(--shadow-subtle)]"
                            : "text-[color:var(--muted)] hover:text-[color:var(--heading)] hover:bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] hover:border-[color:var(--border-strong)]",
                          isPending && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <div className="h-6 w-px bg-[color:var(--border)]" />
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[var(--surface)] border-[color:var(--border)] text-[color:var(--text)] sm:max-w-[425px] shadow-[var(--shadow-soft)]">
                      <DialogHeader>
                        <DialogTitle className="text-[color:var(--heading)]">Delete Task</DialogTitle>
                        <DialogDescription className="text-[color:var(--muted)]">
                          Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                          <Button variant="outline" className="border-[color:var(--border)] bg-transparent text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_94%,transparent)]">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <button
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] hover:text-[color:var(--text)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pt-14">
              {/* Hero Section */}
              <div className="relative border-b border-[color:var(--border)] bg-[color:var(--card)] px-8 py-10 shadow-[var(--shadow-subtle)]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                        statusMeta.badge
                      )}
                      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-current"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                      </span>
                      {statusMeta.label}
                    </span>

                    {dueDate && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-1 text-xs font-medium text-[color:var(--muted)]">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {dueDate}
                      </span>
                    )}
                  </div>

                  <div className="group relative">
                    {editingTitle ? (
                      <input
                        className="w-full bg-transparent text-4xl font-bold leading-tight text-[color:var(--heading)] placeholder-[color:var(--muted)] focus:outline-none"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                        value={titleValue}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        placeholder="Task title"
                        autoFocus
                      />
                    ) : (
                      <h1
                        className="text-4xl font-bold leading-tight text-[color:var(--heading)] cursor-text hover:opacity-90 transition-opacity"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                        onClick={() => setEditingTitle(true)}
                      >
                        {localTask.title || "Untitled task"}
                      </h1>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* The Brief */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    <List className="h-4 w-4" />
                    The Brief
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-6 shadow-[var(--shadow-subtle)]">
                    {hasDescription ? (
                      <div
                        className="prose prose-sm max-w-none text-[color:var(--text)] leading-relaxed"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-[color:var(--muted)]">No brief provided for this task.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Your Work */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                      <Pencil className="h-4 w-4" />
                      Your Work
                    </div>

                    {/* AI Button - Contextual */}
                    {shouldShowAiSection && (
                      <Button
                        className={cn(
                          "h-9 gap-2 rounded-full px-4 text-xs font-semibold transition-all border-0",
                          !canUseAI || safeCredits === 0
                            ? AI_BUTTON_DISABLED_CLASS
                            : "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40"
                        )}
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                        onClick={handleGenerateContent}
                        disabled={isGeneratingContent || isSaving || !canUseAI || safeCredits === 0}
                      >
                        {isGeneratingContent ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-3.5 w-3.5" />
                            {aiContent ? "Regenerate Draft" : "Generate Draft"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 opacity-0 transition-opacity group-focus-within:opacity-100 blur-sm" />
                    <div className="relative">
                      <RichTextEditor
                        editorRef={workspaceEditorRef as React.RefObject<HTMLDivElement>}
                        value={workspaceContent}
                        onChange={handleWorkspaceChange}
                        onBlur={handleWorkspaceBlur}
                        placeholder={
                          shouldShowAiSection
                            ? "Type your post, email, or announcement here, or use the AI button to generate a draft..."
                            : "Start writing your content here..."
                        }
                        showToolbar={true}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {saveStatus === "saving" && (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Saving changes...
                        </span>
                      )}
                      {saveStatus === "saved" && (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          All changes saved
                        </span>
                      )}
                    </div>

                    {shouldShowAiSection && canUseAI && (
                      <span className="text-xs text-slate-500">
                        {creditsDetailText}
                      </span>
                    )}
                  </div>

                  {aiError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-700">
                      <p className="font-medium">Generation failed</p>
                      <p className="mt-1 opacity-80">{aiError}</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-700">
                      <p className="font-medium">Error</p>
                      <p className="mt-1 opacity-80">{error}</p>
                    </div>
                  )}
                </section>
              </div>

              {/* Bottom Spacer */}
              <div className="h-20" />
            </div>
            {/* Footer */}
            <div className="border-t border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-subtle)]">
              <div className="flex items-center justify-between">
                {localTask?.id && localTask?.post_time ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-full border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]"
                    asChild
                    title="Add to calendar"
                  >
                    <a href={`/api/calendar/task/${localTask.id}`} download={`${localTask.title || "task"}.ics`}>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Add to calendar</span>
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-full border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] text-[color:var(--muted)] cursor-not-allowed"
                    disabled
                    title="Set a date & time to add this task to your calendar"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Add to calendar</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

