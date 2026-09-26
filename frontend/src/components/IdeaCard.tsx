import type { Idea } from "../types";

interface IdeaCardProps {
  idea: Idea;
  onDevelop: (idea: Idea) => void;
  onDelete: (idea: Idea) => void;
}

export function IdeaCard({ idea, onDevelop, onDelete }: IdeaCardProps) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <strong>{idea.title}</strong>
      <p className="muted" style={{ margin: 0 }}>
        {idea.rationale}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        <span className="badge" style={{ background: "var(--color-bg)" }}>
          {idea.suggested_format}
        </span>
        <span className="badge" style={{ background: "var(--color-bg)" }}>
          {idea.suggested_platform}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btn" onClick={() => onDevelop(idea)}>
          Развить в пост
        </button>
        <button className="btn secondary" onClick={() => onDelete(idea)}>
          Удалить
        </button>
      </div>
    </div>
  );
}
