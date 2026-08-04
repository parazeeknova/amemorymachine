-- Buildspace nights & weekends entry back in the timeline.

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, stack, section, position)
SELECT p.id,
  'Nyxtext Zenith',
  'In six weeks, built a text editor in Qt (Nyxtext Zenith) supporting over 35 languages with all the standard features of a text editor, including calltips, autocompletions, filetree, and syntax highlighting.',
  '',
  '',
  'buildspace · Nights & Weekends S5 · Jun 2024 - Aug 2024 · India · Remote',
  'hackathon', 16
FROM portfolio_profiles p WHERE p.is_pinned = true;
