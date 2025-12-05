import OpenAI from "openai";
import { buildLaunchPlanPrompt } from "@/lib/ai/LaunchPlanPrompt";
import { buildTaskCopyPrompt } from "@/lib/ai/TaskCopyPrompt";
import type { LaunchTemplate } from "@/lib/launchTemplates";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LaunchPlanTask {
  title: string;
  description: string;
  beat_code: string;
  platform: string;
  day_offset: number;
  outline: string;
  category?: string;
  phase?: string;
  order?: number;
  due_date?: string;
}

export interface RegenerateTaskRequest {
  title: string;
  description?: string | null;
  category?: string | null;
  phase?: string | null;
  platform?: string | null;
  due_date?: string | null;
  order?: number | null;
  beat_code?: string | null;
  outline?: string | null;
}

export interface LaunchContext {
  company_name: string;
  business_type: string;
  brand_description: string;
  audience_focus?: string;
  tone_of_voice?: string | string[];
  region?: string;
  launch_name: string;
  launch_description: string;
  summary: string;
  launch_date: string;
  launch_start_date?: string;
  launch_end_date?: string;
  launch_category: string;
  launch_goal: string;
  goal_type?: string;
  goal_value?: number | null;
  platforms: string[];
  platform_handles?: Record<string, string | undefined>;
  template_id?: string;
  template_name?: string;
}

// Helper function to infer fallback days_from_launch when missing
function defaultOffsetForPhase(phase: string, index: number, total: number): number {
  const normalisedPhase = (phase || "").toLowerCase();

  if (normalisedPhase.includes("research")) {
    // Earliest tasks: roughly 30–45 days before launch if runway allows
    return -30;
  }

  if (normalisedPhase.includes("pre-launch") || normalisedPhase.includes("prelaunch")) {
    // Spread pre-launch work before launch
    return -Math.max(1, Math.round(((total - index) / Math.max(total, 1)) * 21));
  }

  if (normalisedPhase.includes("launch day")) {
    return 0;
  }

  if (normalisedPhase.includes("post-launch") || normalisedPhase.includes("postlaunch")) {
    // Simple stagger after launch
    return index + 1;
  }

  // Sensible default if phase is unknown
  return -7;
}

