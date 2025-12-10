"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createTask, CreateTaskState } from "@/lib/actions/tasks";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    launchId: string;
}

const initialState: CreateTaskState = { message: "", errors: {} };

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className={cn(
                "w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40 border-0 transition-all",
                pending && "opacity-70 cursor-not-allowed"
            )}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
            ) : (
                "Create Task"
            )}
        </Button>
    );
}

export default function CreateTaskModal({ isOpen, onClose, launchId }: CreateTaskModalProps) {
    const createTaskWithId = createTask.bind(null, launchId);
    const [state, dispatch, isPending] = useActionState(createTaskWithId, initialState);
    const [phase, setPhase] = useState("pre-launch");
    const [platform, setPlatform] = useState("");

    useEffect(() => {
        if (state.message === "success") {
            onClose();
            // Reset state if needed, though component unmounts usually handle this
        }
    }, [state.message, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-[var(--card)] border-[color:var(--border)] text-[color:var(--text)] shadow-[var(--shadow-soft)]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-[color:var(--heading)]">Add New Task</DialogTitle>
                </DialogHeader>

                <form action={dispatch} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-[color:var(--muted)]">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            required
                            placeholder="e.g., Draft launch email"
                            className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        />
                        {state.errors?.title && (
                            <p className="text-xs text-red-500">{state.errors.title[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="phase" className="text-sm font-medium text-[color:var(--muted)]">
                                Phase
                            </label>
                            <Select
                                value={phase}
                                onValueChange={(value) => setPhase(value)}
                            >
                                <SelectTrigger id="phase" className="w-full">
                                    <SelectValue placeholder="Select phase" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pre-launch">Pre-launch</SelectItem>
                                    <SelectItem value="launch-day">Launch Day</SelectItem>
                                    <SelectItem value="post-launch">Post-launch</SelectItem>
                                </SelectContent>
                            </Select>
                            <input type="hidden" name="phase" value={phase} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="dueDate" className="text-sm font-medium text-[color:var(--muted)]">
                                Due Date
                            </label>
                            <div className="relative">
                                <input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                                />
                                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-[color:var(--muted)] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="platform" className="text-sm font-medium text-[color:var(--muted)]">
                            Platform (Optional)
                        </label>
                        <Select
                            value={platform}
                            onValueChange={(value) => setPlatform(value)}
                        >
                            <SelectTrigger id="platform" className="w-full">
                                <SelectValue placeholder="Select platform..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="twitter">Twitter/X</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="platform" value={platform} />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-[color:var(--muted)]">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Briefly describe what needs to be done..."
                            className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <SubmitButton />
                    </div>

                    {state.message && state.message !== "success" && (
                        <p className="text-sm text-red-400 text-center">{state.message}</p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
