import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import HeaderBanner from "@/components/dashboard/HeaderBanner";
import SectionHeader from "@/components/dashboard/SectionHeader";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "friend";

  const primaryEmail = user.email ?? "—";
  const fullName = user.user_metadata?.full_name ?? "Unnamed Pilot";

  return (
    <div className="flex flex-col items-center gap-12 p-3">
      <HeaderBanner
        userName={displayName}
        statusMessage="Manage your ClearLaunch identity and workspace visibility"
      />

      <div className="flex w-full max-w-6xl flex-col gap-8">
        <SectionHeader
          title="Account"
          description="Your personal information"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Personal info</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Full name</dt>
                <dd className="mt-1 font-medium text-slate-900">{fullName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 font-medium text-slate-900">{primaryEmail}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link href="/settings" className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50">Update info</Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Workspace</h3>
            <p className="mt-2 text-sm text-slate-500">Control visibility, timezone and notification preferences.</p>
            <div className="mt-6">
              <Link href="/settings" className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50">Open settings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
