import { useEffect, useMemo, useState } from "react";
import { createPost, deletePost, listPosts, updatePost } from "../api/posts";
import { PostEditorModal, PostDraft } from "../components/PostEditorModal";
import { StatusBadge } from "../components/StatusBadge";
import { useProjectStore } from "../store/projectStore";
import type { Platform, Post } from "../types";

const PLATFORM_OPTIONS: Platform[] = ["instagram", "tiktok", "facebook", "telegram", "threads"];
const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildMonthGrid(reference: Date): Date[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function draftToPayload(draft: PostDraft) {
  return {
    ...draft,
    scheduled_at: draft.scheduled_at ? new Date(draft.scheduled_at).toISOString() : null,
  };
}

function postToDraftInitial(post: Post): Partial<PostDraft> {
  return { ...post, scheduled_at: post.scheduled_at ?? undefined };
}

export function Calendar() {
  const projectId = useProjectStore((s) => s.currentProjectId);
  const [posts, setPosts] = useState<Post[]>([]);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [monthReference, setMonthReference] = useState(new Date());
  const [editing, setEditing] = useState<Post | "new" | null>(null);
  const [newPostDate, setNewPostDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!projectId) return;
    void listPosts(projectId).then(setPosts);
  }, [projectId]);

  const days = useMemo(() => buildMonthGrid(monthReference), [monthReference]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      if (platformFilter !== "all" && post.platform !== platformFilter) continue;
      if (!post.scheduled_at) continue;
      const key = post.scheduled_at.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    }
    return map;
  }, [posts, platformFilter]);

  const unscheduled = posts.filter((p) => !p.scheduled_at && (platformFilter === "all" || p.platform === platformFilter));

  if (!projectId) {
    return <p className="muted">Сначала создайте проект.</p>;
  }

  async function handleDrop(day: Date, postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const existingTime = post.scheduled_at ? new Date(post.scheduled_at) : new Date();
    const next = new Date(day);
    next.setHours(existingTime.getHours() || 12, existingTime.getMinutes() || 0, 0, 0);
    const updated = await updatePost(projectId!, postId, { scheduled_at: next.toISOString() });
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  }

  async function handleSave(draft: PostDraft) {
    if (editing === "new") {
      const created = await createPost(projectId!, draftToPayload(draft));
      setPosts((prev) => [...prev, created]);
    } else if (editing) {
      const updated = await updatePost(projectId!, editing.id, draftToPayload(draft));
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  }

  async function handleDelete() {
    if (editing && editing !== "new") {
      await deletePost(projectId!, editing.id);
      setPosts((prev) => prev.filter((p) => p.id !== editing.id));
      setEditing(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Контент-план</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value as Platform | "all")}>
            <option value="all">Все платформы</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            className="btn secondary"
            onClick={() => setMonthReference(new Date(monthReference.getFullYear(), monthReference.getMonth() - 1, 1))}
          >
            ←
          </button>
          <div style={{ alignSelf: "center", minWidth: 120, textAlign: "center" }}>
            {monthReference.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
          </div>
          <button
            className="btn secondary"
            onClick={() => setMonthReference(new Date(monthReference.getFullYear(), monthReference.getMonth() + 1, 1))}
          >
            →
          </button>
          <button
            className="btn"
            onClick={() => {
              setNewPostDate(null);
              setEditing("new");
            }}
          >
            + Новый пост
          </button>
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <strong>Без даты ({unscheduled.length})</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {unscheduled.map((post) => (
              <div
                key={post.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", post.id)}
                onClick={() => setEditing(post)}
                className="card"
                style={{ padding: 8, cursor: "grab", minWidth: 160 }}
              >
                <div style={{ fontSize: 13 }}>{post.title || "(без названия)"}</div>
                <StatusBadge status={post.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 8, minWidth: 700 }}>
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="muted" style={{ textAlign: "center" }}>
              {label}
            </div>
          ))}
          {days.map((day) => {
            const key = toDateKey(day);
            const dayPosts = postsByDay.get(key) ?? [];
            const isCurrentMonth = day.getMonth() === monthReference.getMonth();
            return (
              <div
                key={key}
                className="card"
                style={{
                  minHeight: 110,
                  padding: 8,
                  opacity: isCurrentMonth ? 1 : 0.4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const postId = e.dataTransfer.getData("text/plain");
                  void handleDrop(day, postId);
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">{day.getDate()}</span>
                  <button
                    className="btn secondary"
                    style={{ padding: "2px 6px", fontSize: 11 }}
                    onClick={() => {
                      setNewPostDate(day);
                      setEditing("new");
                    }}
                  >
                    +
                  </button>
                </div>
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", post.id)}
                    onClick={() => setEditing(post)}
                    style={{
                      fontSize: 12,
                      padding: "4px 6px",
                      borderRadius: 6,
                      background: "var(--color-bg)",
                      cursor: "grab",
                    }}
                  >
                    <div>{post.title || post.platform}</div>
                    <StatusBadge status={post.status} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <PostEditorModal
          initial={
            editing === "new"
              ? newPostDate
                ? { scheduled_at: new Date(newPostDate.setHours(12, 0, 0, 0)).toISOString() }
                : undefined
              : postToDraftInitial(editing)
          }
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={editing !== "new" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
