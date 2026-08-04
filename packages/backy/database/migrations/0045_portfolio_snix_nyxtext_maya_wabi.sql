-- Snix + Nyxtext Zenith copy/images, and two new personal projects
-- (Maya, zen-wabi).

UPDATE portfolio_projects SET
  description = $$Snix. the snippet manager i wanted in my terminal and couldn't find, so i built it.

Fast TUI for snippets, notebooks, and boilerplates, inspired by Nap, built because copy-pasting from old projects got old. Hierarchical notebooks keep things organized instead of one giant dump, fuzzy search finds what I need without remembering exact names, syntax highlighting across 25+ languages so it actually reads right. Versioned storage means nothing gets overwritten by accident. Still shipping (soon!), still the tool I reach for daily.$$,
  logo = 'https://img.przknv.cc/t/snixl.png',
  image = 'https://img.przknv.cc/t/snix.png'
WHERE title LIKE 'Snix%';

UPDATE portfolio_projects SET
  title = 'Nyxtext Zenith. a keyboard-first code editor, built to be the last text editor I install.',
  description = $$Successor to Nyxtext, rebuilt from scratch on PyQt6 and QScintilla. Windows editor with a built-in terminal, 35+ languages, code folding, Lua for when I want it to work exactly my way. Started as one project trying to kill the need for five different text tools, Zenith just does it better, faster, and without getting in the way of my hands leaving the keyboard.$$,
  logo = 'https://img.przknv.cc/t/Zenith-logo.png',
  image = 'https://img.przknv.cc/t/nyxtext.png'
WHERE title LIKE 'Nyxtext%';

INSERT INTO portfolio_projects (profile_id, title, description, logo, section, position)
SELECT p.id,
  'Maya. closed-set face recognition, built for rooms where every face is already known.',
  $$Fully local face recognition for controlled environments, no cloud APIs, no scraped data, no open-world guessing. Every identity gets explicitly enrolled in advance, so matching is deterministic against a private set instead of trying to recognize the entire world. Live operator view overlays names, roles, and confidence directly on the camera feed, with transport, inference, and enrollment kept as separate, explicit boundaries instead of one black box. Built for knowing who's actually in the room, not guessing who might be.$$,
  'https://img.przknv.cc/t/maya.png',
  'personal', 8
FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, readme_url, repo_url, section, position)
SELECT p.id,
  'zen-wabi. your wallpaper already re-themes your terminal, now it re-themes your browser too.',
  $$Turns matugen into a live theming engine for Zen Browser. Same wallpaper-switcher event that re-tints your terminal, status bar, and launcher now re-tints every open tab too, no separate theme step, no manual sync. Per-site overrides for places like GitHub that already run their own design system, so it re-tints without fighting them. One palette, every surface, including the browser everyone forgets to theme.$$,
  'https://img.przknv.cc/t/zen-wabi.png',
  'https://raw.githubusercontent.com/parazeeknova/zen-wabi/refs/heads/main/.github/README.md',
  'https://github.com/parazeeknova/zen-wabi',
  'personal', 9
FROM portfolio_profiles p WHERE p.is_pinned = true;
