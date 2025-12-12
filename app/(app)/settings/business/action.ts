"use server";

import { revalidatePath } from "next/cache";
import { upsertBusinessProfile } from "@/lib/business-profile";
import type { BusinessProfileInput } from "@/lib/business-profile";

export async function updateBusinessProfile(data: BusinessProfileInput) {
  const result = await upsertBusinessProfile(data);

  if (result.success) {
    revalidatePath("/settings/business");
    revalidatePath("/dashboard");
  }

  return result;
}