export async function generateLaunchPlan(context: LaunchContext): Promise<LaunchPlanTask[]> {
  console.log("Starting AI launch plan generation with context:", context);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }

  const today = new Date();
  const launchDate = new Date(context.launch_date);
  const launchStartDate = context.launch_start_date ? new Date(context.launch_start_date) : null;
  const daysToLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`Days to launch: ${daysToLaunch}`);
  
  // Load template if template_id is provided
  let template: LaunchTemplate | undefined;
  let beatPhaseMap: Record<string, string> | undefined;
  if (context.template_id) {
    const { getLaunchTemplateById } = await import("@/lib/launchTemplates");
    template = getLaunchTemplateById(context.template_id);
    if (template) {
      console.log(`Using template: ${template.name} with ${template.beats.length} beats`);
      beatPhaseMap = template.beats.reduce<Record<string, string>>((acc, beat) => {
        acc[beat.code] = beat.phase;
        return acc;
      }, {});
    }
  }
  
  const prompt = buildLaunchPlanPrompt(context, daysToLaunch, template);
  console.log("Generated prompt:", prompt.substring(0, 200) + "...");

  const isPhasedTaskObject = (payload: any): boolean => {
    if (!payload || typeof payload !== "object") return false;
    const node = payload.tasks ?? payload;
    if (!node || typeof node !== "object") return false;
    return (
      Array.isArray(node.pre_launch ?? node.preLaunch) ||
      Array.isArray(node.launch_day ?? node.launchDay) ||
      Array.isArray(node.post_launch ?? node.postLaunch)
    );
  };

  const convertPayloadToArray = (payload: any): any[] | undefined => {
    if (!payload) return undefined;
    if (Array.isArray(payload)) return payload;
    if (!isPhasedTaskObject(payload)) return undefined;

    const node = payload.tasks ?? payload;
    const sections: Array<{ items: any[] | undefined; fallbackPhase: string }> = [
      { items: node.pre_launch ?? node.preLaunch, fallbackPhase: "Pre-launch" },
      { items: node.launch_day ?? node.launchDay, fallbackPhase: "Launch Day" },
      { items: node.post_launch ?? node.postLaunch, fallbackPhase: "Post-launch" },
    ];

    const flattened: any[] = [];
    sections.forEach(({ items, fallbackPhase }) => {
      if (Array.isArray(items)) {
        items.forEach((task) => {
          flattened.push({
            ...task,
            phase: task?.phase || fallbackPhase,
          });
        });
      }
    });

    return flattened.length ? flattened : undefined;
  };

  try {
    console.log("Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    console.log("OpenAI API response:", completion);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenAI response");
      throw new Error("No content generated by OpenAI");
    }

    console.log("Raw OpenAI content:", content);
    console.log("Raw content length:", content.length);
    console.log("Raw content preview (first 500 chars):", content.substring(0, 500));

    // Parse the JSON response
    let tasks: any;
    
    // Clean the content - remove any markdown formatting
    let cleanContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      console.log("Removed ```json fences");
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      console.log("Removed ``` fences");
    }
    
    console.log("Clean content length:", cleanContent.length);
    console.log("Clean content preview (first 500 chars):", cleanContent.substring(0, 500));
    
    // Step 1: Try direct JSON.parse on cleanContent
    try {
      console.log("Attempting direct JSON.parse...");
      const parsed = JSON.parse(cleanContent);
      console.log("Direct parse succeeded, type:", Array.isArray(parsed) ? 'array' : typeof parsed);
      
      if (Array.isArray(parsed)) {
        tasks = parsed;
        console.log("✅ Found array directly, length:", parsed.length);
      } else if (isPhasedTaskObject(parsed)) {
        tasks = parsed;
        const flattenedPreview = convertPayloadToArray(parsed);
        console.log("✅ Found phased task object, flattened length:", flattenedPreview?.length ?? 0);
      } else {
        console.log("⚠️ Parsed successfully but not an array or object with .tasks:", Object.keys(parsed || {}));
      }
    } catch (parseError) {
      console.log("Direct parse failed:", parseError instanceof Error ? parseError.message : String(parseError));
    }
    
    // Step 2: If direct parse didn't work, try regex extraction
    if (!tasks) {
      console.log("Trying regex extraction...");
      try {
        // Try to match a JSON array (more aggressive pattern)
        const arrayPattern = /\[[\s\S]*\]/;
        const arrayMatch = cleanContent.match(arrayPattern);
        if (arrayMatch) {
          console.log("Found array match, length:", arrayMatch[0].length);
          try {
            const parsed = JSON.parse(arrayMatch[0]);
            if (Array.isArray(parsed)) {
              tasks = parsed;
              console.log("✅ Parsed array from regex match, length:", parsed.length);
            } else if (isPhasedTaskObject(parsed)) {
              tasks = parsed;
              const flattenedPreview = convertPayloadToArray(parsed);
              console.log("✅ Parsed phased object from regex match, flattened length:", flattenedPreview?.length ?? 0);
            } else {
              console.log("⚠️ Regex array match parsed but not array or object with .tasks");
            }
          } catch (parseError) {
            console.log("Array regex match found but parsing failed:", parseError instanceof Error ? parseError.message : String(parseError));
          }
        } else {
          console.log("No array pattern found in content");
        }
        
        // If still no tasks, try to match a JSON object
        if (!tasks) {
          console.log("Trying object regex extraction...");
          const objectPattern = /\{[\s\S]*\}/;
          const objectMatch = cleanContent.match(objectPattern);
          if (objectMatch) {
            console.log("Found object match, length:", objectMatch[0].length);
            try {
              const parsed = JSON.parse(objectMatch[0]);
              if (isPhasedTaskObject(parsed)) {
                tasks = parsed;
                const flattenedPreview = convertPayloadToArray(parsed);
                console.log("✅ Parsed phased object from regex match, flattened length:", flattenedPreview?.length ?? 0);
              } else {
                console.log("⚠️ Object regex match parsed but no .tasks array found. Keys:", Object.keys(parsed || {}));
              }
            } catch (parseError) {
              console.log("Object regex match found but parsing failed:", parseError instanceof Error ? parseError.message : String(parseError));
            }
          } else {
            console.log("No object pattern found in content");
          }
        }
      } catch (regexError) {
        console.log("Regex extraction error:", regexError instanceof Error ? regexError.message : String(regexError));
      }
    }
    
    // Step 3: Last resort - try to repair common JSON issues
    if (!tasks || (!Array.isArray(tasks) && !isPhasedTaskObject(tasks))) {
      console.log("Attempting JSON repair...");
      try {
        // Try to fix common JSON issues
        let repaired = cleanContent;
        
        // Remove trailing commas before closing brackets/braces
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
        
        // Try to find and extract the array more aggressively
        // Look for array start and try to balance brackets
        const arrayStart = repaired.indexOf('[');
        if (arrayStart !== -1) {
          let bracketCount = 0;
          let braceCount = 0;
          let inString = false;
          let escapeNext = false;
          let endIndex = arrayStart;
          
          for (let i = arrayStart; i < repaired.length; i++) {
            const char = repaired[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }
            
            if (!inString) {
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
              
              if (bracketCount === 0 && braceCount === 0 && i > arrayStart) {
                endIndex = i + 1;
                break;
              }
            }
          }
          
          if (endIndex > arrayStart) {
            const extracted = repaired.substring(arrayStart, endIndex);
            console.log("Extracted array substring, length:", extracted.length);
            try {
              const parsed = JSON.parse(extracted);
              if (Array.isArray(parsed)) {
                tasks = parsed;
                console.log("✅ Successfully parsed repaired array, length:", parsed.length);
              }
            } catch {
              // Repair attempt failed
            }
          }
        }
      } catch (repairError) {
        console.log("JSON repair attempt failed:", repairError instanceof Error ? repairError.message : String(repairError));
      }
    }
    
    // Step 4: If all parsing attempts failed, throw error with detailed info
    const normalisedTasks = convertPayloadToArray(tasks);
    if (!normalisedTasks || normalisedTasks.length === 0) {
      console.error("❌ Failed to parse OpenAI launch plan content after all attempts");
      console.error("Content length:", content.length);
      console.error("Content (first 1000 chars):", content.substring(0, 1000));
      console.error("Content (last 500 chars):", content.substring(Math.max(0, content.length - 500)));
      console.error("Full content for debugging:", content);
      throw new Error("Invalid JSON response from OpenAI - expected phased task arrays");
    }
    const taskArray: any[] = normalisedTasks;

    console.log("Successfully parsed tasks:", taskArray);

    // Normalise tasks: ensure each has a numeric days_from_launch
    const tasksWithOffsets = taskArray.map((task: any, index: number) => {
      const offset =
        typeof task.days_from_launch === "number"
          ? task.days_from_launch
          : typeof task.day_offset === "number"
            ? task.day_offset
            : defaultOffsetForPhase(task.phase, index, taskArray.length);

      return {
        ...task,
        days_from_launch: offset,
        _originalIndex: index,
      };
    });

    // Sort tasks by days_from_launch (ascending), using original index as tiebreaker
    const sortedTasks = tasksWithOffsets.sort((a, b) => {
      if (a.days_from_launch === b.days_from_launch) {
        return a._originalIndex - b._originalIndex;
      }
      return a.days_from_launch - b.days_from_launch;
    });

    // Map to final LaunchPlanTask shape, computing due_date from days_from_launch
    const mappedTasks = sortedTasks.map((task, index) => {
      const dueBase = launchStartDate ? new Date(launchStartDate) : new Date(launchDate);
      dueBase.setDate(dueBase.getDate() + task.days_from_launch);

      return {
        title: task.title || `Task ${index + 1}`,
        description: task.description || "",
        category: task.category || "General",
        beat_code: task.beat_code || null,
        phase: task.phase || beatPhaseMap?.[task.beat_code] || "Pre-launch",
        order: index,
        platform: task.platforms ? task.platforms.join(', ') : (task.platform || null),
        due_date: dueBase.toISOString(),
      };
    });

    console.log("Mapped tasks:", mappedTasks);
    return mappedTasks;

  } catch (error) {
    console.error("Error generating launch plan:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw new Error(`Failed to generate launch plan: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export interface TaskContent {
  task_title: string;
  platform_content: {
    Instagram_Reel?: string;
    Instagram_Carousel?: string[];
    Instagram_Story?: string[];
    TikTok?: string;
    Email?: {
      subject: string;
      body: string;
    };
    [key: string]: any;
  };
  visual_direction?: string;
  cta_options?: string[];
  hashtags?: string[];
}

export async function generateTaskContent(
  task: LaunchPlanTask,
  context: LaunchContext
): Promise<TaskContent> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = buildTaskCopyPrompt(context, task);
  console.log("Task content prompt (first 800 chars):", prompt.slice(0, 800));

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content as string | undefined;
  if (!content) {
    throw new Error("No content generated by OpenAI for task");
  }

  let parsed: TaskContent;
  try {
    let clean = content.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    parsed = JSON.parse(clean);
  } catch (err) {
    const match = (content || "").match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Invalid JSON from OpenAI for task content");
    }
    parsed = JSON.parse(match[0] as string);
  }

  console.log("Generated TaskContent:", parsed);
  return parsed;
}

