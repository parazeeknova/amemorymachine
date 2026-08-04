-- Shrink the papyrus logo inside its thumbnail.

UPDATE portfolio_projects SET logo_scale = 0.8 WHERE title LIKE 'Papyrus%';
