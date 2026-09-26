import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";

export function ProjectSwitcher() {
  const projects = useProjectStore((s) => s.projects);
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const setCurrentProjectId = useProjectStore((s) => s.setCurrentProjectId);
  const navigate = useNavigate();

  if (projects.length === 0) {
    return (
      <button className="btn secondary" onClick={() => navigate("/onboarding")}>
        + Новый проект
      </button>
    );
  }

  return (
    <select
      value={currentProjectId ?? ""}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          navigate("/onboarding");
          return;
        }
        setCurrentProjectId(e.target.value);
      }}
      style={{ minWidth: 220 }}
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
      <option value="__new__">+ Новый проект</option>
    </select>
  );
}
