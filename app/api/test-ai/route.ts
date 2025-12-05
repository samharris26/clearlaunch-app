import { NextRequest, NextResponse } from "next/server";
import { generateLaunchPlan } from "@/lib/ai";

export async function POST(request: NextRequest) {
  console.log("=== Test AI API called ===");
  
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return NextResponse.json(
        { 
          success: false, 
          error: "OpenAI API key not configured" 
        },
        { status: 500 }
      );
    }

    console.log("OpenAI API key found, length:", process.env.OPENAI_API_KEY.length);
    
    const testContext = {
      company_name: "Test Company",
      business_type: "tech",
      brand_description: "We create amazing tech products",
      audience_focus: "Developers and tech enthusiasts",
      launch_name: "Test Launch",
      launch_description: "A test product launch",
      launch_date: "2024-12-01",
      launch_category: "digital",
      launch_goal: "sales",
    };

    console.log("Testing AI with context:", testContext);
    
    // Test basic OpenAI connection first
    console.log("Calling generateLaunchPlan...");
    const tasks = await generateLaunchPlan(testContext);
    console.log("AI generated tasks:", tasks);
    
    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error("=== Test AI API error ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("Full error object:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
