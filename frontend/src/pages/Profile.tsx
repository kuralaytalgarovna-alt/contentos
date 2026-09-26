import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useProjectStore } from "../store/projectStore";

export function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const project = useProjectStore((s) => s.currentProject());
  const navigate = useNavigate();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "client_viewer">("client_viewer");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    setInviteMessage(null);
    try {
      await apiClient.post(`/projects/${project.id}/members`, { email: inviteEmail, role: inviteRole });
      setInviteMessage(`${inviteEmail} добавлен(а) в проект как ${inviteRole}`);
      setInviteEmail("");
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setInviteMessage("Пользователь с таким email ещё не зарегистрирован в ContentOS");
      } else if (err?.response?.status === 409) {
        setInviteMessage("Этот пользователь уже состоит в проекте");
      } else {
        setInviteMessage("Не удалось пригласить пользователя");
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Профиль</h1>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Аккаунт</h3>
          <p>{user?.full_name || "—"}</p>
          <p className="muted">{user?.email}</p>
          <button
            className="btn secondary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Выйти
          </button>
        </div>

        {project && project.role === "owner" && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Пригласить в проект «{project.name}»</h3>
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="form-row">
                <label>Email пользователя</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label>Роль</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}>
                  <option value="client_viewer">Клиент (только просмотр)</option>
                  <option value="editor">Редактор</option>
                </select>
              </div>
              <button className="btn" type="submit">
                Пригласить
              </button>
              {inviteMessage && <p className="muted">{inviteMessage}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
