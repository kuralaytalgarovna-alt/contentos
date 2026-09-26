import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { downloadReportPdf, getAnalyticsOverview } from "../api/analytics";
import { DEMO_MODE } from "../demoMode";
import { useProjectStore } from "../store/projectStore";
import type { AnalyticsOverview } from "../types";

export function Analytics() {
  const projectId = useProjectStore((s) => s.currentProjectId);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    void getAnalyticsOverview(projectId).then((data) => {
      setOverview(data);
      setActiveTab("all");
    });
  }, [projectId]);

  if (!projectId) {
    return <p className="muted">Сначала создайте проект.</p>;
  }

  if (!overview) {
    return <p className="muted">Загрузка аналитики…</p>;
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadReportPdf(projectId!);
    } finally {
      setDownloading(false);
    }
  }

  const platformsToShow = activeTab === "all" ? overview.platforms : overview.platforms.filter((p) => p.platform === activeTab);

  return (
    <div>
      <div className="page-header">
        <h1>Аналитика</h1>
        <div style={{ textAlign: "right" }}>
          <button className="btn" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Формируем…" : "Сформировать отчёт клиенту"}
          </button>
          {DEMO_MODE && (
            <div className="muted" style={{ marginTop: 4, maxWidth: 260 }}>
              В демо-режиме PDF не создаётся — нужен backend (см. README)
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <strong>AI-вывод недели</strong>
        <p style={{ margin: "6px 0 0" }}>{overview.ai_summary}</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={activeTab === "all" ? "btn" : "btn secondary"}
          onClick={() => setActiveTab("all")}
        >
          Сводная
        </button>
        {overview.platforms.map((p) => (
          <button
            key={p.platform}
            className={activeTab === p.platform ? "btn" : "btn secondary"}
            onClick={() => setActiveTab(p.platform)}
          >
            {p.platform}
          </button>
        ))}
      </div>

      <div className="grid cols-2">
        {platformsToShow.map((p) => (
          <div key={p.platform} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{p.platform}</strong>
              <span className="muted">
                охват {p.reach.toLocaleString("ru-RU")} ({p.reach_delta_pct >= 0 ? "+" : ""}
                {p.reach_delta_pct}%)
              </span>
            </div>
            <div className="muted" style={{ marginBottom: 8 }}>
              ER {p.engagement_rate}% · подписчики {p.followers.toLocaleString("ru-RU")} ({p.followers_delta >= 0 ? "+" : ""}
              {p.followers_delta})
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={p.daily}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString("ru-RU")} />
                <Line type="monotone" dataKey="reach" stroke="var(--color-primary)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Топ-посты</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {overview.top_posts.map((post) => (
            <div key={post.post_id} style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                [{post.platform}] {post.title}
              </div>
              <div className="muted">
                охват {post.reach.toLocaleString("ru-RU")} · ER {post.engagement_rate}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
