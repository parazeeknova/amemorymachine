-- Full snix copy as a single markdown-safe line (multiline descs get
-- truncated by the template round-trip), and reorder the personal tab:
-- doty, zen-wabi, maya, then the rest.

UPDATE portfolio_projects SET description = 'Snix. the snippet manager i wanted in my terminal and couldn''t find, so i built it. Fast TUI for snippets, notebooks, and boilerplates, inspired by Nap, built because copy-pasting from old projects got old. Hierarchical notebooks keep things organized instead of one giant dump, fuzzy search finds what I need without remembering exact names, syntax highlighting across 25+ languages so it actually reads right. Versioned storage means nothing gets overwritten by accident. Still shipping (soon!), still the tool I reach for daily.' WHERE title LIKE 'Snix%';

UPDATE portfolio_projects SET position = 0 WHERE title LIKE 'asocialmedia%';
UPDATE portfolio_projects SET position = 1 WHERE title LIKE 'amemorymachine%';
UPDATE portfolio_projects SET position = 2 WHERE title LIKE 'Lumen%';
UPDATE portfolio_projects SET position = 3 WHERE title LIKE 'Doty%';
UPDATE portfolio_projects SET position = 4 WHERE title LIKE 'zen-wabi%';
UPDATE portfolio_projects SET position = 5 WHERE title LIKE 'Maya%';
UPDATE portfolio_projects SET position = 6 WHERE title LIKE 'Snix%';
UPDATE portfolio_projects SET position = 7 WHERE title LIKE 'Nyxtext%';
UPDATE portfolio_projects SET position = 8 WHERE title LIKE 'Gitcha%';
UPDATE portfolio_projects SET position = 9 WHERE title LIKE 'Papyrus%';
