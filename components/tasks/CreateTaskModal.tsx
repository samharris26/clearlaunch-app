"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createTask, CreateTaskState } from "@/lib/actions/tasks";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

    useEffect(() => {
        if (state.message === "success") {
            onClose();
            // Reset state if needed, though component unmounts usually handle this
        }
    }, [state.message, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-50">Add New Task</DialogTitle>
                </DialogHeader>

                <form action={dispatch} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-slate-300">
                            Task Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            required
                            placeholder="e.g., Draft launch email"
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        />
                        {state.errors?.title && (
                            <p className="text-xs text-red-400">{state.errors.title[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="phase" className="text-sm font-medium text-slate-300">
                                Phase
                            </label>
                            <select
                                id="phase"
                                name="phase"
                                value={phase}
                                onChange={(e) => setPhase(e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                            >
                                <option value="pre-launch">Pre-launch</option>
                                <option value="launch-day">Launch Day</option>
                                <option value="post-launch">Post-launch</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="dueDate" className="text-sm font-medium text-slate-300">
                                Due Date
                            </label>
                            <div className="relative">
                                <input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                                />
                                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="platform" className="text-sm font-medium text-slate-300">
                            Platform (Optional)
                        </label>
                        <select
                            id="platform"
                            name="platform"
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        >
                            <option value="">Select platform...</option>
                            <option value="email">Email</option>
                            <option value="instagram">Instagram</option>
                            <option value="twitter">Twitter/X</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="website">Website</option>
                            <option value="youtube">YouTube</option>
                            <option value="facebook">Facebook</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-slate-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Briefly describe what needs to be done..."
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none"
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
