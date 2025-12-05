Here’s a **clean, Cursor-ready README** you can drop straight into your repo.
It gives structure, sequencing, and the exact implementation steps for the MVP.

---

# **ClearLaunch MVP – Implementation Plan**

*This README guides Cursor through all required tasks to implement the MVP based on the updated marketing/landing-page direction.*

---

## **0. Product Overview**

ClearLaunch helps users create **bounded, launch-specific timelines** (campaign beats) rather than endless content calendars.

A launch consists of:

* Launch metadata (goal, description, dates)
* Selected platforms
* A chosen launch template (SaaS, ecommerce, course, etc.)
* AI-generated tasks with dates, beats, owners, approvals, and copy outlines
* A dashboard showing launch health (completeness, coverage, workload)

This README contains all implementation steps required.

---

# **1. Database Changes (Supabase)**

## **1.1 Extend `launches` table**

Add:

* `goal_type` (text)
* `goal_value` (integer)
* `launch_start_date` (date)
* `launch_end_date` (date)
* `summary` (text)
* `template_id` (text)

### **Cursor task**

```
Inspect the Supabase schema and update the `launches` table via a new SQL migration that adds:

- goal_type text
- goal_value integer
- launch_start_date date
- launch_end_date date
- summary text
- template_id text

Regenerate/adjust the TypeScript types accordingly and ensure launch creation code still works with optional fields.
```

---

## **1.2 Create `launch_platforms` join table**

Columns:

* id (uuid pk)
* launch_id (uuid fk → launches)
* platform (text)
* handle (text)
* created_at (timestamptz default now())

Unique constraint: `(launch_id, platform)`

Also create platform enum/types in code:
`'x' | 'linkedin' | 'instagram' | 'email' | 'tiktok' | 'youtube'`.

### **Cursor task**

```
Create a new table `launch_platforms` with the fields above, including a unique constraint on (launch_id, platform).

Add a `lib/platforms.ts` module exporting:
- SUPPORTED_PLATFORMS array
- Platform union type

Regenerate TS types.
```

---

## **1.3 Extend `tasks` table**

Add:

* `platform` (text)
* `beat_code` (text)
* `owner_name` (text)
* `review_status` (text, default 'draft')
* `outline` (text)

### **Cursor task**

```
Create a migration that adds columns to `tasks`:

- platform text null
- beat_code text null
- owner_name text null
- review_status text not null default 'draft'
- outline text null

Update the TS type for Task and ensure existing insertions remain valid.
```

---

# **2. Onboarding Workflow (3-Step Wizard)**

The onboarding process should follow:

### **Step 1 – Tell us about your launch**

* Name
* Summary
* Goal type
* Goal value
* Launch start date
* Launch end date

### **Step 2 – Choose your platforms**

* Multi-select SUPPORTED_PLATFORMS
* Optional handle per selected platform

### **Step 3 – Choose a launch template**

Options:

* “SaaS feature release”
* “Ecommerce product drop”
* “Course / cohort launch”

### **Finish**

* Create launch
* Create launch_platform records
* Save template_id
* Navigate to launch detail page

### **Cursor task**

```
Implement a 3-step onboarding wizard matching the structure above.

Store values in local state until final submission.
On "Finish", insert launch + platform rows into Supabase.
Use our dark theme and shadcn components.

Update/create any files necessary: routes, components, server actions.
```

---

# **3. Launch Templates (Config File)**

Create `/lib/launchTemplates.ts` exporting:

* Types: `LaunchBeat`, `LaunchTemplate`
* Array `LAUNCH_TEMPLATES` with three templates
* Each template containing beats with:

  * code
  * label
  * default day offset
  * recommended platforms

### **Cursor task**

```
Create `lib/launchTemplates.ts` with:

- Types LaunchBeat and LaunchTemplate
- Array LAUNCH_TEMPLATES with:
  - SaaS feature release template
  - Ecommerce product drop template
  - Course/cohort launch template
  
Include 4–6 beats each (teaser, announce, social proof, last call etc.)
Add helper getLaunchTemplateById(id).
```

---

# **4. AI Task Generation Pipeline**

### **Behaviour**

Given a launch_id:

1. Load launch + platforms + template
2. Build AI prompt including:

   * Launch details
   * Platforms
   * Beats with offsets
3. Ask AI to return JSON tasks:

   * title
   * description
   * beat_code
   * platform
   * day_offset
   * outline
4. Convert day_offset → due_date
5. Insert tasks into Supabase

### **Cursor task**

```
Locate existing AI generation logic and refactor it to:

- Accept launch_id
- Load launch, platforms, template
- Build a system+user prompt that:
  - Uses beats from the template
  - Requests a bounded list of campaign tasks
  - Returns structured JSON (title, description, beat_code, platform, day_offset, outline)

After parsing:
- compute due_date = launch_start_date + day_offset
- insert tasks (with platform, beat_code, due_date, outline, review_status='draft')

Return the list of created tasks from the server action/API.
```

---

# **5. Task UI Enhancements**

Each card should show:

* Title
* Platform badge
* Due date
* Recommended posting time (from smart timing)
* Review status pill
* Owner (editable text)
* “Copy outline” button

### **Cursor task**

```
Update the task card component to show:

- platform badge
- due date
- review_status pill with dropdown (draft / needs_review / approved)
- owner_name editable inline
- "Copy outline" button using navigator.clipboard.writeText()

Implement Supabase update handlers for owner_name and review_status.
Use dark theme styling.
```

---

# **6. Smart Timing Suggestions (Lite)**

Add `post_time` column to tasks.

Hard-coded defaults:

* X/LinkedIn → 11:15
* Instagram → 19:00
* Email → 09:00

### **Cursor task**

```
Add post_time to the tasks table.
Create helper lib/smartTiming.ts that maps platform → recommended time.
When inserting tasks during AI generation, set post_time automatically.

Show "Best time: {post_time}" on task cards.
```

---

# **7. Launch Health Overview Panel**

Displayed on launch detail page:

* **Plan completeness** – % beats with at least 1 task
* **Platform coverage** – number of platforms represented
* **Team workload** – light / balanced / heavy based on avg tasks/day
* **Today’s key moments** – tasks due today

### **Cursor task**

```
Create lib/launchHealth.ts that:

- Accepts launch, tasks, template
- Returns:
  - planCompleteness (0–100)
  - platformCoverageCount
  - averageTasksPerDay
  - teamWorkloadLabel ('Light' | 'Balanced' | 'Heavy')

Create a new UI panel on the launch detail page showing:
- Plan completeness (with descriptor)
- Platform coverage
- Team workload
- Today's key moments (tasks due today)

Use cards matching our UI style.
```

---

# **8. Copy Alignment**

Align microcopy across onboarding and dashboard with landing-page tone:

* “Tell us about your launch”
* “Choose your platforms”
* “Get your launch timeline”
* “Today’s key moments”
* “Launch command centre”

### **Cursor task**

```
Perform a copy sweep on onboarding and launch detail pages:
- Replace headings/subheadings with marketing-aligned versions.
- Ensure tone is clear, confident, slightly conversational.
- Use UK spelling.

List the updated strings in the PR description.
```

---

# **End of README**

Let me know if you'd like a “developer-first" variation or one broken into subtasks for your internal board.
