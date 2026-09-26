import { useEffect, useState } from "react";
import { deleteIdea, generateIdeas, generatePostText, listIdeas } from "../api/ideas";
import { createPost } from "../api/posts";
import { IdeaCard } from "../components/IdeaCard";
import { PostEditorModal, PostDraft } from "../components/PostEditorModal";
import { useProjectStore } from "../store/projectStore";
import type { Idea, Platform } from "../types";

const PLATFORM_OPTIONS: Platform[] = ["instagram", "tiktok", "facebook", "telegram", "threads"];
const GOAL_OPTIONS = [
  { key: "engagement", label: "Вовлечённость" },
  { key: "reach", label: "Охват" },
  { key: "sales", label: "Продажи" },
] as const;

export function Ideas() {
  const projectId = useProjectStore((s) => s.currentProjectId);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goal, setGoal] = useState<(typeof GOAL_OPTIONS)[number]["key"]>("engagement");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [generating, setGenerating] = useState(false);
  const [draftForModal, setDraftForModal] = useState<Partial<PostDraft> | null>(null);

  useEffect(() => {
    if (!projectId) return;
    void listIdeas(projectId).then(setIdeas);
  }, [projectId]);

  if (!projectId) {
    return <p className="muted">Сначала создайте проект.</p>;
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const generated = await generateIdeas(projectId!, {
        goal,
        platform: platform || undefined,
        count: 10,
      });
      setIdeas((prev) => [...generated, ...prev]);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDevelop(idea: Idea) {
    const text = await generatePostText(projectId!, {
      idea_id: idea.id,
      platform: idea.suggested_platform,
      format: idea.suggested_format,
    });
    setDraftForModal({
      title: text.title,
      body: text.body,
      cta: text.cta_options[0] ?? "",
      hashtags: text.hashtags,
      platform: (idea.suggested_platform as Platform) || "instagram",
      format: (idea.suggested_format as PostDraft["format"]) || "post",
    });
  }

  async function handleDeleteIdea(idea: Idea) {
    await deleteIdea(projectId!, idea.id);
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
  }

  async function handleSavePost(draft: PostDraft) {
    await createPost(projectId!, {
      ...draft,
      scheduled_at: draft.scheduled_at ? new Date(draft.scheduled_at).toISOString() : null,
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Идеи (AI)</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={goal} onChange={(e) => setGoal(e.target.value as typeof goal)}>
            {GOAL_OPTIONS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "")}>
            <option value="">Любая платформа</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button className="btn" onClick={handleGenerate} disabled={generating}>
            {generating ? "Генерируем…" : "Сгенерировать идеи"}
          </button>
        </div>
      </div>

      {ideas.length === 0 ? (
        <p className="muted">Пока нет идей — сгенерируйте первую подборку.</p>
      ) : (
        <div className="grid cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onDevelop={handleDevelop} onDelete={handleDeleteIdea} />
          ))}
        </div>
      )}

      {draftForModal && (
        <PostEditorModal
          initial={draftForModal}
          onClose={() => setDraftForModal(null)}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
}
