import { createClient, getUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Ensure user record exists in users table for new OAuth users
    const user = await getUser();
    if (user && user.email) {
      // First, check if user already exists by userId
      const { data: existingUserById } = await supabase
        .from("users")
        .select("*")
        .eq("userId", user.id)
        .maybeSingle();

      // Also check by email to detect if account already exists
      const { data: existingUserByEmail } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      // If account exists with different userId, sign out and redirect to login with message
      if (existingUserByEmail && existingUserByEmail.userId !== user.id) {
        console.log(`[OAuth Callback] Account already exists for ${user.email} with different userId. Signing out and redirecting to login.`);
        
        // Sign out the OAuth session so user can sign in with their existing account
        await supabase.auth.signOut();
        
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("An account with this email already exists. Please sign in with your existing account instead.")}`
        );
      }

      // Use the existing user record (prefer by userId, fallback to email)
      const existingUser = existingUserById || existingUserByEmail;

      if (!existingUser) {
        // New user - set defaults only
        console.log(`[OAuth Callback] Creating new user record for ${user.email}`);
        const userData: any = {
          userId: user.id,
          email: user.email,
          plan: 'free',
          ai_calls_used: 0,
          ai_calls_reset_date: new Date().toISOString().split('T')[0],
          onboarded: false,
        };

        const { error: upsertError } = await supabase
          .from("users")
          .upsert(userData, {
            onConflict: 'userId'
          });

        if (upsertError) {
          console.error("[OAuth Callback] Error creating user record:", upsertError);
        } else {
          console.log(`[OAuth Callback] Successfully created new user record for ${user.email}`);
        }
      } else {
        // Existing user - update ONLY userId and email, preserve ALL other fields
        console.log(`[OAuth Callback] Found existing user for ${user.email}, preserving all data including plan: ${existingUser.plan}`);
        
        // Build update object with ONLY userId and email changes
        // All other fields remain unchanged (Supabase UPDATE only changes specified fields)
        const updateData: any = {
          userId: user.id,
          email: user.email,
        };

        // Only update if userId or email actually changed
        if (existingUser.userId !== user.id || existingUser.email !== user.email) {
          // Use the existing userId to find the record (more reliable than email)
          const { error: updateError } = await supabase
            .from("users")
            .update(updateData)
            .eq("userId", existingUser.userId);

          if (updateError) {
            console.error("[OAuth Callback] Error updating userId/email:", updateError);
          } else {
            console.log(`[OAuth Callback] Successfully updated userId/email for existing account. All other data (plan, company_name, tone_of_voice, etc.) preserved.`);
          }
        } else {
          console.log(`[OAuth Callback] User record already up to date, no changes needed.`);
        }
      }
    }
  }

  // Redirect to dashboard - it will handle onboarding redirect if needed
  return NextResponse.redirect(`${origin}/dashboard`);
}

