# ContentOS

**Живая демка (только статический frontend, без backend):**
[kuralaytalgarovna-alt.github.io/contentos](https://kuralaytalgarovna-alt.github.io/contentos/)
— показывает интерфейс входа/регистрации; сами API-вызовы работать не будут без развёрнутого backend
(см. «Полноценный live-деплой» ниже).

MVP-реализация продукта по PRD (`Kuralay/проект.md`): контент-план, AI-генератор идей и текста,
конструктор визуала на шаблонах, аналитика соцсетей и PDF-отчёт для клиента — в одном приложении.
Соответствует MVP-скоупу раздела 11 PRD: календарь + ручная публикация, генератор идей/текста,
конструктор с брендбуком, базовая аналитика, мультипроектность.

## Стек

- **Backend:** FastAPI, SQLAlchemy, Alembic, JWT-аутентификация. По умолчанию — SQLite (`backend/contentos.db`),
  без какой-либо установки. Переключение на PostgreSQL — одна переменная окружения.
- **Frontend:** React + TypeScript + Vite, Zustand, React Router, Recharts. Конструктор визуала — на
  HTML5 Canvas (без внешних библиотек рендеринга).
- **AI:** генератор идей/текста поста работает "из коробки" на встроенном шаблонном движке
  (`backend/app/services/ai.py`). Если задать `ANTHROPIC_API_KEY`, тексты будут генерироваться через
  Claude API вместо шаблонов.

## Быстрый старт

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate   # Windows; на Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend поднимется на `http://127.0.0.1:8000` (Swagger UI — `/docs`). SQLite-файл и таблицы создаются
автоматически при первом запуске. Настройки — в `backend/.env` (см. `backend/.env.example`), пустой
`.env` тоже работает.

Тесты: `python -m pytest` (10 тестов: auth, доступ по ролям, посты, AI-идеи, аналитика).

### Frontend

Нужен Node.js 20+ (LTS).

```bash
cd frontend
npm install
npm run dev
```

Откроется `http://localhost:5173` — Vite проксирует `/api` и `/media` на backend (`vite.config.ts`).

### Проверенный сквозной сценарий

Регистрация → онбординг (соцсети → ниша/ЦА/ToV → 5 идей) → дашборд → контент-план (drag-n-drop,
статусы) → идеи → «Развить в пост» → конструктор (шаблоны, брендбук, экспорт PNG) → аналитика →
PDF-отчёт. Всё это прогнано через реальный backend и реальный браузер в ходе разработки.

## Полноценный live-деплой (с рабочим backend)

`render.yaml` в корне — Render Blueprint для one-click деплоя обеих частей разом: зайдите на
[dashboard.render.com](https://dashboard.render.com) через GitHub, **New +** → **Blueprint** → выберите
репозиторий `contentos` → **Apply**. Render поднимет `contentos-backend` (FastAPI) и
`contentos-frontend` (статика с рабочим API) и свяжет их автоматически.

## Переход на PostgreSQL / Redis

`docker-compose.yml` в корне поднимает Postgres и Redis. После `docker compose up -d`:

```
DATABASE_URL=postgresql+psycopg://contentos:contentos@localhost:5432/contentos
```

в `backend/.env`, затем `alembic upgrade head` (миграция уже сгенерирована в `backend/alembic/versions`).

## Что не входит в этот MVP (см. раздел 11–12 PRD)

- Реальная интеграция с Meta/TikTok/Telegram/Threads API (авто-публикация, полная историческая
  аналитика) — в MVP аналитика замокана детерминированно на проект, интерфейс и модели данных уже
  рассчитаны на подключение реальных Insights API.
- OAuth-подключение соцсетей в онбординге — сейчас чек-боксы без реального flow.
- Видеоредактор, тренд-радар, бенчмарки по нише — v2/v3 по дорожной карте.