/*
  Old prompt builder (createLaunchPlanPrompt) and related helpers have been removed.
  buildLaunchPlanPrompt is now the single source of prompt content.
*/
function createLaunchPlanPrompt(context: LaunchContext, timeframeBucket: string, daysToLaunch: number): string {
  // Map platform names to display names
  const platformMap: Record<string, string> = {
    'instagram': 'Instagram',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'youtube': 'YouTube',
    'email': 'Email',
    'website': 'Website',
    'podcast': 'Podcast',
    'press': 'Press'
  };

  const displayChannels = context.platforms.map(platform => platformMap[platform] || platform);
  
  // Determine granularity level based on days (5 days to 5 months = ~150 days)
  const isUltraShort = daysToLaunch <= 5;
  const isShortSprint = daysToLaunch > 5 && daysToLaunch <= 21;
  const isMediumRunway = daysToLaunch > 21 && daysToLaunch <= 56;
  const isExtendedRunway = daysToLaunch > 56 && daysToLaunch <= 90;
  const isFullRunway = daysToLaunch > 90;
  
  // Build platform-specific guidance
  const platformGuidance = buildPlatformGuidance(displayChannels, context);
  
  // Build tone-specific guidance
  const toneGuidance = buildToneGuidance(context.tone_of_voice, context.region);
  
  // Build audience-specific guidance
  const audienceGuidance = buildAudienceGuidance(context.audience_focus, context.launch_goal);

  return `You are **ClearLaunch AI** — an expert product launch strategist for small teams or solo founders.  
Your job is to create an actionable, channel-synergised launch plan that adapts to the context provided below.  
The plan should feel like a guided roadmap — focused, motivating, and achievable.

---

### 🎯 OBJECTIVE
Generate a marketing and content **launch plan**, not a generic content calendar.  
Focus on helping the user build anticipation, deliver a strong launch moment, and sustain post-launch momentum.

**CRITICAL**: This launch is ${daysToLaunch} days away. Adapt your plan's granularity, urgency, and task count accordingly.

---

### ⚙️ OUTPUT RULES
Return only **valid JSON** — no markdown, no extra text.  
Output a single array of tasks:

\`\`\`json
[
  {
    "title": "",
    "description": "",
    "category": "Marketing | Content | Operations | Analytics | Partnerships | Research",
    "phase": "Research & Setup | Pre-launch | Launch Day | Post-launch",
    "platforms": ["Instagram", "Email"],
    "due_date": "YYYY-MM-DD"
  }
]
\`\`\`

Guidelines:

* Do **not** wrap in \`{ "tasks": [...] }\`.
* \`due_date\` values should be relative to the provided launch date (calculate from today: ${new Date().toISOString().split('T')[0]}).
* All tasks must be specific, actionable, and relevant to the provided context.

---

### 🕐 TIMELINE-AWARE SCALING LOGIC

**CRITICAL TASK COUNT REQUIREMENTS:**

${isUltraShort ? `- **Ultra-Short (≤5 days)**: Generate EXACTLY 4-6 tasks — focus on absolute essentials only (final prep, launch announcement, immediate follow-up).` : ''}
${isShortSprint ? `- **Short Sprint (6-21 days)**: Generate EXACTLY 6-10 tasks — high-level essentials with minimal build-up.` : ''}
${isMediumRunway ? `- **Medium Runway (22-56 days)**: Generate EXACTLY 12-18 tasks — campaign-level detail with teasers and momentum building.` : ''}
${isExtendedRunway ? `- **Extended Runway (57-90 days)**: Generate EXACTLY 18-25 tasks — detailed multi-channel plan with extended build-up and partnerships.` : ''}
${isFullRunway ? `- **Full Runway (91+ days / 3+ months)**: Generate EXACTLY 25-35 tasks — comprehensive, granular plan with influencer outreach, PR, extended campaigns, and detailed analytics.` : ''}

**YOUR LAUNCH IS ${daysToLaunch} DAYS AWAY - YOU MUST GENERATE ${
  isUltraShort ? '4-6' : 
  isShortSprint ? '6-10' : 
  isMediumRunway ? '12-18' : 
  isExtendedRunway ? '18-25' : 
  '25-35'
} TASKS. DO NOT GENERATE FEWER TASKS.**

| Plan Type         | Duration  | Granularity                  | Required Task Count | Key Focus |
| ----------------- | --------- | ---------------------------- | ------------------- | --------- |
| **Ultra-Short**   | ≤ 5 days  | Critical essentials only     | 4–6                | Final prep, launch, immediate follow-up |
| **Short Sprint**  | 6–21 days | High-level essentials        | 6–10               | Quick setup, announce, basic follow-up |
| **Medium Runway** | 22–56 days| Campaign-level detail        | 12–18              | Teasers, countdowns, partnerships, reviews |
| **Extended Runway** | 57–90 days | Detailed multi-channel plan | 18–25              | Extended build-up, partnerships, influencer outreach |
| **Full Runway**   | 91+ days  | Comprehensive granular plan | 25–35              | Full campaigns, PR, influencers, extended analytics |

* Increase task count if multiple platforms require distinct actions.
* Merge similar platform tasks into combined ones when appropriate.
* Never exceed 35 total tasks.

---

### 🧱 PHASES & TIMELINE DISTRIBUTION

Use these phases and distribute tasks based on timeline:

1. **Research & Setup** (${isUltraShort ? 'Skip or minimal' : isShortSprint ? '10-20% of tasks' : isMediumRunway ? '15-25% of tasks' : '20-30% of tasks'})
   - Orientation, brand checks, competitor research, positioning, tool setup
   - ${isUltraShort ? 'Skip detailed research — assume basics are done.' : isShortSprint ? 'Quick competitor check and positioning only.' : 'Include comprehensive research and setup tasks.'}

2. **Pre-launch** (${isUltraShort ? '20-30% of tasks' : isShortSprint ? '40-50% of tasks' : isMediumRunway ? '50-60% of tasks' : '40-50% of tasks'})
   - Teaser campaigns, waitlist building, asset creation, influencer outreach
   - ${isUltraShort ? 'Minimal teasers — focus on final assets.' : isShortSprint ? 'Quick teaser campaign (1-2 posts).' : isMediumRunway ? 'Multi-week teaser campaign with countdowns.' : 'Extended build-up with multiple campaign beats.'}

3. **Launch Day** (${isUltraShort ? '30-40% of tasks' : isShortSprint ? '20-30% of tasks' : isMediumRunway ? '15-20% of tasks' : '10-15% of tasks'})
   - Main announcement and coordinated push across platforms
   - ${isUltraShort ? 'Focus heavily on launch day execution.' : 'Coordinate simultaneous multi-platform announcement.'}

4. **Post-launch** (${isUltraShort ? '20-30% of tasks' : isShortSprint ? '10-20% of tasks' : isMediumRunway ? '15-20% of tasks' : '20-25% of tasks'})
   - Feedback collection, user content, retention, analytics review, re-engagement
   - ${isUltraShort ? 'Immediate follow-up and feedback collection.' : 'Include feedback loops and retention strategies.'}

---

### 📱 PLATFORM-SPECIFIC BEST PRACTICES

${platformGuidance}

---

### 🔄 MULTI-PLATFORM SYNERGY & COORDINATION

${displayChannels.length > 1 ? `**You have ${displayChannels.length} platforms: ${displayChannels.join(', ')}**

**Coordination Strategy:**

1. **Asset Reuse**: Create tasks that produce assets usable across platforms (e.g., "Create launch video assets for Instagram Reels and YouTube Shorts").

2. **Timing Coordination**: 
   - Launch Day tasks should coordinate simultaneous posts across platforms
   - Pre-launch teasers should build momentum across all channels
   - Specify platform-specific timing in the task description when needed

3. **Message Consistency**: 
   - Ensure core messaging and CTAs are consistent across platforms
   - Adapt tone and format to each platform's audience while maintaining brand voice
   - Example task: "Announce launch with consistent messaging across ${displayChannels.join(' and ')}"

4. **Cross-Platform Amplification**:
   - Include tasks that leverage one platform to drive traffic to another
   - Example: "Share Instagram Reel in email newsletter" or "Pin launch announcement tweet to Twitter profile"

5. **Platform-Specific Optimization**:
   - Combine where logical, describe platform-specific requirements in the task description
   - Example: One task "Launch announcement campaign" with platform-specific details in the description

**Example Multi-Platform Task:**

\`\`\`json
{
  "title": "Coordinate launch announcement across all channels",
  "description": "Execute simultaneous launch announcement with platform-optimised content. Ensure consistent messaging and timing across ${displayChannels.join(', ')} while respecting each platform's best practices.",
  "phase": "Launch Day",
  "category": "Content",
  "platforms": ${JSON.stringify(displayChannels)},
    ${displayChannels.map(p => {
      if (p === 'Instagram') return '"Publish Instagram Reel with product demo and CTA to website"';
      if (p === 'Email') return '"Send email announcement with exclusive launch offer"';
      if (p === 'Twitter') return '"Tweet launch announcement with product link and pinned thread"';
      if (p === 'LinkedIn') return '"Publish LinkedIn post with professional launch announcement"';
      return `"Post ${p} announcement with platform-optimised content"`;
    }).join(',\n    ')}
  ],
  "due_date": "${context.launch_date}"
}
\`\`\`
` : `**Single Platform Focus: ${displayChannels[0]}**

Focus tightly on ${displayChannels[0]}'s best practices. Create tasks that are specific to this platform's unique features, audience, and content formats.`}

