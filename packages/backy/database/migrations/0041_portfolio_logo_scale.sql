-- Optional per-project logo scale (0-1) to shrink logos that render too
-- large inside the thumbnail container (e.g. the asocialmedia squircle).

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS logo_scale REAL NOT NULL DEFAULT 1;

UPDATE portfolio_projects SET logo_scale = 0.8 WHERE title LIKE 'asocialmedia%';
