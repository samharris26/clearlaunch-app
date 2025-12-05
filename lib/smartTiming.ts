import type { Platform } from "@/lib/platforms";

/**
 * Smart timing suggestions for different platforms
 * Returns recommended posting times based on platform best practices
 */
export function getRecommendedPostTime(platform: Platform | string | null): string {
  if (!platform) {
    return "09:00"; // Default to morning
  }

  const platformLower = platform.toLowerCase();

  // Hard-coded defaults based on platform best practices
  switch (platformLower) {
    case "x":
    case "twitter":
      return "11:15"; // Mid-morning for X/Twitter
    case "linkedin":
      return "11:15"; // Mid-morning for LinkedIn
    case "instagram":
      return "19:00"; // Evening for Instagram
    case "email":
      return "09:00"; // Morning for email
    case "tiktok":
      return "19:00"; // Evening for TikTok
    case "youtube":
      return "14:00"; // Afternoon for YouTube
    default:
      return "11:00"; // Default fallback
  }
}

/**
 * Format a time string (HH:MM) for display
 */
export function formatPostTime(time: string | null | undefined): string {
  if (!time) {
    return "TBD";
  }

  // If already in HH:MM format, return as-is
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // Try to parse and format
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const min = parseInt(minutes || "0", 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${period}`;
  } catch {
    return time;
  }
}

/**
 * Get a human-readable time range suggestion
 */
export function getTimeWindow(platform: Platform | string | null): string {
  const time = getRecommendedPostTime(platform);
  const platformLower = platform?.toLowerCase() || "";

  // Add a 15-minute window for context
  const [hours, minutes] = time.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + 15;

  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  return `${formatTime(hours, minutes)}–${formatTime(endHours, endMins)}`;
}



