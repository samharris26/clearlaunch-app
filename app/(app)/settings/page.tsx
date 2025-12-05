import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  return <SettingsPageClient />;
}