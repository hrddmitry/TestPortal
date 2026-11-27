import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import type { Permission, Role, User } from "../types";

type Tab = "roles" | "permissions" | "assign";

const userName = (u: User) =>
  [u.last_name, u.first_name].filter(Boolean).join(" ") || u.email;

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [permCode, setPermCode] = useState("");
  const [permName, setPermName] = useState("");
  const [permDesc, setPermDesc] = useState("");
  const [roleId, setRoleId] = useState("");
  const [permId, setPermId] = useState("");
  const [userId, setUserId] = useState("");
  const [userRoleId, setUserRoleId] = useState("");

  async function run(action: () => Promise<void>, done?: string) {
    setError(null);
    setInfo(null);
    try {
      await action();
      if (done) setInfo(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    }
  }

  async function loadAll() {
    const [r, p, u] = await Promise.all([
      apiRequest<Role[]>("/api/roles"),
      apiRequest<Permission[]>("/api/permissions"),
      apiRequest<User[]>("/api/users"),
    ]);
    setRoles(r);
    setPermissions(p);
    setUsers(u);
  }

  useEffect(() => {
    run(loadAll);
  }, []);

  const createRole = () =>
    run(async () => {
      await apiRequest<Role>("/api/roles", {
        method: "POST",
        body: JSON.stringify({ name: roleName, description: roleDesc || null }),
      });
      setRoleName("");
      setRoleDesc("");
      await loadAll();
    }, "Роль создана");

  const createPermission = () =>
    run(async () => {
      await apiRequest<Permission>("/api/permissions", {
        method: "POST",
        body: JSON.stringify({ code: permCode, name: permName, description: permDesc || null }),
      });
      setPermCode("");
      setPermName("");
      setPermDesc("");
      await loadAll();
    }, "Право создано");

  const assignPermission = () =>
    run(async () => {
      await apiRequest(`/api/roles/${roleId}/permissions/${permId}`, { method: "POST" });
    }, "Право назначено роли");

  const assignRole = () =>
    run(async () => {
      await apiRequest(`/api/users/${userId}/roles/${userRoleId}`, { method: "POST" });
    }, "Роль назначена пользователю");

  const tabButton = (key: Tab, label: string) => (
    <button className={`tab${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>
      {label}
    </button>
  );

  return (
    <div className="card">
      <h2>Настройки</h2>
      <div className="tabs">
        {tabButton("roles", "Роли")}
        {tabButton("permissions", "Права")}
        {tabButton("assign", "Назначения")}
      </div>
      {error && <p className="error">{error}</p>}
      {info && <p className="muted">{info}</p>}

      {tab === "roles" && (
        <>
          <div className="row">
            <input placeholder="Название роли" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            <input placeholder="Описание" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} />
            <button className="primary" disabled={!roleName.trim()} onClick={createRole}>
              Создать роль
            </button>
          </div>
          <ul className="list">
            {roles.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong>
                {r.description ? ` — ${r.description}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "permissions" && (
        <>
          <div className="row">
            <input placeholder="Код (например, users.manage)" value={permCode} onChange={(e) => setPermCode(e.target.value)} />
            <input placeholder="Название" value={permName} onChange={(e) => setPermName(e.target.value)} />
            <input placeholder="Описание" value={permDesc} onChange={(e) => setPermDesc(e.target.value)} />
            <button className="primary" disabled={!permCode.trim() || !permName.trim()} onClick={createPermission}>
              Создать право
            </button>
          </div>
          <ul className="list">
            {permissions.map((p) => (
              <li key={p.id}>
                <code>{p.code}</code> — {p.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "assign" && (
        <div className="grid-2">
          <div>
            <h3>Право → роль</h3>
            <div className="row">
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                <option value="">Роль</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select value={permId} onChange={(e) => setPermId(e.target.value)}>
                <option value="">Право</option>
                {permissions.map((p) => (
                  <option key={p.id} value={p.id}>{p.code}</option>
                ))}
              </select>
              <button className="primary" disabled={!roleId || !permId} onClick={assignPermission}>
                Назначить право
              </button>
            </div>
          </div>
          <div>
            <h3>Роль → пользователь</h3>
            <div className="row">
              <select value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Пользователь</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{userName(u)} — {u.email}</option>
                ))}
              </select>
              <select value={userRoleId} onChange={(e) => setUserRoleId(e.target.value)}>
                <option value="">Роль</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button className="primary" disabled={!userId || !userRoleId} onClick={assignRole}>
                Назначить роль
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
