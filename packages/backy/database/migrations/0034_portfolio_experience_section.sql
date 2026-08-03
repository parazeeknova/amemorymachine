-- Add a section label to each experience entry so the portfolio can group
-- them (e.g. professional vs university clubs).

ALTER TABLE portfolio_experiences ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'professional';

-- Default: the two VIT club roles belong to "university clubs".
UPDATE portfolio_experiences SET section = 'university clubs' WHERE title LIKE '%Mozilla Firefox Club%' OR title LIKE '%AI Club%';
