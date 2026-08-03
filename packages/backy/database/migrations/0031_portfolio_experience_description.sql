-- Add per-experience descriptions so each job can carry a rich write-up.

ALTER TABLE portfolio_experiences ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
