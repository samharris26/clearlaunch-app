import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, email } = await req.json();

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("userId")
      .eq("userId", userId)
      .maybeSingle();

    if (existingUser) {
      // User already exists, return success
      return NextResponse.json({ success: true, message: "User already exists" });
    }

    // Create new user record
    const { error } = await supabase
      .from("users")
      .insert({
        userId: userId,
        email: email,
        plan: 'free',
        ai_calls_used: 0,
        ai_calls_reset_date: new Date().toISOString().split('T')[0],
        onboarded: false,
      });

    if (error) {
      console.error("Error creating user record:", error);
      return NextResponse.json(
        { error: "Failed to create user record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in create-user route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
