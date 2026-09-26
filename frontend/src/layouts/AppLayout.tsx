import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { ProjectSwitcher } from "../components/ProjectSwitcher";
import { listProjects } from "../api/projects";
import { fetchMe } from "../api/auth";
import { useProjectStore } from "../store/projectStore";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

export function AppLayout() {
  const [loading, setLoading] = useState(true);
  const setProjects = useProjectStore((s) => s.setProjects);
  const projects = useProjectStore((s) => s.projects);
  const setUser = useAuthStore((s) => s.setUser);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [me, projectList] = await Promise.all([fetchMe(), listProjects()]);
        if (cancelled) return;
        setUser(me);
        setProjects(projectList);
        if (projectList.length === 0) {
          navigate("/onboarding");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="main-content">Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <button onClick={toggleSidebar} aria-label="Открыть меню">
          ☰
        </button>
        <div className="sidebar-logo">ContentOS</div>
      </div>
      <Sidebar />
      <div className="main-content">
        {projects.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <ProjectSwitcher />
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
