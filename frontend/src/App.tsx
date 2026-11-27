import { useState } from "react";
import { apiRequest, setAccessToken } from "./api";
import { MENU, SETTINGS_ITEM } from "./menu";
import type { MenuItem } from "./menu";
import type { LoginResponse } from "./types";
import ComingSoon from "./pages/ComingSoon";
import GroupsPage from "./pages/GroupsPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState("groups");

  async function login() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(response.access_token);
      try {
        await apiRequest("/api/roles");
        setIsAdmin(true);
      } catch {
        setIsAdmin(false);
      }
      setLoggedIn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAccessToken(null);
    setLoggedIn(false);
    setIsAdmin(false);
    setPassword("");
    setPage("groups");
  }

  if (!loggedIn) {
    return (
      <div className="login">
        <div className="card">
          <h1>TestPortal</h1>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Пароль"
          />
          <button className="primary" onClick={login} disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  const allItems: MenuItem[] = [...MENU.flatMap((s) => s.items), SETTINGS_ITEM];
  const current = allItems.find((i) => i.key === page);

  function renderPage() {
    if (page === "groups") return <GroupsPage />;
    if (page === "colleagues") return <UsersPage />;
    if (page === "settings" && isAdmin) return <SettingsPage />;
    return <ComingSoon title={current?.label ?? "Раздел"} />;
  }

  function button(item: MenuItem) {
    return (
      <button
        key={item.key}
        className={`nav-item${page === item.key ? " active" : ""}${item.ready ? "" : " soon"}`}
        onClick={() => setPage(item.key)}
      >
        {item.label}
      </button>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">TestPortal</div>
        {MENU.map((section, index) => (
          <div key={section.title ?? index}>
            {section.title && <div className="nav-title">{section.title}</div>}
            {section.items.map(button)}
          </div>
        ))}
        {isAdmin && (
          <div>
            <div className="nav-title">Система</div>
            {button(SETTINGS_ITEM)}
          </div>
        )}
      </aside>

      <div className="content">
        <header className="topbar">
          <h1>{current?.label}</h1>
          <button onClick={logout}>Выйти</button>
        </header>
        <main>{renderPage()}</main>
      </div>
    </div>
  );
}
