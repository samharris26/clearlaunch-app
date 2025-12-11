import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import BillingSuccessClient from "./BillingSuccessClient";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }

  const params = await searchParams;
  const sessionId = params.session_id;

  return <BillingSuccessClient sessionId={sessionId} />;
}
