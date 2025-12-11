"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const mode = searchParams.get("mode") || "login";
  const isSignup = mode === "signup";

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/app");
        return;
      }
    };
    checkSession();
  }, [router, supabase]);

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (isSignup) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Sign up
        let { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        // Ensure we have a session (email confirmations are off, but double check)
        let session = data.session;
        let sessionUser = data.user;

        if (!session || !sessionUser) {
          // Try to sign in immediately (in case session wasn't returned)
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            throw signInError;
          }

          session = signInData.session;
          sessionUser = signInData.user;
        }

        if (!session || !sessionUser) {
          throw new Error("Account created but we could not sign you in. Please try again.");
        }

        // Create user record in users table
        try {
          const response = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: sessionUser.id, email: sessionUser.email }),
          });

          if (!response.ok) {
            console.error('Failed to create user record:', await response.text());
          }
        } catch (err) {
          console.error('Error creating user record:', err);
        }

        // Redirect to app
        router.push("/app");
        router.refresh();
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        // Redirect to app
        router.push("/app");
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || `Failed to ${isSignup ? "sign up" : "sign in"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="w-full max-w-md rounded-xl border border-white/70 bg-white/95 p-8 shadow-[0_24px_55px_-28px_rgba(14,165,233,0.15)] backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/ClearLaunch-logo.svg"
            alt="ClearLaunch"
            className="h-10 w-auto"
          />
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">
          {isSignup ? "Create your ClearLaunch account" : "Welcome back"}
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignup ? 6 : undefined}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="••••••••"
            />
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-cyan-600 px-4 py-2.5 font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
          >
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                href="/auth?mode=login"
                className="font-medium text-cyan-600 hover:text-cyan-700"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                href="/auth?mode=signup"
                className="font-medium text-cyan-600 hover:text-cyan-700"
              >
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] p-4 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-sky-500/10 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-[80px]" />
          </div>
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white/95 p-8 shadow-[0_24px_55px_-28px_rgba(14,165,233,0.15)] backdrop-blur-sm">
            <div className="mb-8 flex justify-center">
              <img
                src="/ClearLaunch-logo.svg"
                alt="ClearLaunch"
                className="h-10 w-auto"
              />
            </div>
            <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