---

### 🧠 GRANULARITY RULES BY TIMELINE

${isUltraShort ? `**Ultra-Short (≤5 days):**
* Focus ONLY on critical actions: final asset prep → launch announcement → immediate follow-up
* Skip research, detailed planning, or extended campaigns
* Each task should be immediately actionable
* Example: "Finalise launch announcement post" (not "Plan content calendar")` : ''}

${isShortSprint && !isUltraShort ? `**Short Sprint (6-21 days):**
* Focus on critical actions only (quick setup → announce → follow-up)
* Avoid micro-tasks like "write caption" — combine into "Create and schedule launch announcement post"
* Group related actions: "Plan and execute 2-3 teaser posts" (not separate tasks for each post)
* Include essential setup but skip extensive research` : ''}

${isMediumRunway ? `**Medium Runway (22-56 days):**
* Include campaign beats: teasers, countdowns, partnerships, early reviews
* Group related content in one task: "Plan and schedule 3-5 teaser posts across ${displayChannels.length > 1 ? 'platforms' : displayChannels[0]}"
* Break down complex campaigns into logical steps in the task description
* Include influencer outreach, early-bird offers, and partnership tasks` : ''}

${isExtendedRunway ? `**Extended Runway (57-90 days):**
* Include detailed multi-channel plan with extended build-up
* Add influencer outreach, partnerships, PR preparation
* Include multi-phase campaigns with specific milestones
* Add detailed content planning and scheduling
* Example: "Month 1: Research and identify 10-15 influencers, Month 2: Outreach and partnerships, Month 3: Launch prep"` : ''}

${isFullRunway ? `**Full Runway (91+ days / 3+ months):**
* Comprehensive, granular plan with full campaign cycles
* Include extended influencer programs, PR campaigns, media outreach
* Add detailed content calendars with multiple phases
* Include A/B testing, optimization, and extended analytics
* Break down into monthly or bi-weekly phases
* Example: "Q1: Brand awareness and community building, Q2: Pre-launch momentum, Q3: Launch and post-launch optimization"` : ''}

**Granularity Guidelines:**
* Each task should represent 2-8 hours of work for a solo founder or small team
* Describe multiple steps in the task description when a task has 3+ similar steps
* Avoid tasks that are too broad ("Plan entire launch") or too narrow ("Write one Instagram caption")
* Balance: specific enough to be actionable, broad enough to be meaningful

---

### 🎨 BRAND VOICE & AUDIENCE ALIGNMENT

${toneGuidance}

${audienceGuidance}

**Task Description Style:**
* Match the brand's tone: ${Array.isArray(context.tone_of_voice) ? context.tone_of_voice.join(' and ') : context.tone_of_voice || 'Professional'}
* Write descriptions that feel ${Array.isArray(context.tone_of_voice) ? context.tone_of_voice[0].toLowerCase() : (context.tone_of_voice || 'professional').toLowerCase()} and motivating
* Use language that resonates with: ${context.audience_focus || 'your target audience'}
* Keep descriptions concise (1-2 sentences) but specific

---

### 🚫 DO NOT INCLUDE

* Generic content or ongoing posting tasks (e.g., "Post weekly on Instagram")
* Internal or business operations unrelated to launch (e.g., "Set up accounting software")
* Overly granular scheduling ("Post at 10am on Tuesday" — include timing in description if critical)
* Tasks that are too vague ("Market the product" — be specific)
* Duplicate tasks across phases (consolidate similar actions)

Focus on the campaign lifecycle and core launch execution only.

---

### ✅ FINAL CHECKLIST

Before submitting, verify:

