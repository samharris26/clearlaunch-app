import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserUsage } from "@/lib/usage-checks-simple";

export default async function DebugUsagePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  const usage = await getUserUsage();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Usage Debug</h1>
      <div className="bg-slate-100 p-4 rounded">
        <pre className="text-sm">
          {JSON.stringify(usage, null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-600">
          User ID: {userId}
        </p>
      </div>
    </div>
  );
}

