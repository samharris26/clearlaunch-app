"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error);
        }
        // Clear any local storage or session data if needed
        // Redirect to auth page
        window.location.href = "/auth?mode=login";
      } catch (error) {
        console.error("Logout error:", error);
        // Still redirect even if there's an error
        window.location.href = "/auth?mode=login";
      }
    };

    handleLogout();
  }, [supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-600">Signing out...</p>
    </div>
  );
}
