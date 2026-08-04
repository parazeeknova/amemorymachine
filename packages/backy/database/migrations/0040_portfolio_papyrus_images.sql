-- Add papyrus logo + product screenshot, and a product screenshot for
-- amemorymachine (verso).

UPDATE portfolio_projects SET logo = 'https://img.przknv.cc/t/papyrus.png', image = 'https://img.przknv.cc/t/papss.png' WHERE title LIKE 'Papyrus%';
UPDATE portfolio_projects SET image = 'https://img.przknv.cc/t/versopp.png' WHERE title LIKE 'amemorymachine%';
