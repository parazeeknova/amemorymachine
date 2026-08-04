-- Open source section data: hacktoberfest stats, program stints and the
-- holopin board, stored as 'opensource' projects so nothing on the page
-- is hardcoded. Users without entries simply don't get the section.

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, product_url, stack, section, position)
SELECT p.id, 'hacktoberfest 24', '', '', '', '', 'mentor + participant · 16 PRs merged', 'opensource', 18 FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, product_url, stack, section, position)
SELECT p.id, 'hacktoberfest 25', '', '', '', '', 'mentor + participant · 48 PRs merged', 'opensource', 19 FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, product_url, stack, section, position)
SELECT p.id, 'holopin', 'Participated in Hacktoberfest 2024 and 2025 as both mentor and participant, merging 16 pull requests in 24 and 48 in 25 across open source projects.', 'https://holopin.me/parazeeknova', '', 'https://holopin.io/@parazeeknova', '', 'opensource', 20 FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, product_url, stack, section, position)
SELECT p.id, 'Social Winter of Code (SWOC)', 'Served as project admin and contributor: guided participants through their first open-source contributions, triaged issues, and kept the project healthy and mergeable for the whole program. Ranked 9th overall among all contributors by impact and activity.', '', '', '', 'Jan 2025 - Mar 2025 · India · Remote', 'opensource', 21 FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, product_url, stack, section, position)
SELECT p.id, 'Summer of Bitcoin', 'Selected for the Summer of Bitcoin 2025 bootcamp, Developer Track, an open-source program for Bitcoin development. Solved blockchain-focused challenges in Rust, working on Bitcoin node interactions, multisig transactions, mining, and descriptor wallets.', '', '', '', 'Feb 2025 - Mar 2025 · India · Remote', 'opensource', 22 FROM portfolio_profiles p WHERE p.is_pinned = true;
