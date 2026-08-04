-- Hackathon timeline retouch: shorter HackByte 4.0 writeup, third photo
-- for 4.0 (rides the unused readme_url slot), second photo for 3.0.

UPDATE portfolio_projects SET
  description = 'Won HackByte 4.0 First place at IIIT Jabalpur with MLH. 48 hours, three humans, pure spite and caffeine: me, Aman Aziz and Koustubh Pande. We built Chorus, an infinite spatial canvas for AI-assisted development: coding tasks become cards on a canvas, agents execute them in parallel across multiple projects, and you direct master agents and their subagents from a single prompt interface. 110+ providers, 4000+ models. For the demo we sent a voice note from a phone and ran multiple models writing and executing tests live in front of judges from Microsoft, Adobe, and Amazon.',
  readme_url = 'https://img.przknv.cc/?asset=hball-2.jpeg'
WHERE title LIKE 'HackByte 4.0%';

UPDATE portfolio_projects SET logo = 'https://img.przknv.cc/t/Screenshot_2026-08-04_16.08.19.png' WHERE title LIKE 'HackByte 3.0%';
