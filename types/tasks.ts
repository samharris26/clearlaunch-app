export interface TaskRecord {
  id: string;
  launchId: string;
  title: string;
  description: string | null;
  category: string | null;
  phase: string | null;
  status: string;
  order: number | null;
  platform: string | null;
  ai_generated: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  due_date: string | null;
  notes?: string | null;
  beat_code?: string | null;
  owner_name?: string | null;
  review_status?: string;
  outline?: string | null;
  post_time?: string | null;
}
