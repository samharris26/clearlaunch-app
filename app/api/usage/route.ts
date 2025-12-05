import { NextResponse } from "next/server";
import { getUserUsage } from "@/lib/usage-checks-simple";

export async function GET() {
  try {
    const usage = await getUserUsage();
    
    if (!usage) {
      return NextResponse.json(
        { error: "User not found or not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}

