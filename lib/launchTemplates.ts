import type { Platform } from "@/lib/platforms";

export type LaunchPhase = "Research & Setup" | "Pre-launch" | "Launch Day" | "Post-launch";

export type LaunchBeat = {
  code: string;
  label: string;
  description: string;
  defaultDayOffset: number;
  recommendedPlatforms: Platform[];
  phase: LaunchPhase;
};

export type LaunchTemplate = {
  id: string;
  name: string;
  description: string;
  beats: LaunchBeat[];
};

const BASE_TEMPLATES: LaunchTemplate[] = [
  {
    id: "saas-feature-release",
    name: "SaaS feature release",
    description: "Ship a focused feature or product update with teasers, walkthroughs, and follow-up enablement.",
    beats: [
      {
        code: "research_setup",
        label: "Research & setup",
        description: "Validate messaging, update docs, and brief internal teams.",
        defaultDayOffset: -28,
        recommendedPlatforms: ["email", "linkedin", "x"],
        phase: "Research & Setup",
      },
      {
        code: "teaser",
        label: "Teaser sequence",
        description: "Share the problem you are solving and hint that something better is coming.",
        defaultDayOffset: -21,
        recommendedPlatforms: ["linkedin", "x"],
        phase: "Pre-launch",
      },
      {
        code: "education",
        label: "Warm-up education",
        description: "Show use-cases, beta snippets, or behind-the-scenes demos.",
        defaultDayOffset: -14,
        recommendedPlatforms: ["linkedin", "youtube", "email"],
        phase: "Pre-launch",
      },
      {
        code: "announcement",
        label: "Launch announcement",
        description: "Officially unveil the feature with crisp positioning and walkthrough.",
        defaultDayOffset: 0,
        recommendedPlatforms: ["email", "linkedin", "youtube"],
        phase: "Launch Day",
      },
      {
        code: "social-proof",
        label: "Social proof",
        description: "Share beta results, quotes, and fast follow testimonials.",
        defaultDayOffset: 3,
        recommendedPlatforms: ["linkedin", "x", "email"],
        phase: "Post-launch",
      },
      {
        code: "iteration",
        label: "Review & iteration",
        description: "Collect metrics, feedback, and plan the next enablement drop.",
        defaultDayOffset: 7,
        recommendedPlatforms: ["email"],
        phase: "Post-launch",
      },
    ],
  },
  {
    id: "ecommerce-product-drop",
    name: "Ecommerce product drop",
    description: "Build hype for a limited-run or seasonal product drop with a strong countdown and launch push.",
    beats: [
      {
        code: "foundations",
        label: "Brand foundations",
        description: "Lock product story, photography, landing page, and offer.",
        defaultDayOffset: -35,
        recommendedPlatforms: ["instagram", "email", "tiktok"],
        phase: "Research & Setup",
      },
      {
        code: "teaser-sequence",
        label: "Teaser sequence",
        description: "Run visual teasers, close-up shots, and ingredient reveals.",
        defaultDayOffset: -21,
        recommendedPlatforms: ["instagram", "tiktok"],
        phase: "Pre-launch",
      },
      {
        code: "countdown",
        label: "Countdown & hype",
        description: "Run a 5-day countdown with benefits, prices, and waitlist CTA.",
        defaultDayOffset: -5,
        recommendedPlatforms: ["instagram", "email", "tiktok"],
        phase: "Pre-launch",
      },
      {
        code: "drop-day",
        label: "Drop day announcement",
        description: "Go live with a clear CTA, urgency, and real-time story coverage.",
        defaultDayOffset: 0,
        recommendedPlatforms: ["email", "instagram", "tiktok"],
        phase: "Launch Day",
      },
      {
        code: "social-proof",
        label: "Customer reactions",
        description: "Share UGC, reviews, and live restock updates.",
        defaultDayOffset: 2,
        recommendedPlatforms: ["instagram", "email"],
        phase: "Post-launch",
      },
      {
        code: "retention",
        label: "Retention loop",
        description: "Invite re-orders, tease the next drop, and survey buyers.",
        defaultDayOffset: 7,
        recommendedPlatforms: ["email", "instagram"],
        phase: "Post-launch",
      },
    ],
  },
  {
    id: "course-cohort-launch",
    name: "Course / cohort launch",
    description: "Warm up a waitlist, run value-heavy previews, and convert during an enrollment window.",
    beats: [
      {
        code: "research",
        label: "Research & setup",
        description: "Define promise, modules, delivery cadence, and enrollment cap.",
        defaultDayOffset: -42,
        recommendedPlatforms: ["email", "linkedin"],
        phase: "Research & Setup",
      },
      {
        code: "warm-up",
        label: "Warm-up education",
        description: "Ship value posts, office hours, or mini-trainings.",
        defaultDayOffset: -28,
        recommendedPlatforms: ["linkedin", "email", "youtube"],
        phase: "Pre-launch",
      },
      {
        code: "waitlist",
        label: "Waitlist drive",
        description: "Collect intent via form, DMs, or calendar waitlist.",
        defaultDayOffset: -21,
        recommendedPlatforms: ["email", "linkedin", "instagram"],
        phase: "Pre-launch",
      },
      {
        code: "launch-window",
        label: "Launch window",
        description: "Open enrollment with a bold CTA, FAQs, and visuals.",
        defaultDayOffset: 0,
        recommendedPlatforms: ["email", "linkedin", "instagram"],
        phase: "Launch Day",
      },
      {
        code: "testimonials",
        label: "Social proof",
        description: "Highlight past students, case studies, or curriculum walkthroughs.",
        defaultDayOffset: 3,
        recommendedPlatforms: ["linkedin", "email"],
        phase: "Post-launch",
      },
      {
        code: "follow-up",
        label: "Post-launch follow-up",
        description: "Share \"doors closed\" recap, replay links, and future cohort interest form.",
        defaultDayOffset: 7,
        recommendedPlatforms: ["email"],
        phase: "Post-launch",
      },
    ],
  },
];

export const LAUNCH_TEMPLATES: LaunchTemplate[] = BASE_TEMPLATES;

export function getLaunchTemplateById(id: string): LaunchTemplate | undefined {
  return LAUNCH_TEMPLATES.find((template) => template.id === id);
}


