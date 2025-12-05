"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  show: boolean;
  title?: string;
  description?: string;
}

function OverlayContent({ title, description }: { title: string; description?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex flex-col items-center gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/80 px-8 py-10 shadow-2xl shadow-slate-950/80 text-center"
        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 via-indigo-500/30 to-emerald-400/20 text-sky-300">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-50">{title}</p>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoadingOverlay({ show, title = "Building your launch plan…", description }: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show ? <OverlayContent title={title} description={description} /> : null}
    </AnimatePresence>,
    document.body
  );
}



