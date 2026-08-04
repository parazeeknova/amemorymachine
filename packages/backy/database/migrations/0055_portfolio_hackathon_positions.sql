-- HackByte 4.0: drop the coffee/team line, highlight the position in the
-- timeline meta with the squiggle span.

UPDATE portfolio_projects SET
  description = 'Won HackByte 4.0 First place at IIIT Jabalpur with MLH. We built Chorus, an infinite spatial canvas for AI-assisted development: coding tasks become cards on a canvas, agents execute them in parallel across multiple projects, and you direct master agents and their subagents from a single prompt interface. 110+ providers, 4000+ models. For the demo we sent a voice note from a phone and ran multiple models writing and executing tests live in front of judges from Microsoft, Adobe, and Amazon.',
  stack = 'Apr 2026 · <span class="squiggle-highlight">Winner (1st Position)</span> · IIIT Jabalpur · MLH'
WHERE title LIKE 'HackByte 4.0%';

UPDATE portfolio_projects SET stack = 'Apr 2025 · <span class="squiggle-highlight">Runner-up, Wikimedia track</span> · IIIT Jabalpur' WHERE title LIKE 'HackByte 3.0%';
