export const SUPPORTED_PLATFORMS = [
  { id: "x", label: "X / Twitter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "email", label: "Email" },
  { id: "youtube", label: "YouTube" },
  { id: "other", label: "Other" },
] as const;

export type Platform = (typeof SUPPORTED_PLATFORMS)[number]["id"];

export function isPlatform(value: string | null | undefined): value is Platform {
  if (!value) return false;
  return SUPPORTED_PLATFORMS.some((platform) => platform.id === value);
}


