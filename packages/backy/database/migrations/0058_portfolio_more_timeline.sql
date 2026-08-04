-- Two more timeline entries below the hackbytes: Summer of Bitcoin
-- trainee and the buildspace nights & weekends program. No photos.

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, stack, section, position)
SELECT p.id,
  'Bitcoin Development Trainee',
  'Participated in the bootcamp round of Summer of Bitcoin 2025, Developer Track, solving blockchain-focused challenges in Rust. Worked on Bitcoin node interactions, multisig transactions, mining, and descriptor wallets.',
  '',
  '',
  'Summer of Bitcoin · Internship · Feb 2025 - Mar 2025 · India · Remote',
  'hackathon', 16
FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, stack, section, position)
SELECT p.id,
  'Nyxtext Zenith',
  'In six weeks, built a text editor in Qt (Nyxtext Zenith) supporting over 35 languages with all the standard features of a text editor, including calltips, autocompletions, filetree, and syntax highlighting.',
  '',
  '',
  'buildspace · Nights & Weekends S5 · Jun 2024 - Aug 2024 · India · Remote',
  'hackathon', 17
FROM portfolio_profiles p WHERE p.is_pinned = true;
