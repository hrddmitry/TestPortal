import { useState } from "react";
import { apiRequest, setAccessToken } from "./api";
import type { Group, LoginResponse } from "./types";

export default function App() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);

  async function login() {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setAccessToken(response.access_token);
      const groupList = await apiRequest<Group[]>("/api/groups");
      setGroups(groupList);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось войти",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "48px auto", fontFamily: "sans-serif" }}>
      <h1>TestPortal</h1>

      {!groups ? (
        <section>
          <h2>Вход</h2>

          <label style={{ display: "block", marginBottom: 8 }}>
            Email
            <input
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            Пароль
            <input
              type="password"
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            onClick={login}
            disabled={loading}
            style={{ padding: "10px 16px", cursor: "pointer" }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>

          {error && (
            <p style={{ color: "crimson" }}>{error}</p>
          )}
        </section>
      ) : (
        <section>
          <h2>Группы</h2>

          {groups.length === 0 ? (
            <p>Групп пока нет.</p>
          ) : (
            <ul>
              {groups.map((group) => (
                <li key={group.id}>
                  <strong>{group.name}</strong>
                  {group.description ? ` — ${group.description}` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