* JSON is valid and standalone (no markdown, no extra text)
* Task count matches requirement: ${isUltraShort ? '4-6' : daysToLaunch >= 57 ? '20-30' : daysToLaunch >= 22 ? '12-18' : '6-10'} tasks
* Tasks flow logically by phase with appropriate distribution
* Each task has a clear due date relative to launch (calculate from ${new Date().toISOString().split('T')[0]})
* Sub-tasks are used for multi-step or multi-platform actions
* Platform-specific best practices are reflected in relevant tasks
* Brand tone and audience are reflected in task descriptions
* Plan reflects realistic effort for a small team or solo founder
* ${context.region === 'United Kingdom' || context.region === 'UK' ? 'UK English spelling is used throughout' : 'Spelling matches the specified region'}

---

### 📥 CONTEXT

Launch plan request details:

**Brand Identity:**
- Company name: ${context.company_name}
- Business type: ${context.business_type}
- Brand description: ${context.brand_description}
- Target audience: ${context.audience_focus || 'General audience'}
- Tone of voice: ${Array.isArray(context.tone_of_voice) ? context.tone_of_voice.join(", ") : context.tone_of_voice || 'Professional'}
- Region: ${context.region || 'Global'}

**Launch Details:**
- Launch name: ${context.launch_name}
- Launch description: ${context.launch_description}
- Launch category: ${context.launch_category}
- Launch goal: ${context.launch_goal}
- Launch date: ${context.launch_date}
- Days until launch: ${daysToLaunch} days
- Platforms: ${displayChannels.join(', ')}

**Timeline Context:**
- Today's date: ${new Date().toISOString().split('T')[0]}
- Launch date: ${context.launch_date}
- Timeframe bucket: ${timeframeBucket}
- ${isUltraShort ? '⚠️ ULTRA-SHORT TIMELINE: Focus on essentials only' : isShortSprint ? '⚡ SHORT SPRINT: Quick setup and execution' : isMediumRunway ? '📅 MEDIUM RUNWAY: Campaign-level planning' : '🗓️ FULL RUNWAY: Detailed multi-phase campaign'}

---

Now generate the **final launch plan** based on this context.
Return only the JSON array — no explanations or markdown.

**FINAL REMINDER: Your launch is ${daysToLaunch} days away. You MUST generate ${isUltraShort ? '4-6' : daysToLaunch >= 57 ? '20-30' : daysToLaunch >= 22 ? '12-18' : '6-10'} tasks. Count your tasks before submitting.**`;
}

// Helper function to build platform-specific guidance
function buildPlatformGuidance(platforms: string[], context: LaunchContext): string {
  const guidance: string[] = [];
  
  platforms.forEach(platform => {
    switch(platform.toLowerCase()) {
      case 'instagram':
        guidance.push(`**Instagram:**
- Prioritise visual content: Reels for reach, Carousels for education, Stories for engagement
- Best posting times: ${context.region === 'United Kingdom' || context.region === 'UK' ? '9am-11am or 5pm-7pm GMT' : '9am-11am or 5pm-7pm local time'}
- Use Instagram-specific features: Reels, Stories highlights, IGTV for longer content
- Hashtag strategy: Mix of branded, niche, and trending hashtags (5-10 per post)
- Engagement: Plan for comments, DMs, and Story interactions`);
        break;
      case 'twitter':
        guidance.push(`**Twitter:**
- Thread format works well for product announcements
- Optimal posting: ${context.region === 'United Kingdom' || context.region === 'UK' ? '8am-9am or 5pm-6pm GMT' : '8am-9am or 5pm-6pm local time'}
- Use polls, quote tweets, and pinned tweets strategically
- Engage with relevant communities and hashtags
- Thread structure: Hook tweet → Key points → CTA`);
        break;
      case 'linkedin':
        guidance.push(`**LinkedIn:**
- Professional tone, but ${context.tone_of_voice ? `maintain ${Array.isArray(context.tone_of_voice) ? context.tone_of_voice[0].toLowerCase() : context.tone_of_voice.toLowerCase()}` : 'authentic'} voice
- Long-form posts (1500-3000 characters) perform well
- Include data, insights, or case studies when possible
- Engage in relevant groups and comment on industry posts
- Best times: ${context.region === 'United Kingdom' || context.region === 'UK' ? '8am-9am or 5pm-6pm GMT weekdays' : '8am-9am or 5pm-6pm local time weekdays'}`);
        break;
      case 'email':
        guidance.push(`**Email:**
- Segment your list: early supporters, general subscribers, VIPs
- Subject lines: Clear, benefit-focused, ${context.tone_of_voice ? `matching ${Array.isArray(context.tone_of_voice) ? context.tone_of_voice[0].toLowerCase() : context.tone_of_voice.toLowerCase()}` : 'professional'} tone
- Send times: ${context.region === 'United Kingdom' || context.region === 'UK' ? 'Tuesday-Thursday, 9am-11am GMT' : 'Tuesday-Thursday, 9am-11am local time'}
- Include clear CTAs and mobile-optimised design
- A/B test subject lines for launch announcement`);
        break;
      case 'youtube':
        guidance.push(`**YouTube:**
- Launch video types: Product demo, behind-the-scenes, founder story, tutorial
- Optimal length: 5-10 minutes for product launches
- Include timestamps, clear CTAs, and end screens
- Thumbnail and title are critical for click-through
- Engage with comments in first 24 hours`);
        break;
      case 'website':
        guidance.push(`**Website:**
- Ensure landing page is optimised for conversions
- Include social proof, clear value proposition, and strong CTAs
- Mobile responsiveness is critical
- Set up analytics and conversion tracking
- Consider A/B testing key elements`);
        break;
    }
  });
  
  return guidance.length > 0 ? guidance.join('\n\n') : 'Focus on platform best practices for your selected channels.';
}

// Helper function to build tone-specific guidance
function buildToneGuidance(tone: string | string[] | undefined, region: string | undefined): string {
  const toneStr = Array.isArray(tone) ? tone.join(' and ') : (tone || 'Professional');
  const isUK = region === 'United Kingdom' || region === 'UK';
  
  let guidance = `**Tone of Voice: ${toneStr}**\n\n`;
  
  if (toneStr.toLowerCase().includes('professional') || toneStr.toLowerCase().includes('formal')) {
    guidance += `- Use clear, structured language
- Focus on benefits and value propositions
- Maintain credibility and authority
- Avoid slang or casual expressions`;
  } else if (toneStr.toLowerCase().includes('casual') || toneStr.toLowerCase().includes('friendly')) {
    guidance += `- Use conversational, approachable language
- Include personal touches and relatable examples
- Connect on a human level
- Keep it light but still informative`;
  } else if (toneStr.toLowerCase().includes('energetic') || toneStr.toLowerCase().includes('excited')) {
    guidance += `- Use dynamic, action-oriented language
- Include enthusiasm and momentum-building phrases
- Create urgency and excitement
- Use exclamation points sparingly but effectively`;
  } else if (toneStr.toLowerCase().includes('humorous') || toneStr.toLowerCase().includes('witty')) {
    guidance += `- Use clever wordplay and light humour
