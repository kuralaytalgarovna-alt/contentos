/**
 * In-memory mock backend for the GitHub Pages demo build (no server).
 * Mirrors the shape/behavior of the real api/*.ts functions closely enough
 * that pages don't need to know which one they're talking to. State lives
 * only in memory and resets on reload — that's expected for a demo.
 */
import type {
  AnalyticsOverview,
  BrandKit,
  DailyPoint,
  Idea,
  MediaAsset,
  Platform,
  PlatformSummary,
  Post,
  PostFormat,
  PostStatus,
  Project,
  TopPost,
  User,
} from "../types";

function id(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEMO_USER: User = { id: "demo-user", email: "demo@contentos.dev", full_name: "Демо-пользователь" };

let projects: Project[] = [];
let postsByProject: Record<string, Post[]> = {};
let ideasByProject: Record<string, Idea[]> = {};
let mediaByProject: Record<string, MediaAsset[]> = {};
let brandKitByProject: Record<string, BrandKit> = {};

// ---------- auth ----------

export async function register(_email: string, _password: string, fullName: string): Promise<{ access_token: string }> {
  if (fullName) DEMO_USER.full_name = fullName;
  return { access_token: "demo-token" };
}

export async function login(_email: string, _password: string): Promise<{ access_token: string }> {
  return { access_token: "demo-token" };
}

export async function fetchMe(): Promise<User> {
  return DEMO_USER;
}

// ---------- projects ----------

export async function listProjects(): Promise<Project[]> {
  return projects;
}

export async function createProject(payload: {
  name: string;
  niche?: string;
  target_audience?: string;
  tone_of_voice?: string;
}): Promise<Project> {
  const project: Project = {
    id: id(),
    name: payload.name,
    niche: payload.niche ?? "",
    target_audience: payload.target_audience ?? "",
    tone_of_voice: payload.tone_of_voice ?? "",
    role: "owner",
  };
  projects = [...projects, project];
  postsByProject[project.id] = [];
  ideasByProject[project.id] = [];
  mediaByProject[project.id] = [];
  brandKitByProject[project.id] = {
    id: id(),
    project_id: project.id,
    logo_media_id: null,
    color_primary: "#6366F1",
    color_secondary: "#0EA5E9",
    color_accent: "#F59E0B",
    font_heading: "Inter",
    font_body: "Inter",
  };
  return project;
}

export async function updateProject(
  projectId: string,
  payload: Partial<Pick<Project, "name" | "niche" | "target_audience" | "tone_of_voice">>,
): Promise<Project> {
  projects = projects.map((p) => (p.id === projectId ? { ...p, ...payload } : p));
  return projects.find((p) => p.id === projectId)!;
}

// ---------- posts ----------

export async function listPosts(projectId: string): Promise<Post[]> {
  return postsByProject[projectId] ?? [];
}

export async function createPost(
  projectId: string,
  payload: {
    title?: string;
    body?: string;
    cta?: string;
    hashtags?: string;
    platform: Platform;
    format?: PostFormat;
    status?: PostStatus;
    scheduled_at?: string | null;
    cover_media_id?: string | null;
  },
): Promise<Post> {
  const post: Post = {
    id: id(),
    project_id: projectId,
    title: payload.title ?? "",
    body: payload.body ?? "",
    cta: payload.cta ?? "",
    hashtags: payload.hashtags ?? "",
    platform: payload.platform,
    format: payload.format ?? "post",
    status: payload.status ?? "draft",
    scheduled_at: payload.scheduled_at ?? null,
    cover_media_id: payload.cover_media_id ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  postsByProject[projectId] = [...(postsByProject[projectId] ?? []), post];
  return post;
}

export async function updatePost(projectId: string, postId: string, payload: Partial<Post>): Promise<Post> {
  const list = postsByProject[projectId] ?? [];
  postsByProject[projectId] = list.map((p) => (p.id === postId ? { ...p, ...payload, updated_at: nowIso() } : p));
  return postsByProject[projectId].find((p) => p.id === postId)!;
}

export async function deletePost(projectId: string, postId: string): Promise<void> {
  postsByProject[projectId] = (postsByProject[projectId] ?? []).filter((p) => p.id !== postId);
}

// ---------- ideas ----------

const IDEA_HOOKS = [
  "5 фактов о {niche}, которые вы не знали",
  "Как {niche} меняется прямо сейчас",
  "Разбираем главный вопрос недели про {niche}",
  "Топ-3 ошибки, которые совершают в {niche}",
  "История одного зрителя: {niche}",
  "Что не так с последними новостями о {niche}?",
  "Гид для новичков: {niche} за 60 секунд",
  "Сравнение: раньше vs сейчас в {niche}",
  "Мнение редакции про {niche}",
  "Закулисье: как мы делаем контент про {niche}",
];

const RATIONALES: Record<string, string> = {
  reach: "Формат с высоким потенциалом органического охвата — цепляющий заголовок работает на удержание в первые секунды.",
  engagement: "Провоцирует комментарии и репосты за счёт вопроса/спорного утверждения в начале.",
  sales: "Подводит к продукту через понятную пользу, не выглядит как реклама в лоб.",
};

const FORMATS_BY_GOAL: Record<string, string[]> = {
  reach: ["reels", "carousel"],
  engagement: ["carousel", "post"],
  sales: ["post", "story"],
};

export async function listIdeas(projectId: string): Promise<Idea[]> {
  return ideasByProject[projectId] ?? [];
}

export async function generateIdeas(
  projectId: string,
  payload: { goal: string; platform?: string; count?: number },
): Promise<Idea[]> {
  const project = projects.find((p) => p.id === projectId);
  const niche = project?.niche || "вашей ниши";
  const rationale = RATIONALES[payload.goal] ?? RATIONALES.engagement;
  const formats = FORMATS_BY_GOAL[payload.goal] ?? ["post"];
  const count = payload.count ?? 10;

  const generated: Idea[] = Array.from({ length: count }, (_, i) => {
    const hook = IDEA_HOOKS[Math.floor(Math.random() * IDEA_HOOKS.length)];
    return {
      id: id(),
      project_id: projectId,
      title: hook.replace("{niche}", niche),
      rationale,
      suggested_format: formats[i % formats.length],
      suggested_platform: payload.platform || "instagram",
      created_at: nowIso(),
    };
  });

  ideasByProject[projectId] = [...generated, ...(ideasByProject[projectId] ?? [])];
  return generated;
}

export async function generatePostText(
  projectId: string,
  payload: { idea_id?: string; topic?: string; platform: string; format: string },
): Promise<{ title: string; body: string; cta_options: string[]; hashtags: string }> {
  const project = projects.find((p) => p.id === projectId);
  const niche = project?.niche || "вашей теме";
  let topic = payload.topic;
  if (payload.idea_id) {
    const idea = (ideasByProject[projectId] ?? []).find((i) => i.id === payload.idea_id);
    if (idea) topic = idea.title;
  }

  return {
    title: topic || `Пост про ${niche}`,
    body: `${topic || "Сегодня разбираем важную тему"} — вот что стоит знать. Это черновик, отредактируйте под свой стиль перед публикацией.`,
    cta_options: ["Сохрани, чтобы не потерять", "Напиши в комментариях своё мнение", "Поделись с другом, которому актуально"],
    hashtags: `#${niche.replace(/\s+/g, "")} #smm #контент`,
  };
}

export async function deleteIdea(projectId: string, ideaId: string): Promise<void> {
  ideasByProject[projectId] = (ideasByProject[projectId] ?? []).filter((i) => i.id !== ideaId);
}

// ---------- media ----------

export async function listMedia(projectId: string): Promise<MediaAsset[]> {
  return mediaByProject[projectId] ?? [];
}

export async function uploadMedia(projectId: string, file: File): Promise<MediaAsset> {
  const asset: MediaAsset = {
    id: id(),
    project_id: projectId,
    filename: file.name,
    content_type: file.type,
    url: URL.createObjectURL(file),
    tags: "",
    created_at: nowIso(),
  };
  mediaByProject[projectId] = [asset, ...(mediaByProject[projectId] ?? [])];
  return asset;
}

export async function updateMediaTags(projectId: string, mediaId: string, tags: string): Promise<MediaAsset> {
  mediaByProject[projectId] = (mediaByProject[projectId] ?? []).map((a) => (a.id === mediaId ? { ...a, tags } : a));
  return mediaByProject[projectId].find((a) => a.id === mediaId)!;
}

export async function deleteMedia(projectId: string, mediaId: string): Promise<void> {
  mediaByProject[projectId] = (mediaByProject[projectId] ?? []).filter((a) => a.id !== mediaId);
}

// ---------- brand kit ----------

export async function getBrandKit(projectId: string): Promise<BrandKit> {
  return brandKitByProject[projectId];
}

export async function updateBrandKit(projectId: string, payload: Partial<BrandKit>): Promise<BrandKit> {
  brandKitByProject[projectId] = { ...brandKitByProject[projectId], ...payload };
  return brandKitByProject[projectId];
}

// ---------- analytics ----------

const PLATFORMS: Platform[] = ["instagram", "tiktok", "facebook", "telegram", "threads"];

function dailySeries(base: number, days = 30): DailyPoint[] {
  const today = new Date();
  const points: DailyPoint[] = [];
  let followers = base * 20;
  for (let i = days; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const reach = Math.max(0, Math.round(base + (Math.random() - 0.5) * base * 0.5));
    const er = Math.round(Math.max(0.5, 4.5 + (Math.random() - 0.5) * 2.4) * 100) / 100;
    followers += Math.floor(Math.random() * 18) - 3;
    points.push({ date: date.toISOString().slice(0, 10), reach, engagement_rate: er, followers });
  }
  return points;
}

export async function getAnalyticsOverview(_projectId: string): Promise<AnalyticsOverview> {
  const summaries: PlatformSummary[] = [];
  const topPosts: TopPost[] = [];

  for (const platform of PLATFORMS) {
    const base = 800 + Math.floor(Math.random() * 14000);
    const daily = dailySeries(base);
    const lastWeek = daily.slice(-7);
    const prevWeek = daily.slice(-14, -7);
    const reachNow = lastWeek.reduce((s, p) => s + p.reach, 0);
    const reachPrev = prevWeek.reduce((s, p) => s + p.reach, 0) || 1;
    const erNow = Math.round((lastWeek.reduce((s, p) => s + p.engagement_rate, 0) / lastWeek.length) * 100) / 100;
    const erPrev = prevWeek.reduce((s, p) => s + p.engagement_rate, 0) / prevWeek.length || 1;

    summaries.push({
      platform,
      reach: reachNow,
      reach_delta_pct: Math.round(((reachNow - reachPrev) / reachPrev) * 1000) / 10,
      engagement_rate: erNow,
      engagement_rate_delta_pct: Math.round(((erNow - erPrev) / erPrev) * 1000) / 10,
      followers: daily[daily.length - 1].followers,
      followers_delta: daily[daily.length - 1].followers - daily[daily.length - 8].followers,
      daily,
    });

    for (let i = 0; i < 2; i++) {
      const titles = ["Разбор главной новости недели", "Закулисье съёмок", "Топ-5 моментов эфира", "Опрос: ваше мнение"];
      topPosts.push({
        post_id: `demo-${platform}-${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        platform,
        reach: Math.round((0.6 + Math.random() * 0.8) * base),
        engagement_rate: Math.round((3 + Math.random() * 6) * 100) / 100,
      });
    }
  }

  topPosts.sort((a, b) => b.reach - a.reach);
  const best = summaries.reduce((a, b) => (b.reach_delta_pct > a.reach_delta_pct ? b : a));
  const avgEr = Math.round((summaries.reduce((s, p) => s + p.engagement_rate, 0) / summaries.length) * 100) / 100;

  return {
    platforms: summaries,
    top_posts: topPosts.slice(0, 5),
    ai_summary: `За последнюю неделю лучший рост показал ${best.platform} (${best.reach_delta_pct >= 0 ? "+" : ""}${best.reach_delta_pct}% к охвату). Средний ER по площадкам — ${avgEr}%. Рекомендация: повторить формат топ-поста недели на других платформах.`,
  };
}

export async function downloadReportPdf(_projectId: string): Promise<void> {
  // No-op: PDF generation needs a real backend (see the inline note this
  // page shows in demo mode instead of a blocking alert()).
}
