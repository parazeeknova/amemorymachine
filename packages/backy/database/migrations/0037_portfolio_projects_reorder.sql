-- Rename the personal knowledge base project to amemorymachine, point it at
-- amemorymachine.cc, and reorder the pinned projects:
-- asocialmedia, amemorymachine, lumen, then the rest.

UPDATE portfolio_projects
SET title = 'amemorymachine', product_url = 'https://amemorymachine.cc'
WHERE title LIKE 'Personal knowledge base and folio%';

UPDATE portfolio_projects SET position = 0 WHERE title LIKE 'asocialmedia%';
UPDATE portfolio_projects SET position = 1 WHERE title LIKE 'amemorymachine%';
UPDATE portfolio_projects SET position = 2 WHERE title LIKE 'Lumen%';
UPDATE portfolio_projects SET position = 3 WHERE title LIKE 'Doty%';
UPDATE portfolio_projects SET position = 4 WHERE title LIKE 'Gitcha%';
UPDATE portfolio_projects SET position = 5 WHERE title LIKE 'Papyrus%';
UPDATE portfolio_projects SET position = 6 WHERE title LIKE 'Snix%';
UPDATE portfolio_projects SET position = 7 WHERE title LIKE 'Nyxtext%';