- Don't sacrifice clarity for jokes
- Match humour to audience sensibilities
- Keep it appropriate for the platform`;
  } else {
    guidance += `- Match the specified tone throughout all task descriptions
- Ensure consistency across all platforms
- Adapt format to platform while maintaining voice`;
  }
  
  if (isUK) {
    guidance += `\n\n**CRITICAL - UK English Spelling:**
- Use British English throughout: "organise" not "organize", "colour" not "color", "centre" not "center"
- Use "realise" not "realize", "favour" not "favor", "behaviour" not "behavior"
- Use "optimise" not "optimize", "analyse" not "analyze"
- Dates: Use DD/MM/YYYY format in descriptions if mentioned`;
  }
  
  return guidance;
}

// Helper function to build audience-specific guidance
function buildAudienceGuidance(audience: string | undefined, goal: string | undefined): string {
  if (!audience && !goal) return '';
  
  let guidance = `**Target Audience & Launch Goal Alignment:**\n\n`;
  
  if (audience) {
    guidance += `- Target Audience: ${audience}\n`;
    guidance += `- Tailor content, messaging, and platform strategy to resonate with this audience\n`;
    guidance += `- Consider what motivates this audience and what language they use\n`;
  }
  
  if (goal) {
    guidance += `- Launch Goal: ${goal}\n`;
    if (goal.toLowerCase().includes('sales') || goal.toLowerCase().includes('revenue')) {
      guidance += `- Prioritise conversion-focused tasks: CTAs, landing pages, email sequences, limited-time offers\n`;
    } else if (goal.toLowerCase().includes('awareness') || goal.toLowerCase().includes('visibility')) {
      guidance += `- Prioritise reach-focused tasks: viral content, influencer partnerships, PR, social amplification\n`;
    } else if (goal.toLowerCase().includes('community') || goal.toLowerCase().includes('engagement')) {
      guidance += `- Prioritise engagement-focused tasks: community building, user-generated content, interactive content, discussions\n`;
    } else if (goal.toLowerCase().includes('waitlist') || goal.toLowerCase().includes('signup')) {
      guidance += `- Prioritise signup-focused tasks: landing pages, email capture, early access offers, referral programs\n`;
    }
  }
  
  return guidance;
}

type TaskContentRequest = {
  title: string;
  description?: string | null;
  category?: string | null;
  phase?: string | null;
  platform?: string | null;
};

export type TaskContentResult = {
  hook: string;
  primary_copy: string;
  call_to_action: string;
  suggested_visual: string;
  hashtags: string[];
};

export async function generateTaskContentForLaunch(
  context: LaunchContext,
  task: TaskContentRequest
): Promise<TaskContentResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = createTaskContentPrompt(context, task);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content generated by AI");
  }

  try {
    const trimmed = content.trim();
    const parsed = JSON.parse(trimmed) as TaskContentResult;
    return {
      hook: parsed.hook,
      primary_copy: parsed.primary_copy,
      call_to_action: parsed.call_to_action,
      suggested_visual: parsed.suggested_visual,
      hashtags: parsed.hashtags || [],
    };
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("AI returned unexpected output. Please try again.");
  }
}

function createTaskContentPrompt(context: LaunchContext, task: TaskContentRequest) {
  const tone = Array.isArray(context.tone_of_voice)
    ? context.tone_of_voice.join(", ")
    : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  return `You are ClearLaunch AI — a launch strategist that writes channel-ready content.

---

### TASK
- Title: ${task.title}
- Existing description: ${task.description || "Not provided"}
- Category: ${task.category || "General"}
- Phase: ${task.phase || "Not specified"}
- Primary platform: ${task.platform || "General"}

### BRAND CONTEXT
- Company name: ${context.company_name}
- Launch name: ${context.launch_name}
- Product description: ${context.launch_description}
- Brand description: ${context.brand_description}
- Audience focus: ${context.audience_focus || "General audience"}
- Tone of voice: ${tone}
- Region: ${region}
- Launch goal: ${context.launch_goal}

---

### OUTPUT REQUIREMENTS
Return a single JSON object with this exact shape:

{
  "hook": "",                // Arresting opener (1 sentence) - can include <strong> tags for emphasis
  "primary_copy": "",        // 2-3 sentences of body copy suited to the platform - can include <strong>, <em>, or <ul><li> for lists
  "call_to_action": "",      // Direct CTA aligned to the launch goal - can include <strong> for emphasis
  "suggested_visual": "",    // Suggestion for imagery/asset
  "hashtags": ["", ""]       // Up to 5 hashtags (UK English spelling where relevant)
}

Guidelines:
- CRITICAL: Use British English spelling throughout (e.g., "colour" not "color", "organise" not "organize", "centre" not "center", "realise" not "realize", "favour" not "favor", "behaviour" not "behavior", "optimise" not "optimize").
- Reference the brand tone and launch goal.
- Tailor language and format for the specified platform (if provided).
- Keep copy concise and motivating (max ~120 words total).
- FORMATTING: Use HTML formatting to enhance readability:
  * Use <strong> tags to bold key phrases, product names, or important words
  * Use <em> tags for subtle emphasis
  * Use <ul><li> tags for lists when you have multiple points (e.g., features, benefits)
  * Structure longer content with clear paragraphs using <p> tags
  * Example: "Our <strong>revolutionary new course</strong> includes: <ul><li>Expert-led tutorials</li><li>Real-world projects</li><li>Lifetime access</li></ul>"
- The output will be rendered as HTML, so ensure all HTML tags are properly closed and valid.
- Avoid markdown syntax (no **, *, #, etc.) - use HTML tags instead.

Return ONLY the JSON object.`;
}

// Content generation types
export type InstagramCopyResult = {
  caption: string;
  hashtags: string[];
  suggested_visual: string;
};

export type CarouselResult = {
  slides: Array<{
    slide_number: number;
    headline: string;
    body_copy: string;
    visual_description: string;
  }>;
  caption: string;
  hashtags: string[];
};

export type ReelsScriptResult = {
  hook: string;
  script: string; // Full script with timing cues
  visual_cues: string[];
  caption: string;
  hashtags: string[];
};

export type EmailCampaignResult = {
  subject_line: string;
  preheader: string;
  body: string;
  cta_text: string;
  cta_link_suggestion: string;
};

/**
 * Generate Instagram post copy
 */
export async function generateInstagramCopy(
  context: LaunchContext,
  task: TaskContentRequest
): Promise<InstagramCopyResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const tone = Array.isArray(context.tone_of_voice)
    ? context.tone_of_voice.join(", ")
    : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  const prompt = `You are ClearLaunch AI — an expert Instagram content strategist.

### TASK
- Title: ${task.title}
- Description: ${task.description || "Not provided"}
- Category: ${task.category || "General"}

### BRAND CONTEXT
- Company: ${context.company_name}
- Launch: ${context.launch_name}
- Product: ${context.launch_description}
- Brand: ${context.brand_description}
- Audience: ${context.audience_focus || "General audience"}
- Tone: ${tone}
- Region: ${region}
- Goal: ${context.launch_goal}

### OUTPUT REQUIREMENTS
Return a JSON object:
{
  "caption": "",              // Full Instagram caption (2-4 sentences, engaging, on-brand)
  "hashtags": ["", ""],       // 5-10 relevant hashtags (mix of branded, niche, trending)
  "suggested_visual": ""      // Visual suggestion for the post
}

Guidelines:
- Use British English spelling throughout
- Match the brand tone (${tone})
- Keep caption engaging and authentic (not salesy)
- Include a clear CTA if appropriate
- Hashtags should be relevant to the launch and audience
- Caption should be 100-200 words

Return ONLY the JSON object.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content generated");

  const trimmed = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(trimmed) as InstagramCopyResult;
}

