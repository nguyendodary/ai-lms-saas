export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  plan: "free" | "pro";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  sessions_this_month: number;
  session_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Companion {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  companion_id: string;
  transcript: TranscriptMessage[];
  started_at: string;
  ended_at: string | null;
  duration: number;
  feedback: string | null;
  created_at: string;
}

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CompanionFormData {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
}

export interface AnalyticsData {
  totalSessions: number;
  totalMinutes: number;
  averageDuration: number;
  sessionsThisMonth: number;
  sessionLimit: number;
  plan: "free" | "pro";
  sessionsByDay: { date: string; count: number }[];
  sessionsBySubject: { subject: string; count: number }[];
}
