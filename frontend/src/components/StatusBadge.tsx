import type { PostStatus } from "../types";

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Черновик",
  in_review: "На согласовании",
  approved: "Одобрено",
  scheduled: "Запланировано",
  published: "Опубликовано",
};

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: "#9ca3af",
  in_review: "#f59e0b",
  approved: "#0ea5e9",
  scheduled: "#6366f1",
  published: "#22c55e",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className="badge" style={{ background: STATUS_COLORS[status] + "22", color: STATUS_COLORS[status] }}>
      {STATUS_LABELS[status]}
    </span>
  );
}
