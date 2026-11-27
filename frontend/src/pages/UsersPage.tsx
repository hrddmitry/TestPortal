import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import type { User } from "../types";

const EMPTY = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  location: "",
  hired_at: "",
  password: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    }
  }

  async function loadUsers() {
    setUsers(await apiRequest<User[]>("/api/users"));
  }

  useEffect(() => {
    run(loadUsers);
  }, []);

  const set = (field: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm({ ...form, [field]: e.target.value });

  const createUser = () =>
    run(async () => {
      const created = await apiRequest<User>("/api/users", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          location: form.location || null,
          hired_at: form.hired_at || null,
          password: form.password,
        }),
      });
      if (form.password) {
        await apiRequest(`/api/users/${created.id}/password`, {
          method: "PUT",
          body: JSON.stringify({ password: form.password }),
        });
      }
      setForm(EMPTY);
      setInfo(`Пользователь ${created.email} создан`);
      await loadUsers();
    });

  const changePassword = () =>
    run(async () => {
      if (!selected) return;
      await apiRequest(`/api/users/${selected.id}/password`, {
        method: "PUT",
        body: JSON.stringify({ password: newPassword }),
      });
      setNewPassword("");
      setInfo("Пароль обновлён");
    });

  const fullName = (u: User) =>
    [u.last_name, u.first_name].filter(Boolean).join(" ") || u.email;

  return (
    <div className="grid-2">
      <div className="card">
        <h2>Коллеги</h2>
        {error && <p className="error">{error}</p>}
        {info && <p className="muted">{info}</p>}

        <div className="row">
          <input placeholder="Email" value={form.email} onChange={set("email")} />
          <input placeholder="Фамилия" value={form.last_name} onChange={set("last_name")} />
          <input placeholder="Имя" value={form.first_name} onChange={set("first_name")} />
          <input placeholder="Телефон" value={form.phone} onChange={set("phone")} />
          <input placeholder="Город" value={form.location} onChange={set("location")} />
          <input type="date" title="Дата приёма" value={form.hired_at} onChange={set("hired_at")} />
          <input
            type="password"
            placeholder="Пароль (мин. 8 символов)"
            value={form.password}
            onChange={set("password")}
          />
          <button
            className="primary"
            disabled={!form.email.trim() || !form.first_name.trim() || !form.last_name.trim() || form.password.length < 8}
            onClick={createUser}
          >
            Создать пользователя
          </button>
        </div>

        <ul className="list">
          {users.map((u) => (
            <li key={u.id} className={selected?.id === u.id ? "active" : ""}>
              <span className="grow" onClick={() => setSelected(u)}>
                <strong>{fullName(u)}</strong> — {u.email}
                {u.is_active ? "" : " (неактивен)"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Профиль</h2>
        {!selected ? (
          <p className="muted">Выберите пользователя слева.</p>
        ) : (
          <>
            <p><strong>{fullName(selected)}</strong></p>
            <p className="muted">ID: {selected.id}</p>
            <p>Email: {selected.email}</p>
            <p>Телефон: {selected.phone ?? "—"}</p>
            <p>Город: {selected.location ?? "—"}</p>
            <p>Дата рождения: {selected.birthday ?? "—"}</p>
            <p>Дата приёма: {selected.hired_at ?? "—"}</p>
            <p>О себе: {selected.about ?? "—"}</p>
            <div className="row">
              <input
                type="password"
                placeholder="Новый пароль (мин. 8 символов)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                className="primary"
                disabled={newPassword.length < 8}
                onClick={changePassword}
              >
                Сменить пароль
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