/**
 * Generate Instagram carousel post (multi-slide)
 */
export async function generateCarousel(
  context: LaunchContext,
  task: TaskContentRequest,
  slideCount: number = 5
): Promise<CarouselResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const tone = Array.isArray(context.tone_of_voice)
    ? context.tone_of_voice.join(", ")
    : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  const prompt = `You are ClearLaunch AI — an expert Instagram carousel strategist.

### TASK
- Title: ${task.title}
- Description: ${task.description || "Not provided"}
- Category: ${task.category || "General"}

### BRAND CONTEXT
- Company: ${context.company_name}
- Launch: ${context.launch_name}
- Product: ${context.launch_description}
- Brand: ${context.brand_description}
- Audience: ${context.audience_focus || "General audience"}
- Tone: ${tone}
- Region: ${region}
- Goal: ${context.launch_goal}

### OUTPUT REQUIREMENTS
Generate a ${slideCount}-slide Instagram carousel. Return JSON:
{
  "slides": [
    {
      "slide_number": 1,
      "headline": "",           // Bold headline for this slide
      "body_copy": "",          // 1-2 sentences of body copy
      "visual_description": "" // What visual should go on this slide
    }
  ],
  "caption": "",                // Full Instagram caption for the carousel
  "hashtags": ["", ""]          // 5-10 relevant hashtags
}

Guidelines:
- Use British English spelling
- Slide 1 should be a strong hook/teaser
- Each slide should build on the previous one
- Final slide should have a clear CTA
- Keep body copy concise (1-2 sentences per slide)
- Caption should introduce the carousel and include CTA
- Visual descriptions should be specific and actionable

Return ONLY the JSON object.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content generated");

  const trimmed = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(trimmed) as CarouselResult;
}

/**
 * Generate Instagram Reels script
 */
export async function generateReelsScript(
  context: LaunchContext,
  task: TaskContentRequest,
  duration: number = 30
): Promise<ReelsScriptResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const tone = Array.isArray(context.tone_of_voice)
    ? context.tone_of_voice.join(", ")
    : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  const prompt = `You are ClearLaunch AI — an expert Instagram Reels strategist.

### TASK
- Title: ${task.title}
- Description: ${task.description || "Not provided"}
- Category: ${task.category || "General"}
- Duration: ${duration} seconds

### BRAND CONTEXT
- Company: ${context.company_name}
- Launch: ${context.launch_name}
- Product: ${context.launch_description}
- Brand: ${context.brand_description}
- Audience: ${context.audience_focus || "General audience"}
- Tone: ${tone}
- Region: ${region}
- Goal: ${context.launch_goal}

### OUTPUT REQUIREMENTS
Generate a ${duration}-second Reels script. Return JSON:
{
  "hook": "",                   // First 3 seconds hook (must grab attention)
  "script": "",                 // Full script with timing cues (e.g., "[0-3s] Hook text", "[3-10s] Main point")
  "visual_cues": ["", ""],      // Array of visual suggestions for key moments
  "caption": "",                // Instagram caption for the Reel
  "hashtags": ["", ""]          // 5-10 relevant hashtags
}

Guidelines:
- Use British English spelling
- Hook must be attention-grabbing (first 3 seconds critical)
- Script should be fast-paced and engaging
- Include timing cues in script (e.g., "[0-3s]", "[3-10s]")
- Visual cues should match key moments in the script
- Caption should complement the video content
- Keep script concise (${duration} seconds = ~${Math.floor(duration * 2.5)} words max)

Return ONLY the JSON object.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content generated");

  const trimmed = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(trimmed) as ReelsScriptResult;
}

/**
 * Generate email campaign content
 */
export async function generateEmailCampaign(
  context: LaunchContext,
  task: TaskContentRequest
): Promise<EmailCampaignResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const tone = Array.isArray(context.tone_of_voice)
    ? context.tone_of_voice.join(", ")
    : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  const prompt = `You are ClearLaunch AI — an expert email marketing strategist.

### TASK
- Title: ${task.title}
- Description: ${task.description || "Not provided"}
- Category: ${task.category || "General"}

### BRAND CONTEXT
- Company: ${context.company_name}
- Launch: ${context.launch_name}
- Product: ${context.launch_description}
- Brand: ${context.brand_description}
- Audience: ${context.audience_focus || "General audience"}
- Tone: ${tone}
- Region: ${region}
- Goal: ${context.launch_goal}

### OUTPUT REQUIREMENTS
Generate email campaign content. Return JSON:
{
  "subject_line": "",           // Compelling subject line (50 chars max)
  "preheader": "",              // Preheader text (100 chars max)
  "body": "",                   // Email body (can include HTML formatting: <p>, <strong>, <ul><li>)
  "cta_text": "",               // Call-to-action button text
  "cta_link_suggestion": ""    // Suggested CTA link (e.g., "/launch", "/signup")
}

Guidelines:
- Use British English spelling
- Subject line should be benefit-focused and compelling
- Preheader should complement subject line
- Body should be scannable with clear sections
- Include HTML formatting for readability (<p>, <strong>, <ul><li>)
- CTA should be clear and action-oriented
- Keep body concise (200-300 words)
- Match brand tone (${tone})

Return ONLY the JSON object.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content generated");

  const trimmed = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(trimmed) as EmailCampaignResult;
}

/**
 * Regenerate a single task with improved title, description, and details
 */
export async function regenerateSingleTask(
  context: LaunchContext,
  existingTask: RegenerateTaskRequest
): Promise<LaunchPlanTask> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const today = new Date();
  const launchDate = new Date(context.launch_date);
  const daysToLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const prompt = createRegenerateTaskPrompt(context, existingTask, daysToLaunch);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated by OpenAI");
    }

    // Parse the JSON response
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const task = JSON.parse(cleanContent) as LaunchPlanTask;
    
    // Preserve order and due_date from existing task if not regenerated
    return {
      ...task,
      order: task.order || 0,
      due_date: task.due_date || existingTask.due_date || undefined,
    };
  } catch (error) {
    console.error("Error regenerating task:", error);
    throw new Error(`Failed to regenerate task: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Regenerate all tasks in a specific category
 */
