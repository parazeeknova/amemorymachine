-- hball-2 was pointing at a URL scheme that redirects (307) and never
-- loads; use the working /t/ path.

UPDATE portfolio_projects SET readme_url = 'https://img.przknv.cc/t/hball-2.jpeg' WHERE title LIKE 'HackByte 4.0%';
