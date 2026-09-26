import { useEffect, useState } from "react";
import type { Platform, PostFormat, PostStatus } from "../types";

const PLATFORM_OPTIONS: Platform[] = ["instagram", "tiktok", "facebook", "telegram", "threads"];
const FORMAT_OPTIONS: PostFormat[] = ["post", "reels", "story", "carousel"];
const STATUS_OPTIONS: PostStatus[] = ["draft", "in_review", "approved", "scheduled", "published"];

export interface PostDraft {
  title: string;
  body: string;
  cta: string;
  hashtags: string;
  platform: Platform;
  format: PostFormat;
  status: PostStatus;
  scheduled_at: string;
}

interface PostEditorModalProps {
  initial?: Partial<PostDraft>;
  onClose: () => void;
  onSave: (draft: PostDraft) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 16);
}

export function PostEditorModal({ initial, onClose, onSave, onDelete }: PostEditorModalProps) {
  const [draft, setDraft] = useState<PostDraft>({
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    cta: initial?.cta ?? "",
    hashtags: initial?.hashtags ?? "",
    platform: initial?.platform ?? "instagram",
    format: initial?.format ?? "post",
    status: initial?.status ?? "draft",
    scheduled_at: toDatetimeLocal(initial?.scheduled_at),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 520, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0 }}>{initial ? "Редактировать пост" : "Новый пост"}</h2>

        <div className="form-row">
          <label>Заголовок</label>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </div>

        <div className="form-row">
          <label>Текст</label>
          <textarea rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        </div>

        <div className="form-row">
          <label>CTA</label>
          <input value={draft.cta} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} />
        </div>

        <div className="form-row">
          <label>Хэштеги</label>
          <input value={draft.hashtags} onChange={(e) => setDraft({ ...draft, hashtags: e.target.value })} />
        </div>

        <div className="grid cols-2">
          <div className="form-row">
            <label>Платформа</label>
            <select
              value={draft.platform}
              onChange={(e) => setDraft({ ...draft, platform: e.target.value as Platform })}
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Формат</label>
            <select
              value={draft.format}
              onChange={(e) => setDraft({ ...draft, format: e.target.value as PostFormat })}
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid cols-2">
          <div className="form-row">
            <label>Статус</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as PostStatus })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Дата публикации</label>
            <input
              type="datetime-local"
              value={draft.scheduled_at}
              onChange={(e) => setDraft({ ...draft, scheduled_at: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "space-between" }}>
          <div>
            {onDelete && (
              <button className="btn danger" onClick={onDelete}>
                Удалить
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary" onClick={onClose}>
              Отмена
            </button>
            <button className="btn" onClick={handleSave} disabled={saving}>
              {saving ? "Сохраняем…" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