export async function regenerateCategoryTasks(
  context: LaunchContext,
  category: string,
  existingTasks: RegenerateTaskRequest[]
): Promise<LaunchPlanTask[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const today = new Date();
  const launchDate = new Date(context.launch_date);
  const daysToLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const prompt = createRegenerateCategoryPrompt(context, category, existingTasks, daysToLaunch);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated by OpenAI");
    }

    // Parse the JSON response
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    const tasks = JSON.parse(cleanContent) as LaunchPlanTask[];
    
    // Preserve order and due_date from existing tasks where possible
    return tasks.map((task, index) => {
      const existingTask = existingTasks[index];
      return {
        ...task,
        category: category, // Ensure category matches
        order: task.order || (existingTask as any)?.order || index,
        due_date: task.due_date || existingTask?.due_date || undefined,
      };
    });
  } catch (error) {
    console.error("Error regenerating category tasks:", error);
    throw new Error(`Failed to regenerate category tasks: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function createRegenerateTaskPrompt(
  context: LaunchContext,
  existingTask: RegenerateTaskRequest,
  daysToLaunch: number
): string {
  const platformMap: Record<string, string> = {
    'instagram': 'Instagram',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'youtube': 'YouTube',
    'email': 'Email',
    'website': 'Website',
  };

  const displayChannels = context.platforms.map(platform => platformMap[platform] || platform);
  const tone = Array.isArray(context.tone_of_voice) ? context.tone_of_voice.join(", ") : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  return `You are **ClearLaunch AI** — an expert product launch strategist.

You are regenerating a SINGLE task to improve its clarity, actionability, and alignment with the launch context.

---

### EXISTING TASK TO REGENERATE
- Title: ${existingTask.title}
- Description: ${existingTask.description || "Not provided"}
- Category: ${existingTask.category || "General"}
- Phase: ${existingTask.phase || "Not specified"}
- Platform: ${existingTask.platform || "General"}
- Due Date: ${existingTask.due_date || "Not set"}

---

### LAUNCH CONTEXT
- Company: ${context.company_name}
- Launch: ${context.launch_name}
- Description: ${context.launch_description}
- Brand: ${context.brand_description}
- Audience: ${context.audience_focus || "General audience"}
- Tone: ${tone}
- Region: ${region}
- Goal: ${context.launch_goal}
- Platforms: ${displayChannels.join(", ")}
- Days to launch: ${daysToLaunch}

---

### OUTPUT REQUIREMENTS
Return ONLY a valid JSON object (no markdown):

\`\`\`json
{
  "title": "",              // Improved, more specific task title
  "description": "",        // Enhanced description with clear action steps
  "category": "${existingTask.category || "General"}",  // Keep same category
  "phase": "${existingTask.phase || "Pre-launch"}",     // Keep same phase
  "platform": "${existingTask.platform || null}",       // Keep same platform or improve
  "order": 0,               // Preserve order if provided, otherwise 0
  "due_date": "${existingTask.due_date || ""}"         // Keep or improve due date
}
\`\`\`

### IMPROVEMENT GUIDELINES
1. **Title**: Make it more specific and action-oriented. Use active verbs.
2. **Description**: Expand with clear, actionable steps. Include platform-specific guidance and multiple steps if the task involves multiple steps or platforms.
3. **Due Date**: Keep existing due date or suggest a better one based on launch timeline.
4. **Platform**: Keep existing platform or suggest a more appropriate one.
5. **Alignment**: Ensure the task aligns with brand tone, audience, and launch goal.

### CRITICAL
- Use British English spelling (colour, organise, centre, realise, favour, behaviour, optimise)
- Return ONLY the JSON object, no markdown formatting
- Keep the same category and phase unless there's a clear reason to change
- Make the task more actionable and specific than the original`;
}

function createRegenerateCategoryPrompt(
  context: LaunchContext,
  category: string,
  existingTasks: RegenerateTaskRequest[],
  daysToLaunch: number
): string {
  const platformMap: Record<string, string> = {
    'instagram': 'Instagram',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'youtube': 'YouTube',
    'email': 'Email',
    'website': 'Website',
  };

  const displayChannels = context.platforms.map(platform => platformMap[platform] || platform);
  const tone = Array.isArray(context.tone_of_voice) ? context.tone_of_voice.join(", ") : context.tone_of_voice || "Professional";
  const region = context.region || "United Kingdom";

  const existingTasksJson = JSON.stringify(existingTasks, null, 2);

  return `You are **ClearLaunch AI** — an expert product launch strategist.

You are regenerating ALL tasks in the "${category}" category to improve their clarity, actionability, and alignment with the launch context.

---

### EXISTING TASKS TO REGENERATE (Category: ${category})
${existingTasksJson}

---

### LAUNCH CONTEXT
- Company: ${context.company_name}
- Launch: ${context.launch_name}
- Description: ${context.launch_description}
- Brand: ${context.brand_description}
- Audience: ${context.audience_focus || "General audience"}
- Tone: ${tone}
- Region: ${region}
- Goal: ${context.launch_goal}
- Platforms: ${displayChannels.join(", ")}
- Days to launch: ${daysToLaunch}

---

### OUTPUT REQUIREMENTS
Return ONLY a valid JSON array (no markdown):

\`\`\`json
[
  {
    "title": "",
    "description": "",
    "category": "${category}",
    "phase": "",
    "platform": "",
    "order": 0,
    "due_date": "",
]
  }
]
\`\`\`

### IMPROVEMENT GUIDELINES
1. **Regenerate ALL ${existingTasks.length} tasks** in the "${category}" category
2. **Improve titles**: Make them more specific and action-oriented
3. **Enhance descriptions**: Add clear, actionable steps and platform-specific guidance
4. **Add sub-tasks**: Include 2-5 sub-tasks for complex or multi-step tasks
5. **Preserve structure**: Keep similar phase distribution and due dates, but improve them
6. **Alignment**: Ensure all tasks align with brand tone, audience, and launch goal
7. **Coordination**: If multiple tasks exist, ensure they work together cohesively

### CRITICAL
- Use British English spelling (colour, organise, centre, realise, favour, behaviour, optimise)
- Return ONLY the JSON array, no markdown formatting
- Maintain the same category for all tasks
- Generate the SAME NUMBER of tasks (${existingTasks.length})
- Make tasks more actionable and specific than the originals`;
}
