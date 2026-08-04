-- Optional per-entry photo for experiences; the portfolio renders club
-- photos as a single-row strip under the university clubs tab. Users
-- without images simply get no strip.

ALTER TABLE portfolio_experiences ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT '';

UPDATE portfolio_experiences SET image = 'https://img.przknv.cc/t/aic.jpeg' WHERE title LIKE '%AI Club%';
UPDATE portfolio_experiences SET image = 'https://img.przknv.cc/t/moz2.jpeg' WHERE title LIKE '%Mozilla Firefox Club%';
