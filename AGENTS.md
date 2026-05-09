# Repository Guidelines

## Project Structure & Module Organization
`app.js` is the runtime entrypoint. Core behavior lives in `services/` for orchestration, `repositories/` for PostgreSQL access, and `config/` for environment and database setup. Admin HTTP code is in `admin/`, Twitch and Discord integrations are in `twitch/` and `discord/`, and Redis helpers are in `redis/`. Server-rendered EJS templates live in `views/`. Database migrations are in `data/migrations/`, and operational scripts such as content export live in `scripts/`.

## Build, Test, and Development Commands
`npm install` installs dependencies.

`npm start` runs the app locally with `node app.js`.

`npm run dump:seed` exports the current content tables to a seed file under `data/seed-exports/`.

`npm run dump:seed -- --table timers --table chat_commands` exports only selected tables.

`npm test` is currently a placeholder and exits with an error. Add real tests before relying on it in CI.

## Coding Style & Naming Conventions
Use ES modules and keep imports grouped at the top of each file. Follow the existing style: two-space indentation, semicolons, double quotes in JavaScript, and small focused modules. Use `kebab-case` for filenames in `services/` and `repositories/`, camelCase for variables/functions, and PascalCase for classes such as `SessionStore` or `TwitchManager`. Keep EJS templates simple and prefer escaped output with `<%= ... %>`.

## Testing Guidelines
There is no established test framework yet. For new work, add targeted automated tests where practical and document manual verification steps in the PR. Prioritize coverage around admin mutations, seed export/restore behavior, and Twitch auth/session flows. Name future test files after the module under test, for example `content-service.test.js`.

## Commit & Pull Request Guidelines
Recent history uses very short subjects like `mobile style` and `test`. Keep commits concise, imperative, and scoped to one change, but prefer clearer messages such as `add CSP nonces to admin templates`. PRs should include a short summary, touched areas, manual test notes, config or migration impacts, and screenshots for admin UI changes.

## Security & Configuration Tips
Secrets belong in `.env` only; never commit credentials or exported sensitive token data. Required values include `DATABASE_URL`, `SESSION_SECRET`, `TOKEN_ENCRYPTION_KEY`, and Twitch bot settings. If you restore from exported seeds, re-run migrations first and keep the same environment keys if encrypted tokens are ever imported.
