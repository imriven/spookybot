# Spookybot

Spookybot is a Node.js Twitch bot with an internal web admin. It manages Twitch chat commands and timers, posts selected updates into Discord, and stores editable runtime content in PostgreSQL.

## Main Functions

### Admin web app
The admin server lives in `admin/` and `views/`. It supports Twitch OAuth login, protected CRUD pages for timers, tracked streamers, shoutouts, facts, tips, exercises, and chat commands, plus switching between the hardcoded main and test Twitch targets.

### Twitch bot runtime
The Twitch runtime is orchestrated by `services/twitch-manager.js` and `services/timer-manager.js`. It connects chat, loads the active target, posts timer messages, serves configured commands, can update stream title, and keeps the runtime aligned with the current admin-selected target.

### Content and persistence
Editable content is stored in PostgreSQL and accessed through `repositories/` and `services/content-service.js`. Twitch OAuth access and refresh tokens are stored in `twitch_auth_tokens`. The selected active target is stored in `app_settings`. Redis is optional and is only used for tip rotation state.

## Local Run

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

The app runs migrations on boot and starts the admin server from `app.js`.

## Database Seed Backup

Create a backup seed export:

```bash
npm run dump:seed
```

This writes a generated seed file under `data/seed-exports/`. By default it exports the current admin-managed content tables and `app_settings`. It does not export Twitch auth tokens unless you explicitly opt into sensitive tables.

Export selected tables only:

```bash
npm run dump:seed -- --table timers --table chat_commands
```

## Restore To A New Database

Point `DATABASE_URL` at the empty target database, then restore a generated export:

```bash
npm run restore:seed -- --input data/seed-exports/20260509_db_export.cjs
```

What this does:

1. Runs the latest migrations.
2. Ensures baseline bootstrap rows exist.
3. Deletes and re-inserts the exported tables.
4. Resets ID sequences so new admin inserts do not collide after restore.

After restore, log into the admin again to reconnect the Twitch bot account if needed.
