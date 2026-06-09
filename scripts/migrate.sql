-- Run this once against your Neon database to create the streaks table.
-- In the Neon console: SQL Editor → paste and run.
-- Or via CLI: psql $DATABASE_URL -f scripts/migrate.sql

CREATE TABLE IF NOT EXISTS streaks (
  user_id     TEXT PRIMARY KEY,   -- Google OAuth "sub" (stable across sign-ins)
  current     INT  NOT NULL DEFAULT 0,
  longest     INT  NOT NULL DEFAULT 0,
  last_played DATE                 -- NULL = account exists but never played while signed in
);
