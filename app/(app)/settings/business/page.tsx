import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BusinessSettingsClient from "./BusinessSettingsClient";
import { getBusinessProfile } from "@/lib/business-profile";

export default async function BusinessSettingsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }

  const businessProfile = await getBusinessProfile();

  return <BusinessSettingsClient initialData={businessProfile} />;
}
