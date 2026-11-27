import { useEffect, useState } from "react";
import {
  apiRequest,
  getAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from "./api";
import { MENU, SETTINGS_ITEM } from "./menu";
import type { MenuItem } from "./menu";
import type { LoginResponse, Profile } from "./types";
import ComingSoon from "./pages/ComingSoon";
import GroupsPage from "./pages/GroupsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";

const PAGE_KEY = "testportal_page";

export default function App() {
  const [email, setEmail] = useState(() => localStorage.getItem("testportal_login_email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(() => getAccessToken() !== null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [page, setPageState] = useState(
    () => sessionStorage.getItem(PAGE_KEY) ?? "groups",
  );

  function setPage(next: string) {
    sessionStorage.setItem(PAGE_KEY, next);
    setPageState(next);
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setProfile(null);
      setError("Сессия истекла. Войдите снова.");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (getAccessToken() === null) {
      return;
    }
    apiRequest<Profile>("/api/auth/me")
      .then(setProfile)
      .catch(() => setAccessToken(null))
      .finally(() => setRestoring(false));
  }, []);

  async function login() {
    setLoading(true);
    setError(null);
    setAccessToken(null);
    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(response.access_token);
      setProfile(await apiRequest<Profile>("/api/auth/me"));
    } catch (e) {
      setAccessToken(null);
      setError(e instanceof Error ? e.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAccessToken(null);
    sessionStorage.removeItem(PAGE_KEY);
    setProfile(null);
    setPassword("");
    setPageState("groups");
  }

  if (restoring) {
    return (
      <div className="login">
        <p className="muted">Загрузка...</p>
      </div>
    );
  }

  if (!profile) {
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

  const isAdmin = profile.permissions.includes("roles.manage");
  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
  const allItems: MenuItem[] = [...MENU.flatMap((s) => s.items), SETTINGS_ITEM];
  const current = allItems.find((i) => i.key === page);
  const title = page === "profile" ? "Профиль" : current?.label;

  function renderPage() {
    if (page === "profile" && profile) {
      return <ProfilePage profile={profile} onUpdated={setProfile} />;
    }
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
          <h1>{title}</h1>
          <div className="row" style={{ margin: 0 }}>
            <button onClick={() => setPage("profile")}>{displayName}</button>
            <button onClick={logout}>Выйти</button>
          </div>
        </header>
        <main>{renderPage()}</main>
      </div>
    </div>
  );
}
