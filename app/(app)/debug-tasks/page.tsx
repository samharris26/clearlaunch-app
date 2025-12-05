import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DebugTasksPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  const supabase = await createClient();
  // Get all launches for this user
  const { data: launches, error: launchesError } = await supabase
    .from("launches")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (launchesError) {
    return <div>Error fetching launches: {launchesError.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Tasks for All Launches</h1>
      
      {launches?.map((launch) => (
        <div key={launch.id} className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold">{launch.launchName}</h2>
          <p>Launch ID: {launch.id}</p>
          <p>Progress: {launch.progress}%</p>
          <p>Total Tasks: {launch.total_tasks}</p>
          <p>Completed Tasks: {launch.completed_tasks}</p>
          
          <div className="mt-2">
            <h3 className="font-medium">Tasks:</h3>
            <TasksList launchId={launch.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

async function TasksList({ launchId }: { launchId: string }) {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("launchId", launchId)
    .order("order", { ascending: true });

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-gray-500">No tasks found</div>;
  }

  return (
    <ul className="list-disc list-inside">
      {tasks.map((task) => (
        <li key={task.id} className="text-sm">
          {task.title} ({task.phase}) - AI: {task.ai_generated ? "Yes" : "No"}
        </li>
      ))}
    </ul>
  );
}

