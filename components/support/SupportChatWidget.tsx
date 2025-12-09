/**
 * SupportChatWidget - Intercom-style help widget
 * 
 * A floating chat widget that appears on authenticated app pages.
 * When users submit a message, it sends an email via Resend to support@clearlaunch.co.uk.
 * No real-time chat or persistence - just a form that emails support.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";

interface SupportMessage {
  name?: string;
  email: string;
  message: string;
  pageUrl?: string;
}

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const [formData, setFormData] = useState<SupportMessage>({
    name: "",
    email: "",
    message: "",
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
  });

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Update pageUrl when component mounts or when panel opens
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setFormData((prev) => ({
        ...prev,
        pageUrl: window.location.href,
      }));
    }
  }, [isOpen]);

  // Focus first input when panel opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure panel is rendered
      setTimeout(() => {
        if (formData.email) {
          messageInputRef.current?.focus();
        } else {
          emailInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, formData.email]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Email is required.");
      emailInputRef.current?.focus();
      return;
    }

    if (!formData.message.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Message is required.");
      messageInputRef.current?.focus();
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setSubmitStatus("error");
      setErrorMessage("Please enter a valid email address.");
      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/support-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name?.trim() || undefined,
          email: formData.email.trim(),
          message: formData.message.trim(),
          pageUrl: formData.pageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send support message.");
      }

      // Success
      setSubmitStatus("success");
      // Clear message but keep name and email
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong sending your message. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[var(--shadow-soft)] transition-all hover:scale-110 hover:shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
        aria-label={isOpen ? "Close help chat" : "Open help chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 z-50 flex h-[420px] w-full max-w-sm flex-col rounded-2xl border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-chat-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <h2
                id="support-chat-title"
                className="text-lg font-semibold text-[color:var(--heading)]"
                style={{
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                }}
              >
                Need a hand?
              </h2>
              <p
                className="text-xs text-[color:var(--muted)]"
                style={{
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                }}
              >
                Ask us anything about your launch.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] hover:text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
            {/* Initial Message Bubble */}
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_20%,transparent)]">
                <MessageCircle className="h-4 w-4 text-[color:var(--primary)]" />
              </div>
              <div className="inline-block max-w-[80%] rounded-2xl rounded-tl-sm bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-3 py-2">
                <p
                  className="text-sm text-[color:var(--text)]"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  }}
                >
                  Hey! 👋 What do you need help with today?
                </p>
              </div>
            </div>

            {/* Success Message */}
            {submitStatus === "success" && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                <p
                  className="text-sm text-emerald-600 dark:text-emerald-400"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  }}
                >
                  Thanks! We've got your message and will get back to you soon.
                </p>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === "error" && errorMessage && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  }}
                >
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="border-t border-[color:var(--border)] p-4">
            <div className="space-y-3">
              {/* Name Input (Optional) */}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name (optional)"
                disabled={isSubmitting}
                className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                }}
              />

              {/* Email Input (Required) */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email *"
                required
                disabled={isSubmitting}
                ref={emailInputRef}
                className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                }}
              />

              {/* Message Input (Required) */}
              <div className="flex gap-2">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message *"
                  required
                  rows={3}
                  disabled={isSubmitting}
                  ref={messageInputRef}
                  className="flex-1 resize-none rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.email.trim() || !formData.message.trim()}
                  className="flex h-[72px] w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[var(--shadow-subtle)] transition-all hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

