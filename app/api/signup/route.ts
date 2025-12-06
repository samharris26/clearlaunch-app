import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Helper function to set CORS headers
function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [
    "http://localhost:4321", // Astro default dev port
    "http://localhost:3000", // Next.js default dev port
    "https://www.clearlaunch.co.uk", // Production domain
    "https://clearlaunch.co.uk", // Production domain (without www)
  ];

  // Check if origin is in allowed list
  let allowedOrigin: string;
  if (origin && allowedOrigins.includes(origin)) {
    // Origin is in allowed list - use it
    allowedOrigin = origin;
  } else if (process.env.NODE_ENV === "development") {
    // In development, allow any origin
    allowedOrigin = origin || "*";
  } else {
    // In production, if origin matches marketing site pattern, allow it
    if (origin && (origin.includes("clearlaunch.co.uk") || origin.includes("localhost"))) {
      allowedOrigin = origin;
    } else {
      // Default to first allowed origin or allow all (fallback)
      allowedOrigin = allowedOrigins[0] || "*";
    }
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { 
          status: 400,
          headers: getCorsHeaders(req),
        }
      );
    }

    // Very basic email shape check
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email" },
        { 
          status: 400,
          headers: getCorsHeaders(req),
        }
      );
    }

    const { error } = await supabaseServer
      .from("early_access_signups")
      .insert({
        email: email.toLowerCase().trim(),
        source: "holding_page",
      });

    // If duplicate (email already in the table), treat as success
    if (error) {
      const isUniqueViolation =
        error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique constraint");

      if (!isUniqueViolation) {
        console.error("Supabase insert error:", error);
        return NextResponse.json(
          { error: "Failed to save email" },
          { 
            status: 500,
            headers: getCorsHeaders(req),
          }
        );
      }
    }

    // Send welcome email (non-blocking - don't fail signup if email fails)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Only send email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        // Import resend (may throw if API key is not set in resend.ts)
        const { resend } = await import("@/lib/resend");
        const fromEmail = process.env.RESEND_FROM_EMAIL || "signup@clearlaunch.co.uk";
        
        await resend.emails.send({
        from: fromEmail,
        replyTo: "support@clearlaunch.co.uk",
        to: normalizedEmail,
        subject: "Welcome to ClearLaunch Early Access",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">ClearLaunch</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Thanks for signing up!</h2>
                
                <p style="color: #64748b; font-size: 16px;">
                  We're excited to have you on board for early access to ClearLaunch. We'll be in touch soon with next steps.
                </p>
                
                <p style="color: #64748b; font-size: 16px;">
                  In the meantime, you can learn more about what we're building at our website.
                </p>
                
                <div style="margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.clearlaunch.co.uk'}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                    Visit ClearLaunch
                  </a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 14px;">
                <p>You're receiving this because you signed up for early access.</p>
              </div>
            </body>
          </html>
        `,
        text: `Thanks for signing up!

We're excited to have you on board for early access to ClearLaunch. We'll be in touch soon with next steps.

Visit us at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.clearlaunch.co.uk'}

You're receiving this because you signed up for early access.`,
      });
      
        console.log("Welcome email sent successfully to:", normalizedEmail);
      } catch (emailError) {
        // Log error but don't fail the signup
        console.error("Failed to send welcome email:", emailError);
        // Continue - signup was successful even if email failed
      }
    } else {
      console.log("Resend API key not configured, skipping welcome email");
    }

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(req) }
    );
  } catch (err) {
    console.error("Signup route error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { 
        status: 500,
        headers: getCorsHeaders(req),
      }
    );
  }
}

