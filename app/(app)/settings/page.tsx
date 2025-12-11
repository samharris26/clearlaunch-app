import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }
  const userId = user.id;

  const supabase = await createClient();
  // Fetch all launches (active + archived, exclude deleted)
  const { data: launchesData, error: launchesError } = await supabase
    .from("launches")
    .select("id, launchName, status, target_date, createdAt, archived_at")
    .eq("userId", userId)
    .neq("status", "deleted")
    .order("createdAt", { ascending: false });

  if (launchesError) {
    console.error("Error fetching launches for settings:", launchesError);
  }

  const launches = (launchesData || []).map((launch) => ({
    id: launch.id,
    name: launch.launchName || "Untitled Launch",
    status: launch.status || "active",
    targetDate: launch.target_date,
    createdAt: launch.createdAt,
    archivedAt: launch.archived_at,
  }));

  return <SettingsPageClient launches={launches} />;
}