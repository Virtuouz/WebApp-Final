-- First migration: create the items table.
--
-- Migrations run in order by the number at the start of their folder name.
-- NEVER edit a migration after it has been deployed. To change the table,
-- create a NEW migration (npm run db:new -- "add priority column").

CREATE TABLE items (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  notes      TEXT,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
