import { NavLink } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Дашборд", icon: "📊" },
  { to: "/calendar", label: "Контент-план", icon: "🗓️" },
  { to: "/ideas", label: "Идеи (AI)", icon: "💡" },
  { to: "/constructor", label: "Конструктор", icon: "🎨" },
  { to: "/analytics", label: "Аналитика", icon: "📈" },
  { to: "/media-library", label: "Медиатека", icon: "🖼️" },
];

export function Sidebar() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">ContentOS</div>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
        <span>👤</span>
        <span>Профиль</span>
      </NavLink>
      <button
        className="sidebar-link"
        style={{ border: "none", background: "none", textAlign: "left", width: "100%" }}
        onClick={toggleTheme}
      >
        <span>{theme === "light" ? "🌙" : "☀️"}</span>
        <span>{theme === "light" ? "Тёмная тема" : "Светлая тема"}</span>
      </button>
    </nav>
  );
}
