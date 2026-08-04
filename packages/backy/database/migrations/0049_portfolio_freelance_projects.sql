-- Optional freelance client projects, shown under their own tab with a
-- distinct grid layout. Users without freelance work simply don't get it.

INSERT INTO portfolio_projects (profile_id, title, description, image, product_url, section, position)
SELECT p.id,
  'itssingularity.com',
  'Singularity Works, an opinionated product studio building systems, infrastructure, and tools for companies that ship.',
  'https://img.przknv.cc/t/Screenshot_2026-07-08_00.57.49.png',
  'https://itssingularity.com',
  'freelance', 10
FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, product_url, section, position)
SELECT p.id,
  'ALLROUND PMC Pvt Ltd',
  'ALLROUND PMC is India''s leading project management consultancy for hospitality, healthcare, and construction. We deliver precision, strategy, and excellence.',
  'https://img.przknv.cc/t/allround.webp',
  'https://allroundpmc.com',
  'freelance', 11
FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, product_url, section, position)
SELECT p.id,
  'Oryx Hotel Supplies (UAE)',
  'Qatar''s trusted partner in premium hotel supplies',
  'https://img.przknv.cc/?asset=oryx.webp',
  'https://oryxhotelsupplies.com',
  'freelance', 12
FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, product_url, section, position)
SELECT p.id,
  'Saltwise by Dr. Chandra Mohana',
  'Saltwise helps you find medication alternatives and understand your choices without the jargon.',
  'https://img.przknv.cc/t/saltwise.webp',
  '',
  'freelance', 13
FROM portfolio_profiles p WHERE p.is_pinned = true;
