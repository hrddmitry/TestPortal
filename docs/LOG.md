# Журнал работы

Новые записи добавляются в конец. Формат: дата, что сделано, коммиты, что важно знать. Хеши коммитов приведены для ориентира.

## 25.11.2026 — окружение и каркас backend
- Установлены VS Code, uv 0.13.10, Python 3.15.2 (Python 3.13 не нужен).
- В `backend` создан проект uv, добавлены fastapi, uvicorn, sqlalchemy, psycopg[binary], alembic, pydantic-settings; импорт библиотек проверен.
- Коммит `082439d` — Initialize Python backend with uv.

## 26.11.2026 — WSL, Docker, PostgreSQL
- WSL 2 не запускался из-за выключенной виртуализации; она включена в BIOS/UEFI. Установлен Docker Desktop 29.9.3, Compose 5.7.1; `hello-world` отработал.
- Добавлены `compose.yaml` и `.env.example`; PostgreSQL 18.7 запущен, состояние healthy, порт только на `127.0.0.1:5432`, данные в томе `pgdata`. Образ закреплён на 18, потому что `latest` уже указывает на 19.
- Коммит `fdbef08` — Add PostgreSQL Docker Compose setup.
- Проблемы: файл `compose.yaml` был пустым (не сохранён в редакторе); подключение через `localhost` занимало ~130 с, заменено на `127.0.0.1` (3 с).

## 26.11.2026 — подключение Python к базе, API, Alembic
- Настроены `config.py` (pydantic-settings читает корневой `.env`) и подключение SQLAlchemy.
- Коммит `c208737` — Add backend database settings (хеш выведен из вывода push).
- Коммит `a0c92ca` — Add FastAPI app with health check.
- Alembic инициализирован, первая модель `users` (id, email, created_at), миграция `bdccf003696b`; применена, таблицы `users` и `alembic_version` проверены. Коммит `5273814` — Add Alembic and users table migration.
- Эта первая миграция будет заменена новой при перестройке под модули.

## 26.11.2026 — frontend
- Установлены Node.js v26.13.1 и npm 11.20.0.
- Создан каркас React + Vite 8.3.8 + TypeScript с линтером Oxlint. Коммит `2a4462e` — Add React Vite TypeScript frontend.
- Прокси Vite `/api` на `127.0.0.1:8000`, страница показывает ответ `/api/health` (API и база OK). Коммит `ce2c240` — Connect frontend to API health check.

## 26.11.2026 — проектирование
- Прочитан аудит портала KINGSTORE; выбрана архитектура модульного монолита и правила (см. `PROJECT.md`).
- Согласованы поля `users`, правила мягкого удаления, роли, права, группы (см. `PROJECT.md`).
- Решено: до одобрения пользователем ни одна таблица не создаётся.

## 26.11.2026 — текущий шаг (в процессе, не закоммичен)
- Этап 1, перестройка под модули: откат базы (`alembic downgrade base`), удаление старой миграции `bdccf003696b`, перенос `config.py` и `database.py` в `core/` (в `config.py` путь к корню становится `parents[4]`), новая `modules/users/models.py`, `public_api.py`, `MODULE.md`, обновление импортов в `main.py` и `migrations/env.py`.
- Дальше: Import Linter, генерация и проверка новой начальной миграции, коммит.

## 2026-11-27 — Перестройка backend

- Созданы папки core, modules, modules/users.
- database.py перенесён в core, models.py — в modules/users.
- Созданы __init__.py для новых пакетов.
- Обновлены импорты в main.py, models.py, migrations/env.py.
- Старая миграция удалена, создана новая 33b55971c2ce_create_users_table.py.
- Миграция применена, база на ревизии 33b55971c2ce (head).
- Приложение запускается, /api/health возвращает ok ok.
- Коммит: 1cbfb6e — Restructure backend into core and users module.

## 2026-11-27 — Поля пользователя и комментарии в БД

- Расширена модель `users`: добавлены `first_name`, `last_name`, `avatar`, `birthday`, `location`, `phone`, `about`, `signature`, `hired_at`, `is_active`, `updated_at`, `deleted_at`.
- Добавлены русские комментарии к таблице и полям в PostgreSQL.
- Создана и применена миграция `ceefb983f82b_add_user_profile_fields`.
- База на ревизии `ceefb983f82b (head)`.
- Коммит: `0082989` — Add user profile fields and database comments.

## 2026-11-27 — Import Linter

- Добавлен `import-linter` в dev-зависимости.
- В `pyproject.toml` настроен контракт `Core does not depend on modules`.
- Проверка `uv run lint-imports pyproject.toml` пройдена: `Contracts: 1 kept, 0 broken`.
- Коммит: `ca5b3ae` — Add Import Linter with core independence contract.
## 2026-11-27 — Проверка проекта и решение по пользователям

- Проверка Import Linter пройдена: `Contracts: 1 kept, 0 broken`.
- База на ревизии `ceefb983f82b (head)`.
- Сервер запущен, `/api/health` возвращает `ok ok`.
- Решено: пользователи создаются администратором; саморегистрация и приглашения на старте не нужны, но могут быть добавлены позже.
## 2026-11-27 — API пользователей

