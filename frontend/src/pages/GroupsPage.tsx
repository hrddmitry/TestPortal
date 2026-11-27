import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import type { Group, Member, User } from "../types";

const memberName = (m: { first_name: string | null; last_name: string | null; email: string }) =>
  [m.last_name, m.first_name].filter(Boolean).join(" ") || m.email;

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    }
  }

  async function loadGroups() {
    setGroups(await apiRequest<Group[]>("/api/groups"));
  }

  async function loadMembers(group: Group) {
    setSelected(group);
    setUserId("");
    setMembers(await apiRequest<Member[]>(`/api/groups/${group.id}/members`));
  }

  useEffect(() => {
    run(async () => {
      await loadGroups();
      setUsers(await apiRequest<User[]>("/api/users"));
    });
  }, []);

  const candidates = users.filter(
    (u) => u.is_active && !members.some((m) => m.id === u.id),
  );

  const createGroup = () =>
    run(async () => {
      await apiRequest<Group>("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name, description: description || null }),
      });
      setName("");
      setDescription("");
      await loadGroups();
    });

  const deleteGroup = (group: Group) =>
    run(async () => {
      await apiRequest<Group>(`/api/groups/${group.id}`, { method: "DELETE" });
      if (selected?.id === group.id) {
        setSelected(null);
        setMembers([]);
      }
      await loadGroups();
    });

  const addMember = () =>
    run(async () => {
      if (!selected || !userId) return;
      setMembers(
        await apiRequest<Member[]>(
          `/api/groups/${selected.id}/members/${Number(userId)}`,
          { method: "POST" },
        ),
      );
      setUserId("");
    });

  const removeMember = (member: Member) =>
    run(async () => {
      if (!selected) return;
      setMembers(
        await apiRequest<Member[]>(
          `/api/groups/${selected.id}/members/${member.id}`,
          { method: "DELETE" },
        ),
      );
    });

  return (
    <div className="grid-2">
      <div className="card">
        <h2>Группы</h2>
        {error && <p className="error">{error}</p>}

        <div className="row">
          <input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="primary" disabled={!name.trim()} onClick={createGroup}>
            Создать группу
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="muted">Групп пока нет.</p>
        ) : (
          <ul className="list">
            {groups.map((group) => (
              <li key={group.id} className={selected?.id === group.id ? "active" : ""}>
                <span onClick={() => run(() => loadMembers(group))} className="grow">
                  <strong>{group.name}</strong>
                  {group.description ? ` — ${group.description}` : ""}
                </span>
                <button onClick={() => deleteGroup(group)}>Удалить</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>{selected ? `Участники: ${selected.name}` : "Участники"}</h2>
        {!selected ? (
          <p className="muted">Выберите группу слева.</p>
        ) : (
          <>
            <div className="row">
              <select value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Выберите коллегу</option>
                {candidates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {memberName(u)} — {u.email}
                  </option>
                ))}
              </select>
              <button className="primary" disabled={!userId} onClick={addMember}>
                Добавить участника
              </button>
            </div>
            {members.length === 0 ? (
              <p className="muted">В группе пока нет участников.</p>
            ) : (
              <ul className="list">
                {members.map((m) => (
                  <li key={m.id}>
                    <span className="grow">
                      <strong>{memberName(m)}</strong> — {m.email}
                    </span>
                    <button onClick={() => removeMember(m)}>Убрать</button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
