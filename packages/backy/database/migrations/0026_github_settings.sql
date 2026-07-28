-- +goose Up
CREATE TABLE IF NOT EXISTS github_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN NOT NULL DEFAULT true,
    token TEXT,
    username TEXT NOT NULL DEFAULT 'parazeeknova',
    token_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO github_settings (enabled, token, username)
SELECT true, NULL, 'parazeeknova'
WHERE NOT EXISTS (SELECT 1 FROM github_settings);

-- +goose Down
DROP TABLE IF EXISTS github_settings;