- Добавлены `schemas.py`, `crud.py`, `router.py` в модуле `users`.
- Реализованы эндпоинты: `POST /api/users`, `GET /api/users`, `GET /api/users/{user_id}`.
- Email нормализуется в нижний регистр при создании.
- Проверено: создание пользователя и получение списка работают.
- Коммит: `ce78f08` — Add users API with create, list and get endpoints.
## 2026-11-27 — Аутентификация

- Добавлен модуль `auth`: bcrypt-хеширование паролей, JWT и зависимость для получения id пользователя из токена.
- Добавлены настройки `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`.
- В модель и таблицу `users` добавлено обязательное поле `password_hash`; миграция `cefd3b072674` применена.
- Добавлен эндпоинт `PUT /api/users/{user_id}/password` для установки пароля.
- Добавлен эндпоинт `POST /api/auth/login`; при успешном входе возвращается JWT.
- Проверено: установка пароля и вход для пользователя `test@example.com` работают, оба запроса возвращают `200 OK`.
## 2026-11-27 — Текущий пользователь

- Добавлена схема `CurrentUser` и эндпоинт `GET /api/auth/me`.
- Эндпоинт принимает JWT в заголовке `Authorization: Bearer <token>`.
- Возвращаются id, email, имя, фамилия и статус активности текущего пользователя.
- Проверено: запрос с токеном пользователя `test@example.com` возвращает корректные данные.
## 2026-11-27 — Роли и права: модели

- Добавлен модуль `roles` с моделями `Role` и `Permission`.
- Добавлены связи: `role_permissions`, `user_roles` и `user_permissions`.
- Права можно назначать роли или напрямую пользователю.
- Миграция `5947759fb2ef` создана и применена.
- Проверено: импорт моделей и применение миграции прошли успешно.
## 2026-11-27 — Роли и права: API

- Добавлены эндпоинты для создания и просмотра ролей и прав.
- Добавлено назначение права роли, роли пользователю и права пользователю напрямую.
- Созданы роль `Administrator` и право `users.manage`.
- Проверено: право привязано к роли, роль и право назначены пользователю id 1.
## Текущее состояние

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL.
- Модуль `users`: создание, список, получение пользователя, установка пароля.
- Модуль `auth`: bcrypt, JWT, `/api/auth/login`, `/api/auth/me`.
- Модуль `roles`: `Role`, `Permission`, связи `role_permissions`, `user_roles`, `user_permissions`.
- API ролей и прав: создание, просмотр, назначение роли/права.
- Тестовый пользователь: id 1, `test@example.com`, роль `Administrator`, право `users.manage`.
- Следующий шаг: проверка прав при доступе к защищённым эндпоинтам.
- Создан `docs/WORKFLOW.md` с правилами продолжения работы в новых чатах.
## 2026-11-27 — Проверка прав

- Добавлена зависимость `require_permission` для проверки права текущего пользователя.
- Право ищется как прямое назначение пользователю или через одну из его ролей.
- Эндпоинты `POST /api/users` и `GET /api/users` защищены правом `users.manage`.
- Проверено: запрос без токена возвращает `401`; запрос с токеном пользователя, имеющего право, возвращает список пользователей.
## 2026-11-27 — Защита API ролей и прав

- Добавлены права `roles.manage` и `permissions.manage`.
- Оба права назначены роли `Administrator`.
- Эндпоинты создания, просмотра и назначения ролей защищены `roles.manage`.
- Эндпоинты создания, просмотра и назначения прав защищены `permissions.manage`.
- Проверено: запросы с токеном администратора возвращают данные; запрос без токена возвращает `401`.
## 2026-11-27 — Модуль групп

- Добавлен модуль `groups`: модель `Group`, связь `group_members`, CRUD и API.
- Добавлены миграции:
  - `f642520aaf9d` — пустая автогенерация, оставлена в истории;
  - `66102e07ee9e` — пустая автогенерация, оставлена в истории;
  - `acd4050df6c8` — создаёт таблицы `groups` и `group_members`.
- Исправлен `backend/migrations/env.py`: добавлен импорт `backend.modules.groups.models`, чтобы Alembic видел модели групп.
- Удалён пустой артефакт первоначального каркаса `backend/app`.
- Добавлено право `groups.manage` и назначено роли `Administrator`.
- API групп защищён правом `groups.manage`.
- Проверены endpoints:
  - `GET /api/groups` — 200;
  - `POST /api/groups` — 201;
  - `GET /api/groups/{id}` — доступен;
  - `PATCH /api/groups/{id}` — доступен;
  - `DELETE /api/groups/{id}` — мягкое удаление;
  - `GET /api/groups/{id}/members` — 200;
  - `POST /api/groups/{id}/members/{user_id}` — 200;
  - `DELETE /api/groups/{id}/members/{user_id}` — 200.
- Создана тестовая группа `Test Group`; добавление и удаление пользователя id 1 проверены.
## 2026-11-27 — Минимальный фронтенд

- Добавлен API-клиент `frontend/src/api.ts` с JWT-токеном в заголовке `Authorization`.
- Добавлены типы `Group` и `LoginResponse` в `frontend/src/types.ts`.
- Переделан `frontend/src/App.tsx`: экран входа и список групп.
- Настроен CORS в FastAPI для `http://127.0.0.1:5173` и `http://localhost:5173`.
- Проверено в браузере:
  - вход пользователя `test@example.com`;
  - получение JWT;
  - загрузка `GET /api/groups`;
  - отображение тестовой группы `Test Group`.