import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPosts } from "../api/posts";
import { getAnalyticsOverview } from "../api/analytics";
import { generateIdeas } from "../api/ideas";
import { StatusBadge } from "../components/StatusBadge";
import { useProjectStore } from "../store/projectStore";
import type { AnalyticsOverview, Idea, Post } from "../types";

export function Dashboard() {
  const project = useProjectStore((s) => s.currentProject());
  const projectId = useProjectStore((s) => s.currentProjectId);
  const [posts, setPosts] = useState<Post[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [suggestions, setSuggestions] = useState<Idea[]>([]);

  useEffect(() => {
    if (!projectId) return;
    void listPosts(projectId).then(setPosts);
    void getAnalyticsOverview(projectId).then(setOverview);
    void generateIdeas(projectId, { goal: "engagement", count: 3 }).then(setSuggestions);
  }, [projectId]);

  if (!projectId) {
    return <p className="muted">Сначала создайте проект.</p>;
  }

  const upcoming = posts
    .filter((p) => p.scheduled_at && new Date(p.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5);

  const totalReach = overview?.platforms.reduce((sum, p) => sum + p.reach, 0) ?? 0;
  const avgEr = overview
    ? Math.round((overview.platforms.reduce((sum, p) => sum + p.engagement_rate, 0) / overview.platforms.length) * 100) / 100
    : 0;
  const totalFollowers = overview?.platforms.reduce((sum, p) => sum + p.followers, 0) ?? 0;

  return (
    <div>
      <div className="page-header">
        <h1>Дашборд{project ? ` — ${project.name}` : ""}</h1>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="muted">Охват (7 дней)</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalReach.toLocaleString("ru-RU")}</div>
        </div>
        <div className="card">
          <div className="muted">Средний ER</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{avgEr}%</div>
        </div>
        <div className="card">
          <div className="muted">Подписчики</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalFollowers.toLocaleString("ru-RU")}</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ближайшие публикации</h3>
          {upcoming.length === 0 ? (
            <p className="muted">Нет запланированных постов.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map((post) => (
                <div key={post.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div>{post.title || post.platform}</div>
                    <div className="muted">{new Date(post.scheduled_at!).toLocaleString("ru-RU")}</div>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              ))}
            </div>
          )}
          <Link to="/calendar" className="btn secondary" style={{ display: "inline-block", marginTop: 12 }}>
            Открыть контент-план
          </Link>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>AI предлагает</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {suggestions.map((idea) => (
              <div key={idea.id}>
                <strong>{idea.title}</strong>
                <p className="muted" style={{ margin: "4px 0 0" }}>
                  {idea.rationale}
                </p>
              </div>
            ))}
          </div>
          <Link to="/ideas" className="btn secondary" style={{ display: "inline-block", marginTop: 12 }}>
            Все идеи
          </Link>
        </div>
      </div>
    </div>
  );
}
