import { NextRequest, NextResponse } from "next/server";
import { getUser, createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const { id: launchId } = await params;
    const supabase = await createClient();

    const { data: launch, error } = await supabase
      .from("launches")
      .select("initialAIGenerated")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    if (error || !launch) {
      return NextResponse.json({ error: "Launch not found" }, { status: 404 });
    }

    return NextResponse.json({
      initialAIGenerated: launch.initialAIGenerated || false,
    });
  } catch (error) {
    console.error("Error fetching launch initial AI status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

