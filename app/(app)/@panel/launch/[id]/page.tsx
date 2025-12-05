"use client";

import { useParams } from "next/navigation";
import LaunchPanel from "@/components/LaunchPanel";

export default function LaunchPanelRoute() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id || Array.isArray(id)) return null;
  return <LaunchPanel id={id} />;
}
