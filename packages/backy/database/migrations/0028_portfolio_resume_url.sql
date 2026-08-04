-- Add resume_url to portfolio_profiles so the portfolio template can expose
-- a resume link shown next to the username / portfolio link.

ALTER TABLE portfolio_profiles ADD COLUMN IF NOT EXISTS resume_url TEXT NOT NULL DEFAULT '';

-- Backfill the pinned profile (and any others without one) with the default
-- resume URL so the link shows immediately without re-saving the template.
UPDATE portfolio_profiles SET resume_url = 'http://f.przknv.cc/u/XghaIR.pdf' WHERE resume_url = '';
