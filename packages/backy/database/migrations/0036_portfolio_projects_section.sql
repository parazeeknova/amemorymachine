-- Add a section label to each project so the portfolio can group them
-- (prod vs personal).

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'prod';

-- Default: hobby / personal projects belong to "personal".
UPDATE portfolio_projects SET section = 'personal' WHERE title ILIKE '%doty%' OR title ILIKE '%snix%' OR title ILIKE '%nyxtext%' OR title ILIKE '%zenith%';
