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
