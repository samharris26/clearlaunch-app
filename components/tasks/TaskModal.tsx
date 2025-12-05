"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AI_BUTTON_ACTIVE_CLASS, AI_BUTTON_DISABLED_CLASS } from "@/lib/aiButtonStyles";
import {
  Calendar,
  CalendarClock,
  Sparkles,
  Tag,
  Globe,
  Loader2,
  Copy,
  Wand2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
  ChevronDown,
  Pencil,
  X,
} from "lucide-react";
import { TaskRecord } from "@/types/tasks";
import { updateTask } from "@/app/(app)/launch/[id]/update-task/action";
import { generateTaskContentAction } from "@/app/(app)/launch/[id]/generate-task-content/action";
import { generateContentAction } from "@/app/(app)/launch/[id]/generate-content/action";
import { useUsage } from "@/hooks/useUsage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TaskModalProps = {
  task: TaskRecord;
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

const STATUS_FLOW: Record<StatusOption["value"], StatusOption["value"]> = {
  todo: "in_progress",
  in_progress: "completed",
  completed: "todo",
};

const STATUS_META: Record<StatusOption["value"], { label: string; badge: string; button: string; helper: string }>
  = {
  todo: {
    label: "To do",
    badge: "bg-slate-900 text-slate-300 border border-slate-700",
    button: "Mark as in progress",
    helper: "Ready to kick off",
  },
  in_progress: {
    label: "In progress",
    badge: "bg-sky-500/10 text-sky-300 border border-sky-500/30",
    button: "Mark as complete",
    helper: "Work underway",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
    button: "Reopen task",
    helper: "All done",
  },
};

