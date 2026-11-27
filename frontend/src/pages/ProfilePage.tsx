import { useState } from "react";
import { apiRequest } from "../api";
import type { Profile } from "../types";

export default function ProfilePage({
  profile,
  onUpdated,
}: {
  profile: Profile;
  onUpdated: (profile: Profile) => void;
}) {
  const [form, setForm] = useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    birthday: profile.birthday ?? "",
    avatar: profile.avatar ?? "",
    about: profile.about ?? "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [field]: e.target.value });

  async function run(action: () => Promise<void>) {
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    }
  }

  const save = () =>
    run(async () => {
      const body = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim() === "" ? null : value]),
      );
      const updated = await apiRequest<Profile>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      onUpdated(updated);
      setInfo("Профиль сохранён");
    });

  const changePassword = () =>
    run(async () => {
      await apiRequest("/api/auth/me/password", {
        method: "PUT",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setInfo("Пароль изменён");
    });

  const name = [profile.last_name, profile.first_name].filter(Boolean).join(" ") || profile.email;

  return (
    <div className="grid-2">
      <div className="card">
        <h2>{name}</h2>
        <p className="muted">{profile.email}</p>
        <p>Роли: {profile.roles.length ? profile.roles.join(", ") : "—"}</p>
        <p>Группы: {profile.groups.length ? profile.groups.join(", ") : "—"}</p>
        <p>Дата приёма: {profile.hired_at ?? "—"}</p>
        <p>
          Права:{" "}
          {profile.permission_names.length
            ? profile.permission_names.join(", ")
            : "—"}
        </p>
        {error && <p className="error">{error}</p>}
        {info && <p className="muted">{info}</p>}

        <h3>Смена пароля</h3>
        <p className={newPassword.length > 0 && newPassword.length < 8 ? "error" : "muted"}>Новый пароль — не менее 8 символов.</p>
        <div className="row">
          <input
            type="password"
            placeholder="Текущий пароль"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Новый пароль (мин. 8 символов)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            className="primary"
            disabled={!currentPassword || newPassword.length < 8}
            onClick={changePassword}
          >
            Сменить пароль
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Редактирование</h2>
        <div className="row">
          <input placeholder="Фамилия" value={form.last_name} onChange={set("last_name")} />
          <input placeholder="Имя" value={form.first_name} onChange={set("first_name")} />
        </div>
        <div className="row">
          <input placeholder="Телефон" value={form.phone} onChange={set("phone")} />
          <input placeholder="Город" value={form.location} onChange={set("location")} />
        </div>
        <div className="row">
          <input type="date" title="Дата рождения" value={form.birthday} onChange={set("birthday")} />
        </div>
        <div className="row">
          <input placeholder="Ссылка на аватар" value={form.avatar} onChange={set("avatar")} />
        </div>
        <div className="row">
          <textarea placeholder="О себе" rows={4} value={form.about} onChange={set("about")} />
        </div>
        <button className="primary" onClick={save}>
          Сохранить
        </button>
      </div>
    </div>
  );
}
