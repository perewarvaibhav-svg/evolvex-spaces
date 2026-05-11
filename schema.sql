-- ============================================================
--  EvolveX — Supabase Schema & RPC Helpers
--  Run this ONCE in the Supabase SQL Editor:
--    Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─── Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                   SERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  email                TEXT UNIQUE NOT NULL,
  password_hash        TEXT NOT NULL,
  role                 TEXT NOT NULL DEFAULT 'student',
  photo                TEXT DEFAULT 'https://api.dicebear.com/8.x/shapes/svg?seed=evolvex',
  project_name         TEXT DEFAULT '',
  one_liner            TEXT DEFAULT '',
  problem              TEXT DEFAULT '',
  project_link         TEXT DEFAULT '',
  linkedin             TEXT DEFAULT '',
  category             TEXT DEFAULT 'Other',
  stage                TEXT DEFAULT 'Idea',
  is_public            INTEGER DEFAULT 1,
  featured             INTEGER DEFAULT 0,
  quote                TEXT DEFAULT 'Building one step at a time.',
  points               INTEGER DEFAULT 0,
  revenue              REAL DEFAULT 0,
  tasks_done           INTEGER DEFAULT 0,
  customer_convos      INTEGER DEFAULT 0,
  sessions_attended    INTEGER DEFAULT 0,
  streak               INTEGER DEFAULT 0,
  last_active          TEXT DEFAULT '',
  last_login_date      TEXT DEFAULT '',
  login_streak         INTEGER DEFAULT 0,
  must_change_password INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  week        INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  points      INTEGER NOT NULL,
  due_date    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  task_id        INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Not Started',
  work_note      TEXT DEFAULT '',
  proof_link     TEXT DEFAULT '',
  submitted_at   TEXT DEFAULT '',
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, task_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  type           TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT DEFAULT '',
  amount         REAL DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journey (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  title      TEXT NOT NULL,
  details    TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  earned_on   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wins (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  featured    INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance_events (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  event_date  TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  mode        TEXT DEFAULT 'Offline',
  points      INTEGER DEFAULT 15,
  description TEXT DEFAULT '',
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id             SERIAL PRIMARY KEY,
  event_id       INTEGER NOT NULL,
  user_id        INTEGER NOT NULL,
  status         TEXT NOT NULL,
  mode           TEXT DEFAULT '',
  reason         TEXT DEFAULT '',
  takeaway       TEXT DEFAULT '',
  marked_at      TEXT NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(event_id, user_id)
);

-- ─── RPC: supabase_query (SELECT) ─────────────────────────
-- Returns rows as JSON. Called from lib/db.ts query().
CREATE OR REPLACE FUNCTION supabase_query(
  query_text   TEXT,
  query_params TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  dynamic_sql TEXT;
BEGIN
  -- Cast text[] params to anyelement via USING clause is limited;
  -- we rebuild with explicit casts for safety.
  dynamic_sql := query_text;
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || dynamic_sql || ') t'
    INTO result
    USING
      query_params[1], query_params[2], query_params[3],
      query_params[4], query_params[5], query_params[6],
      query_params[7], query_params[8], query_params[9],
      query_params[10];
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- ─── RPC: supabase_execute (INSERT / UPDATE / DELETE) ─────
-- Called from lib/db.ts execute().
CREATE OR REPLACE FUNCTION supabase_execute(
  query_text   TEXT,
  query_params TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query_text
    USING
      query_params[1], query_params[2], query_params[3],
      query_params[4], query_params[5], query_params[6],
      query_params[7], query_params[8], query_params[9],
      query_params[10], query_params[11], query_params[12],
      query_params[13], query_params[14], query_params[15];
END;
$$;

-- ─── Disable RLS so server-side service role key works ─────
ALTER TABLE users             DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities        DISABLE ROW LEVEL SECURITY;
ALTER TABLE journey           DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges            DISABLE ROW LEVEL SECURITY;
ALTER TABLE wins              DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance        DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS access_requests (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  status      TEXT DEFAULT 'pending',
  created_at  TEXT NOT NULL
);

ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;
