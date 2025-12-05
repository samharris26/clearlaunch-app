import type { LaunchContext } from "@/lib/ai";
import type { LaunchTemplate } from "@/lib/launchTemplates";

export function buildLaunchPlanPrompt(
  context: LaunchContext,
  daysToLaunch: number,
  template?: LaunchTemplate
): string {
  let planType: "Short Sprint" | "Medium Runway" | "Full Runway";

  if (daysToLaunch <= 21) {
    planType = "Short Sprint";
  } else if (daysToLaunch <= 56) {
    planType = "Medium Runway";
  } else {
    planType = "Full Runway";
  }

  const platformList =
    context.platforms.length > 0
      ? context.platforms.map((platform) => `- ${platform}`).join("\n")
      : "- No channels supplied. Recommend the most relevant ones.";

  const beatSection = template
    ? template.beats
      .map(
        (beat) =>
          `- code: "${beat.code}"\n  label: "${beat.label}"\n  phase: "${beat.phase}"\n  default_day_offset: ${beat.defaultDayOffset}\n  recommended_platforms: [${beat.recommendedPlatforms.join(
            ", "
          )}]`
      )
      .join("\n\n")
    : "No template provided. Use common launch beats (research, teaser, warm-up, announcement, launch day, social proof, follow-up, metrics).";

  const platformHandles = context.platform_handles
    ? Object.entries(context.platform_handles)
      .map(([platform, handle]) => `- ${platform}: ${handle || "no handle provided"}`)
      .join("\n")
    : "No handles provided.";

  return `
You are ClearLaunch AI — a strategist who builds beat-based launch plans for solo operators and small teams. 
You remove guesswork and return a list of tasks sized to the launch window.

Detected runway: **${planType}** (Launch ends ${context.launch_end_date || context.launch_date} · ${daysToLaunch} days out).

----------------------------------------------------------------------
LAUNCH CONTEXT
----------------------------------------------------------------------
- Company: ${context.company_name}
- Launch name: ${context.launch_name}
- Summary: ${context.summary || context.launch_description}
- Product / launch type: ${context.launch_category} (${context.business_type})
- Goal type/value: ${context.goal_type || "n/a"} ${context.goal_value ?? ""}
- Launch goal (narrative): ${context.launch_goal}
- Brand description: ${context.brand_description}
- Audience focus: ${context.audience_focus || "General audience"}
- Tone of voice: ${Array.isArray(context.tone_of_voice) ? context.tone_of_voice.join(", ") : context.tone_of_voice || "Professional"}
- Region: ${context.region || "United Kingdom"}
- Campaign window: ${context.launch_start_date || "unspecified start"} → ${context.launch_end_date || context.launch_date}

Selected platforms and handles:
${platformList}

Handles / lists (if any):
${platformHandles}

----------------------------------------------------------------------
TEMPLATE BEATS TO HONOUR
----------------------------------------------------------------------
${template ? `Template: ${template.name} — ${template.description}` : "Use common launch beats."}

${beatSection}

----------------------------------------------------------------------
HOW TO BUILD THE PLAN
----------------------------------------------------------------------
1. Size the plan to the runway (${planType}) and ensure **pre-launch tasks outnumber post-launch**.
   - **Short Sprint**: Generate 10-15 high-impact tasks.
   - **Medium Runway**: Generate 20-25 detailed tasks.
   - **Full Runway**: Generate 30-40 comprehensive tasks.

2. **Tailor to Launch Type**:
   - **Product**: Focus on inventory, shipping, unboxing experience, product photography, and scarcity.
   - **Service**: Focus on client onboarding, discovery calls, case studies, and testimonials.
   - **Course/Digital**: Focus on curriculum completion, beta testers, webinars, and email sequences.

3. **Platform Specifics**:
   - If **Instagram**: Include Stories, Reels, and "Link in Bio" updates.
   - If **LinkedIn**: Include thought leadership, carousel posts, and personal stories.
   - If **Email**: Include specific subject line ideas or sequence beats (Welcome, Nurture, Sales).
   - If **TikTok**: Include trends, behind-the-scenes, and raw video content.

4. **STRICT UK ENGLISH**:
   - Use British spelling for ALL text (e.g., **colour**, **optimise**, **centre**, **behaviour**, **programme**, **licence**, **analyse**).
   - Do NOT use American spelling (color, optimize, center, etc.).

5. Cover every beat at least once. If template is provided, only use its \`beat_code\` values.
6. For each task include WHAT, WHY, HOW, and the platform-specific execution notes.
7. Reference the company, product, or audience inside descriptions.

----------------------------------------------------------------------
OUTPUT FORMAT (MANDATORY)
----------------------------------------------------------------------
Return ONLY the following JSON structure (no markdown, no commentary):

{
  "tasks": [
    {
      "title": "short action verb title",
      "description": "Detailed paragraph covering what, why, how, and platform cues.",
      "category": "Marketing | Content | Operations | Analytics | Partnerships | Research",
      "beat_code": "use one of the template beat codes",
      "platform": "one primary platform from the selected list",
      "day_offset": -14,
      "outline": "Bullet-level execution checklist for this task"
    }
  ]
}

Rules:
- **title**: max 8 words, action-oriented.
- **description**: 2–3 sentences, specific to ${context.launch_name}, mention platform + CTA/outcome.
- **category**: choose the most relevant functional bucket.
- **beat_code**: must match a code from the beat list above.
- **platform**: only use channels that were supplied (or template recommended if none supplied).
- **day_offset**: integer relative to launch_start_date (0 = first day of runway). Negative numbers mean before start, positive numbers mean after start.
- **outline**: 3–5 short bullet items separated by ";" describing the execution steps (no markdown symbols).

----------------------------------------------------------------------
VALIDATION BEFORE RETURNING
----------------------------------------------------------------------
1. Total tasks meet minimum count:
   - Short Sprint ≥ 10
   - Medium ≥ 20
   - Full ≥ 30
2. At least 60% of tasks have \`day_offset\` less than halfway to launch_end_date (pre-launch dominance).
3. Every beat_code from the template appears at least once (create multiple tasks for critical beats when useful).
4. Tasks are sorted by \`day_offset\` ascending.
5. Platforms rotate intelligently (no single platform gets all tasks unless only one selected).
6. Outline text never uses markdown symbols (#, *, -). Use plain text with "; " separators.

----------------------------------------------------------------------
FINAL INSTRUCTION
----------------------------------------------------------------------
Return only the JSON object. No markdown, no commentary, no additional prose.
`;
}
