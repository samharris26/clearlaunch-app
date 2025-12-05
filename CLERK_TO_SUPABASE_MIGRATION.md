# Clerk to Supabase Auth Migration Guide

This document tracks the migration from Clerk to Supabase Auth.

## ✅ Completed

1. ✅ Installed `@supabase/ssr` package
2. ✅ Created Supabase auth helpers (`lib/supabase/server.ts`, `lib/supabase/client.ts`)
3. ✅ Updated middleware to use Supabase Auth
4. ✅ Created new login/signup pages with Supabase Auth
5. ✅ Updated logout page
6. ✅ Updated Stripe checkout API route
7. ✅ Updated dashboard page
8. ✅ Removed ClerkProvider from root layout

## 🔄 Remaining Files to Update

### Server Actions (Replace `auth()` from Clerk with `getUser()` from Supabase)

**Pattern to follow:**
```typescript
// OLD (Clerk)
import { auth } from "@clerk/nextjs/server";
const { userId } = await auth();

// NEW (Supabase)
import { getUser } from "@/lib/supabase/server";
const user = await getUser();
const userId = user?.id;
```

**Files to update:**
- [ ] `app/(app)/onboarding/action.ts`
- [ ] `app/(app)/onboarding/new-action.ts`
- [ ] `app/(app)/launches/create/action.ts`
- [ ] `app/(app)/launch/[id]/generate-ai-plan/action.ts`
- [ ] `app/(app)/launch/[id]/update-task/action.ts`
- [ ] `app/(app)/launch/[id]/generate-task-content/action.ts`
- [ ] `app/(app)/reset-onboarding/action.ts`
- [ ] `lib/usage-checks-simple.ts`
- [ ] `lib/usage-checks.ts`

### Page Components (Server Components)

**Pattern to follow:**
```typescript
// OLD (Clerk)
import { auth, currentUser } from "@clerk/nextjs/server";
const { userId } = await auth();
const user = await currentUser();
const displayName = user?.firstName ?? user?.username ?? "friend";

// NEW (Supabase)
import { getUser, createClient } from "@/lib/supabase/server";
const user = await getUser();
if (!user) redirect("/login");
const userId = user.id;
const supabase = await createClient();
const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "friend";
```

**Files to update:**
- [ ] `app/(app)/pricing/page.tsx` - Already uses `getUser()` but check for any Clerk references
- [ ] `app/(app)/settings/page.tsx`
- [ ] `app/(app)/profile/page.tsx`
- [ ] `app/(app)/launches/page.tsx`
- [ ] `app/(app)/launch/[id]/page.tsx`
- [ ] `app/(app)/debug-usage/page.tsx`
- [ ] `app/(app)/debug-tasks/page.tsx`

### Client Components

**Pattern to follow:**
```typescript
// OLD (Clerk)
import { useUser } from "@clerk/nextjs";
const { user } = useUser();

// NEW (Supabase)
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();
const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

**Files to check:**
- [ ] `components/Providers.tsx` - Remove ClerkProvider if present
- [ ] Any client components using `useUser()` from Clerk

### Remove Old Files

- [ ] `app/login/[[...rest]]/page.tsx` - Old Clerk login (replaced)
- [ ] `app/sign-up/[[...rest]]/page.tsx` - Old Clerk signup (replaced)

### Environment Variables

Make sure you have these in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Considerations

**Important:** Supabase Auth uses UUIDs for user IDs, while Clerk uses strings like `user_xxx`. 

You may need to:
1. Check if your `users` table `userId` column accepts UUIDs
2. Update any foreign key constraints
3. Migrate existing Clerk user IDs to Supabase Auth user IDs (if you have existing users)

### Testing Checklist

- [ ] Login works
- [ ] Signup works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Authenticated users can access dashboard
- [ ] Server actions work with new auth
- [ ] API routes work with new auth
- [ ] Stripe checkout works
- [ ] User data persists correctly

### Removing Clerk

Once everything is migrated and tested:
```bash
npm uninstall @clerk/nextjs
```

Then remove any remaining Clerk environment variables from `.env.local`.

