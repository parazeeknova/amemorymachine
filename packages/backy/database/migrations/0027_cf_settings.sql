CREATE TABLE IF NOT EXISTS cf_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN NOT NULL DEFAULT false,
    username TEXT NOT NULL DEFAULT 'parazeeknova',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cf_settings (enabled, username)
SELECT false, 'parazeeknova'
WHERE NOT EXISTS (SELECT 1 FROM cf_settings);
