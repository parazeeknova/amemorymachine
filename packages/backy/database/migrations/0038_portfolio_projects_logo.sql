-- Add an optional logo image to each project. The thumbnail shows the
-- logo by default and crossfades to the product screenshot (image) on
-- hover; if one of them is missing the other serves both.

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS logo TEXT NOT NULL DEFAULT '';

UPDATE portfolio_projects SET logo = 'https://img.przknv.cc/t/zephyr.png' WHERE title LIKE 'asocialmedia%';
UPDATE portfolio_projects SET logo = 'https://img.przknv.cc/t/lumen.png' WHERE title LIKE 'Lumen%';
UPDATE portfolio_projects SET logo = 'https://img.przknv.cc/t/verso.png' WHERE title LIKE 'amemorymachine%';
