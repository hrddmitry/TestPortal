import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import type { Permission, Role } from "../types";

export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest<Role[]>("/api/roles"),
      apiRequest<Permission[]>("/api/permissions"),
    ])
      .then(([r, p]) => {
        setRoles(r);
        setPermissions(p);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка запроса"));
  }, []);

  return (
    <div className="card">
      <h2>Настройки</h2>
      <div className="tabs">
        <button className="tab active">Роли и права</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid-2">
        <div>
          <h3>Роли</h3>
          <ul className="list">
            {roles.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Права</h3>
          <ul className="list">
            {permissions.map((p) => (
              <li key={p.id}>
                <code>{p.code}</code> — {p.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
