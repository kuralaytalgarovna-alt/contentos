import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/projects";
import { generateIdeas } from "../api/ideas";
import { useProjectStore } from "../store/projectStore";
import type { Idea, Project } from "../types";

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "telegram", label: "Telegram" },
  { key: "threads", label: "Threads" },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const projects = useProjectStore((s) => s.projects);
  const setProjects = useProjectStore((s) => s.setProjects);
  const setCurrentProjectId = useProjectStore((s) => s.setCurrentProjectId);
  const navigate = useNavigate();

  function togglePlatform(key: string) {
    setConnectedPlatforms((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  }

  async function handleCreateProject() {
    setSubmitting(true);
    try {
      const created = await createProject({
        name: name || "Мой проект",
        niche,
        target_audience: audience,
        tone_of_voice: tone,
      });
      setProject(created);
      setProjects([...projects, created]);
      setCurrentProjectId(created.id);

      const generated = await generateIdeas(created.id, { goal: "engagement", count: 5 });
      setIdeas(generated);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Настройка проекта</h1>
        <div className="muted">Шаг {step} из 3</div>
      </div>

      {step === 1 && (
        <div className="card" style={{ maxWidth: 520 }}>
          <p>Выберите соцсети, которые вы ведёте. Реальное подключение через API можно настроить позже в профиле.</p>
          <div className="grid cols-2">
            {PLATFORMS.map((p) => (
              <label
                key={p.key}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  borderColor: connectedPlatforms.includes(p.key) ? "var(--color-primary)" : undefined,
                }}
              >
                <input
                  type="checkbox"
                  checked={connectedPlatforms.includes(p.key)}
                  onChange={() => togglePlatform(p.key)}
                />
                {p.label}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(2)}>
              Далее
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="form-row">
            <label>Название проекта</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Новостной канал" />
          </div>
          <div className="form-row">
            <label>Ниша</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="новости и развлечения" />
          </div>
          <div className="form-row">
            <label>Целевая аудитория</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="18-35, СНГ" />
          </div>
          <div className="form-row">
            <label>Tone of voice (примеры текстов бренда)</label>
            <textarea rows={4} value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn secondary" onClick={() => setStep(1)}>
              Назад
            </button>
            <button className="btn" onClick={handleCreateProject} disabled={submitting || !name}>
              {submitting ? "Создаём…" : "Создать и сгенерировать идеи"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && project && (
        <div>
          <p className="muted">Готово! Вот первые идеи для «{project.name}»:</p>
          <div className="grid cols-2">
            {ideas.map((idea) => (
              <div key={idea.id} className="card">
                <strong>{idea.title}</strong>
                <p className="muted">{idea.rationale}</p>
                <span className="badge" style={{ background: "var(--color-bg)" }}>
                  {idea.suggested_format}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => navigate("/dashboard")}>
              Перейти в дашборд
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