const PHASE_COLOR_MAP: Record<string, string> = {
  "getting started": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "pre-launch": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "launch day": "bg-green-50 text-green-700 border-green-200",
  "post-launch": "bg-purple-50 text-purple-700 border-purple-200",
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  marketing: "bg-pink-50 text-pink-700 border-pink-200",
  content: "bg-cyan-50 text-cyan-700 border-cyan-200",
  technical: "bg-green-50 text-green-700 border-green-200",
  partnerships: "bg-purple-50 text-purple-700 border-purple-200",
  analytics: "bg-orange-50 text-orange-700 border-orange-200",
  research: "bg-indigo-50 text-indigo-700 border-indigo-200",
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

function richTextToPlain(value?: string | null) {
  if (!value) return "";
  if (!HTML_TAG_REGEX.test(value)) return value;
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
        "flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 shadow-xl shadow-slate-950/60 transition-shadow focus-within:shadow-xl focus-within:ring-2 focus-within:ring-sky-500/30",
        !showToolbar && "overflow-hidden"
      )}
    >
      {showToolbar && (
        <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-900/80 px-3 py-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            onClick={() => applyCommand("bold")}
            aria-label="Bold"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            onClick={() => applyCommand("italic")}
            aria-label="Italic"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            onClick={() => applyCommand("underline")}
            aria-label="Underline"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-slate-700" />
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            onClick={() => applyCommand("insertUnorderedList")}
            aria-label="Bullet list"
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            onClick={() => applyCommand("insertOrderedList")}
            aria-label="Numbered list"
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        className={cn(
          "min-h-[160px] max-h-[240px] w-full px-4 py-4 text-base leading-7 text-slate-200 focus:outline-none overflow-y-auto",
          showToolbar ? "rounded-b-xl" : "rounded-xl"
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

  // STRATEGY mode: Notes field present
  const notesValue = platformContent.Notes;
  if (typeof notesValue === "string" && notesValue.trim().length > 0) {
    return notesValue;
  }

  const sections: string[] = [];

  const formatList = (label: string, items: string[]) => {
    if (!items.length) return "";
    const listItems = items.map((item) => `<li>${item}</li>`).join("");
    return `<p><strong>${label}:</strong></p><ul>${listItems}</ul>`;
  };

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

  // Handle any other keys dynamically
  for (const [key, value] of Object.entries(platformContent)) {
    if (["Notes", "Email", "Instagram_Reel", "Instagram_Carousel", "Instagram_Story", "TikTok"].includes(key)) {
      continue;
    }

    const label = key.replace(/_/g, " ");
    if (typeof value === "string" && value.trim()) {
      sections.push(`<p><strong>${label}:</strong> ${value}</p>`);
    } else if (Array.isArray(value) && value.length > 0) {
      sections.push(formatList(label, value));
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

function formatDateTime(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TaskModal({ task, open, onClose, onTaskChange }: TaskModalProps) {
  const [localTask, setLocalTask] = useState<TaskRecord>(task);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title ?? "");
  // Workspace content state - this is the single source of truth for the editor
  const [workspaceContent, setWorkspaceContent] = useState(task.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<GeneratedTaskContent | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Save status and debouncing
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track AI vs manual source
  const [lastGeneratedContent, setLastGeneratedContent] = useState<string | null>(null);

  // For focusing the editor
  const workspaceEditorRef = useRef<HTMLDivElement>(null);
  const { aiCallsRemaining, usage, loading: usageLoading, refetch: refetchUsage } = useUsage();
  const safeCredits = typeof aiCallsRemaining === "number" ? Math.max(aiCallsRemaining, 0) : 0;
  const totalCredits = usage?.maxAiCalls ?? undefined;

  // Check if user is on free plan and if initial AI generation has been done
  const isFreePlan = usage?.plan === 'free';

  // For free plan, show "plan regenerations", for others show "AI credits"
  const creditLabel = isFreePlan ? "plan regeneration" : "AI credit";
  const creditsLabel = isFreePlan ? "plan regenerations" : "AI credits";
  const creditsDetailText = usageLoading
    ? "Checking…"
    : totalCredits !== undefined
      ? `you have ${safeCredits} ${safeCredits === 1 ? creditLabel : creditsLabel} remaining`
      : `${safeCredits} ${safeCredits === 1 ? creditLabel : creditsLabel} remaining`;
  const [initialAIGenerated, setInitialAIGenerated] = useState<boolean | null>(null);

  // Fetch launch data to check initialAIGenerated flag
  useEffect(() => {
    if (!localTask.launchId || !isFreePlan) {
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
  }, [localTask.launchId, isFreePlan]);

  // For free plan users, AI is only allowed if initialAIGenerated is false (initial generation)
  // For pro/power users, AI is always allowed (subject to usage limits)
  const canUseAI = !isFreePlan || (isFreePlan && initialAIGenerated === false);

  // Initialize workspace content from task whenever modal opens or task changes
  useEffect(() => {
    if (!task) return;
    const contentFromDb = task.notes ?? "";
    // Only update if the content actually changed to avoid infinite loops
    setWorkspaceContent((prev) => {
      if (prev === contentFromDb) return prev;
      console.log("Rehydrate workspace content", {
        taskId: task.id,
        length: contentFromDb.length,
        hasContent: contentFromDb.trim().length > 0,
        preview: contentFromDb.substring(0, 50) + (contentFromDb.length > 50 ? "..." : "")
      });
      return contentFromDb;
    });
    // Reset AI tracking when task changes
    setLastGeneratedContent(null);
  }, [task?.id]);

  // Cleanup timeouts on unmount
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

  // Reset other state when modal opens/closes
  useEffect(() => {
    setLocalTask(task);
    setTitleValue(task.title ?? "");
    setEditingTitle(false);
    setError(null);
    setAiContent(null);
    setAiError(null);
    setIsGeneratingContent(false);
  }, [task, open]);

  // Save workspace content when modal closes (backup save)
  const workspaceContentRef = useRef(workspaceContent);
  useEffect(() => {
    workspaceContentRef.current = workspaceContent;
  }, [workspaceContent]);

  const statusValue = useMemo<StatusOption["value"]>(() => {
    const normalised = STATUS_STORAGE_MAP[localTask.status?.toLowerCase?.() ?? ""] ?? "todo";
    return normalised;
  }, [localTask.status]);

  const shouldShowAiSection = useMemo(() => {
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
  }, [localTask.category, localTask.platform, localTask.title]);

  // Automatically detect content type from task
  const detectedContentType = useMemo((): "general" | "instagram" | "carousel" | "reels" | "email" => {
    const title = (localTask.title || "").toLowerCase();
    const platform = (localTask.platform || "").toLowerCase();
    const description = (localTask.description || "").toLowerCase();
    const category = (localTask.category || "").toLowerCase();

    // Check title first (most specific)
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
      // Could be post or reel, check for more clues
      if (title.includes("reel") || title.includes("video")) {
        return "reels";
      }
      return "instagram";
    }

    // Check platform
    if (platform === "instagram") {
      // Default to post unless description suggests otherwise
      if (description.includes("reel") || description.includes("video")) {
        return "reels";
      }
      return "instagram";
    }
    if (platform === "email") {
      return "email";
    }

    // Check category and description for clues
    if (category.includes("email") || description.includes("email campaign")) {
      return "email";
    }
    if (description.includes("carousel") || description.includes("slides")) {
      return "carousel";
    }
    if (description.includes("reel") || description.includes("video script")) {
      return "reels";
    }

    // Default to general if we can't determine
    return "general";
  }, [localTask.title, localTask.platform, localTask.description, localTask.category]);

  const aiContentText = useMemo(() => {
    if (!aiContent) return "";
    return formatGeneratedDescription(aiContent);
  }, [aiContent]);

  const handleLocalUpdate = (updates: Partial<TaskRecord>) => {
    let nextTask: TaskRecord | null = null;
    setLocalTask((prev) => {
      nextTask = { ...prev, ...updates };
      return nextTask;
    });

    if (nextTask && onTaskChange) {
      onTaskChange(nextTask);
    }
  };

  const persistUpdates = (updates: Parameters<typeof updateTask>[1]) => {
    const launchId = localTask.launchId;
    startTransition(async () => {
      try {
        const result = await updateTask(localTask.id, updates, launchId);
        if (result?.task) {
          const nextTask = result.task as TaskRecord;
          setLocalTask(nextTask);
          // Update titleValue if title changed
          if (updates.title !== undefined) {
            setTitleValue(nextTask.title ?? "");
          }
          // Update workspaceContent if notes changed
          if (updates.notes !== undefined && nextTask.notes !== undefined) {
            setWorkspaceContent(nextTask.notes ?? "");
          }
          onTaskChange?.(nextTask);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to update task");
        // refetch fallback: reset to original task
        setLocalTask(task);
        setTitleValue(task.title ?? "");
        if (onTaskChange) {
          onTaskChange(task);
        }
      }
    });
  };

  // Simple helper to save workspace content to Supabase (internal, no status updates)
  const saveWorkspaceContentInternal = async (content: string) => {
    if (!localTask.id) {
      console.error("Cannot save: task ID missing");
      return { success: false, error: "Task ID missing" };
    }

    const normalisedContent = normaliseRichText(content);
    const launchId = localTask.launchId;

    try {
      console.log("Saving workspace content", {
        taskId: localTask.id,
        length: normalisedContent.length,
        launchId: launchId || "missing"
      });

      const result = await updateTask(localTask.id, { notes: normalisedContent || null }, launchId);

      console.log("Update task result", {
        success: result?.success,
        hasTask: !!result?.task,
        taskId: localTask.id
      });

      if (result && result.success) {
        // Update local state from DB response if task was returned
        if (result.task) {
          const nextTask = result.task as TaskRecord;
          setLocalTask(nextTask);
          // Update workspace content from DB response to stay in sync
          if (nextTask.notes !== undefined) {
            setWorkspaceContent(nextTask.notes ?? "");
          }
          onTaskChange?.(nextTask);
        }
        console.log("Workspace content saved successfully", { taskId: localTask.id });
        return { success: true };
      }

      console.error("Update task returned unsuccessful result", result);
      return { success: false, error: "Update task returned unsuccessful result" };
    } catch (err) {
      console.error("Failed to save workspace content:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMessage };
    }
  };

  // Wrapper that handles save status UI updates
  const persistWorkspaceContent = async (content: string) => {
    if (!localTask.id) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const result = await saveWorkspaceContentInternal(content);

      if (result.success) {
        setIsSaving(false);
        setSaveStatus("saved");

        // Clear "saved" after 2 seconds
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
    if (value === statusValue) return;
    handleLocalUpdate({ status: value });
    persistUpdates({ status: DATABASE_STATUS_MAP[value] });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitleValue(newTitle);
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    const trimmedTitle = titleValue.trim();

    // If empty, revert to original
    if (!trimmedTitle) {
      setTitleValue(localTask.title ?? "");
      return;
    }

    // Only save if changed
    if (trimmedTitle === (localTask.title ?? "")) {
      return;
    }

    // Update local state immediately
    handleLocalUpdate({ title: trimmedTitle });

    // Persist to database
    persistUpdates({ title: trimmedTitle });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setTitleValue(localTask.title ?? "");
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
    if (isGeneratingContent || isSaving) return;
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

      // Format the generated content based on type
      const generatedDraft = formatContentForWorkspace(result, contentType);
      const normalisedGenerated = normaliseRichText(generatedDraft);

      console.log("AI generation complete", {
        taskId: localTask.id,
        contentType,
        length: normalisedGenerated.length,
        preview: normalisedGenerated.substring(0, 50) + (normalisedGenerated.length > 50 ? "..." : "")
      });

      // 1) Update local state immediately
      setWorkspaceContent(normalisedGenerated);
      // Track that this was AI-generated
      setLastGeneratedContent(normalisedGenerated);

      // 2) Persist to Supabase immediately and await completion
      await persistWorkspaceContent(normalisedGenerated);

      console.log("AI->workspace content saved", {
        taskId: localTask.id
      });

      // Focus the editor after generation
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

  const handleCopyContent = async () => {
    if (!aiContentText || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(aiContentText);
    } catch (err) {
      console.error("Failed to copy content", err);
      setAiError("Unable to copy to clipboard. You can highlight and copy manually.");
    }
  };

  const handleWorkspaceChange = (value: string) => {
    setWorkspaceContent(value);

    // Debounce saves to avoid spamming Supabase
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistWorkspaceContent(value);
    }, 800); // 800ms after last keystroke
  };

  const handleWorkspaceBlur = async (value: string) => {
    if (!localTask) return;

    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const normalisedContent = normaliseRichText(value);
    const existingContent = normaliseRichText(localTask.notes ?? "");

    // Only save if content actually changed
    if (normalisedContent === existingContent) {
      console.log("Blur save skipped - no changes", { taskId: localTask.id });
      return;
    }

    console.log("Blur save - saving workspace content", {
      taskId: localTask.id,
      newLength: normalisedContent.length,
      oldLength: existingContent.length
    });

    await persistWorkspaceContent(normalisedContent);
  };

  const createdDate = formatDateTime(localTask.created_at);
  const dueDate = formatDate(localTask.due_date);

  const statusMeta = STATUS_META[statusValue];
  const primaryButtonLabel = statusMeta.button;
  const nextStatus = STATUS_FLOW[statusValue];
  const descriptionHtml = normaliseRichText(localTask.description ?? "");
  const hasDescription = descriptionHtml.trim().length > 0;
  const createdDateText = createdDate ? `Created ${createdDate}` : "Created date unavailable";
  const statusMenuOptions = STATUS_OPTIONS.filter((option) => option.value !== statusValue);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[768px] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-0 !border-slate-800 gap-0 shadow-xl shadow-slate-950/60 [&>button]:hidden">
        <DialogTitle className="sr-only">{`Task details for ${localTask.title}`}</DialogTitle>

        <div className="bg-slate-950 border-b border-slate-800 px-6 pt-6 pb-4 relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-6 top-6 flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-200 z-10 cursor-pointer border-0 bg-transparent"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col pr-12">
            <div className="group relative inline-flex items-center gap-2 mb-4">
              {editingTitle ? (
                <input
                  className="w-full bg-transparent text-[30px] font-semibold leading-9 tracking-[-0.0075em] text-slate-50 placeholder-slate-500 focus:outline-none border-b border-slate-700 focus:border-slate-500 transition-colors pr-2"
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                  value={titleValue}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  placeholder="Task title"
                  autoFocus
                />
              ) : (
                <>
                  <h2
                    className="text-[30px] font-semibold leading-9 tracking-[-0.0075em] text-slate-50 cursor-text hover:opacity-80 transition-opacity"
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                    onClick={() => setEditingTitle(true)}
                  >
                    {localTask.title || "Untitled task"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingTitle(true)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center"
                    aria-label="Edit task title"
                  >
                    <Pencil className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              {dueDate && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Due {dueDate}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  statusMeta.badge
                )}
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current"></span>
                {statusMeta.label}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-950">
          <div className="max-h-[70vh] overflow-y-auto px-6 pb-3">
            <section className="mb-6">
              <div className="pt-5">
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-[18px] leading-7 font-semibold text-slate-50" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Description</h3>
                  {hasDescription ? (
                    <div
                      className="text-[16px] leading-6 text-slate-300"
                      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : (
                    <div className="text-[16px] leading-6 text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                      No description yet.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="my-3 h-px bg-slate-800" />

            <section className="flex flex-col gap-3 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-[18px] leading-7 font-semibold text-slate-50" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Your content workspace</h3>
                  {/* Helper text moved here to balance with AI button */}
                  <p className="text-[16px] leading-6 text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    {lastGeneratedContent
                      ? normaliseRichText(workspaceContent) === normaliseRichText(lastGeneratedContent)
                        ? "Generated with AI — you can edit this content."
                        : "Generated with AI — edited manually."
                      : workspaceContent.trim()
                        ? "Draft saved. You can edit this content anytime."
                        : (shouldShowAiSection
                          ? "Start writing or use AI to generate your content."
                          : "Start writing your content.")}
                  </p>
                </div>
                {shouldShowAiSection && (
                  <div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
                    <Button
                      className={cn(
                        "h-10 justify-center rounded-full px-4 text-sm font-semibold",
                        !canUseAI || safeCredits === 0
                          ? AI_BUTTON_DISABLED_CLASS
                          : AI_BUTTON_ACTIVE_CLASS
                      )}
                      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                      onClick={handleGenerateContent}
                      disabled={isGeneratingContent || isSaving || !canUseAI || safeCredits === 0}
                      title={
                        !canUseAI && isFreePlan
                          ? "Upgrade to Pro to unlock AI-powered editing and content tools."
                          : safeCredits === 0
                            ? "You've hit your monthly AI limit. Upgrade for more calls."
                            : undefined
                      }
                    >
                      {isGeneratingContent ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          {aiContent ? "Regenerate" : "Generate"}
                        </>
                      )}
                    </Button>
                    {canUseAI && (
                      <span className="text-xs font-medium text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                        This uses 1 {isFreePlan ? "plan regeneration" : "AI credit"}, {creditsDetailText}.
                      </span>
                    )}
                    {(!canUseAI && isFreePlan) && (
                      <Link
                        href="/pricing"
                        className="text-xs font-medium text-sky-400 hover:text-sky-300 underline"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                      >
                        Upgrade to Pro
                      </Link>
                    )}
                    {safeCredits === 0 && canUseAI && (
                      <Link
                        href="/pricing"
                        className="text-xs font-medium text-sky-400 hover:text-sky-300 underline"
                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                      >
                        Upgrade now
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <RichTextEditor
                  editorRef={workspaceEditorRef as React.RefObject<HTMLDivElement>}
                  value={workspaceContent}
                  onChange={handleWorkspaceChange}
                  onBlur={handleWorkspaceBlur}
                  placeholder={
                    shouldShowAiSection
                      ? "Type your post, email, or announcement here, or use the AI button above to generate it for you."
                      : "Type your post, email, or announcement here."
                  }
                  showToolbar={true}
                />
              </div>

              {/* Saving status indicator */}
              <div className="flex items-center justify-end mt-2 text-xs text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                <span>
                  {saveStatus === "saving" && "Saving…"}
                  {saveStatus === "saved" && "Saved"}
                </span>
              </div>

              {aiError && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  {aiError}
                </p>
              )}
            </section>

            {error && (
              <p className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                {error}
              </p>
            )}
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-slate-800 bg-slate-950 px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Left side empty for now */}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={cn(
                      "h-10 min-w-[210px] rounded-full border border-slate-700 bg-slate-900/80 px-6 text-sm font-semibold text-slate-50 shadow-sm transition-colors hover:bg-slate-900 hover:border-slate-600 flex items-center justify-between gap-2",
                      isPending && "opacity-80"
                    )}
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <span>{primaryButtonLabel}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-slate-900 border border-slate-800">
                  {statusMenuOptions.map((option) => {
                    const optionMeta = STATUS_META[option.value];
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        className="px-3 py-2 hover:bg-slate-800"
                        onSelect={(event) => {
                          event.preventDefault();
                          handleStatusChange(option.value);
                        }}
                      >
                        <span className="text-sm font-medium text-slate-200" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                          Set to {optionMeta.label}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
