-- IndTube — Auth Migration
-- Adds authentication fields to users and creates refresh_tokens table.
-- Does not modify the existing schema from 001 — only adds columns and a new table.

-- ─── auth columns on users ───────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_login        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS account_status    TEXT        NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users (account_status);

-- ─── refresh_tokens ──────────────────────────────────────────────────────
-- Only the hash of the refresh token is stored — never the raw token.

CREATE TABLE refresh_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash   TEXT NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    revoked_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_hash   ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at);
