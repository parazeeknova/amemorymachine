-- Optional hackathon entries, rendered as a timeline under the projects.
-- Users without any simply don't get the section. The stack field carries
-- the timeline meta (date · placement · venue).

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, stack, section, position)
SELECT p.id,
  'HackByte 4.0',
  'We won HackByte 4.0 First place. 48 hours, 20+ cups of coffee, three humans running on pure spite and caffeine: me, Aman Aziz and Koustubh Pande. We built Chorus, an infinite spatial canvas for AI-assisted development: coding tasks become cards on a canvas and agents execute them autonomously in parallel, across multiple projects at once, while you stay in control through a single prompt interface directing master agents and their subagents. 110+ providers, 4000+ models. Check progress from your phone mid-run, get notified, prompt on the go. Deploy to your own VPS or run it locally, you own the whole stack. For the demo, we sent a voice note from a phone: three model providers spun up, running multiple models simultaneously, writing and running unit, integration, and e2e tests across separate projects on the laptop in front of judges from Microsoft, Adobe, and Amazon. Thank you BitByte TPC and IIITDM Jabalpur and Major League Hacking for the chaos, the caffeine, and a memory we will not forget anytime soon.',
  'https://img.przknv.cc/t/1775453585144.jpg',
  'https://img.przknv.cc/t/1775453588171.jpg',
  'Apr 2026 · Winner (1st Position) · IIIT Jabalpur · MLH',
  'hackathon', 14
FROM portfolio_profiles p WHERE p.is_pinned = true;

INSERT INTO portfolio_projects (profile_id, title, description, image, logo, stack, section, position)
SELECT p.id,
  'HackByte 3.0',
  'Secured 2nd place in the Wikimedia track at HackByte 3.0. Judged by mentors from the Wikimedia Foundation.',
  'https://img.przknv.cc/t/hackbyte-3.png',
  '',
  'Apr 2025 · Runner-up, Wikimedia track · IIIT Jabalpur',
  'hackathon', 15
FROM portfolio_profiles p WHERE p.is_pinned = true;
