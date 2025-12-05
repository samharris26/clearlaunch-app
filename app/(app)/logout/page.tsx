"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    };

    handleLogout();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-600">Signing out...</p>
    </div>
  );
}
