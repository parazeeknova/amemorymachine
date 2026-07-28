-- +goose Up
CREATE TABLE IF NOT EXISTS github_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN NOT NULL DEFAULT true,
    token_encrypted BYTEA,
    username TEXT NOT NULL DEFAULT 'parazeeknova',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO github_settings (enabled, token_encrypted, username)
SELECT true, NULL, 'parazeeknova'
WHERE NOT EXISTS (SELECT 1 FROM github_settings);

-- +goose Down
DROP TABLE IF EXISTS github_settings;
