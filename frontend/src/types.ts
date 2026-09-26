export type ProjectRole = "owner" | "editor" | "client_viewer";

export interface Project {
  id: string;
  name: string;
  niche: string;
  target_audience: string;
  tone_of_voice: string;
  role: ProjectRole;
}

export type Platform = "instagram" | "tiktok" | "facebook" | "telegram" | "threads";
export type PostFormat = "post" | "reels" | "story" | "carousel";
export type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published";

export interface Post {
  id: string;
  project_id: string;
  title: string;
  body: string;
  cta: string;
  hashtags: string;
  platform: Platform;
  format: PostFormat;
  status: PostStatus;
  scheduled_at: string | null;
  cover_media_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  project_id: string;
  title: string;
  rationale: string;
  suggested_format: string;
  suggested_platform: string;
  created_at: string;
}

export interface BrandKit {
  id: string;
  project_id: string;
  logo_media_id: string | null;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  font_heading: string;
  font_body: string;
}

export interface MediaAsset {
  id: string;
  project_id: string;
  filename: string;
  content_type: string;
  url: string;
  tags: string;
  created_at: string;
}

export interface DailyPoint {
  date: string;
  reach: number;
  engagement_rate: number;
  followers: number;
}

export interface PlatformSummary {
  platform: string;
  reach: number;
  reach_delta_pct: number;
  engagement_rate: number;
  engagement_rate_delta_pct: number;
  followers: number;
  followers_delta: number;
  daily: DailyPoint[];
}

export interface TopPost {
  post_id: string;
  title: string;
  platform: string;
  reach: number;
  engagement_rate: number;
}

export interface AnalyticsOverview {
  platforms: PlatformSummary[];
  top_posts: TopPost[];
  ai_summary: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}
