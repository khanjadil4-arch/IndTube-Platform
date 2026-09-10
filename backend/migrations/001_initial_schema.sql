-- IndTube — Initial Schema Migration
-- Standard PostgreSQL. No ORM, no vendor-specific features.
-- All tables use UUID primary keys via gen_random_uuid() (pgcrypto).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── enums ──────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('USER', 'CREATOR', 'ADMIN', 'OWNER');

CREATE TYPE video_visibility AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

CREATE TYPE video_status AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'REMOVED');

CREATE TYPE like_state AS ENUM ('LIKE', 'DISLIKE');

CREATE TYPE notification_type AS ENUM ('UPLOAD', 'COMMENT', 'LIKE', 'SUBSCRIBE', 'SYSTEM');

CREATE TYPE report_target_type AS ENUM ('VIDEO', 'COMMENT', 'CHANNEL', 'USER');

CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- ─── users ──────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    username        TEXT NOT NULL UNIQUE,
    display_name    TEXT NOT NULL,
    password_hash   TEXT,
    avatar_url      TEXT,
    bio             TEXT DEFAULT '',
    role            user_role NOT NULL DEFAULT 'USER',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_username   ON users (username);
CREATE INDEX idx_users_role       ON users (role);

-- ─── categories ─────────────────────────────────────────────────────────

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    icon        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories (slug);

-- ─── channels ───────────────────────────────────────────────────────────

CREATE TABLE channels (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    handle           TEXT NOT NULL UNIQUE,
    avatar_url       TEXT,
    banner_url       TEXT,
    description      TEXT DEFAULT '',
    subscriber_count INTEGER NOT NULL DEFAULT 0,
    video_count      INTEGER NOT NULL DEFAULT 0,
    is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_channels_owner  ON channels (owner_id);
CREATE INDEX idx_channels_handle ON channels (handle);

-- ─── videos ──────────────────────────────────────────────────────────────

CREATE TABLE videos (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id        UUID NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
    category_id       UUID REFERENCES categories (id) ON DELETE SET NULL,
    title             TEXT NOT NULL,
    description       TEXT DEFAULT '',
    visibility        video_visibility NOT NULL DEFAULT 'PUBLIC',
    status            video_status NOT NULL DEFAULT 'UPLOADING',
    duration_seconds  INTEGER NOT NULL DEFAULT 0,
    thumbnail_url     TEXT,
    video_url         TEXT,
    storage_key       TEXT,
    view_count        BIGINT NOT NULL DEFAULT 0,
    like_count        BIGINT NOT NULL DEFAULT 0,
    dislike_count     BIGINT NOT NULL DEFAULT 0,
    comment_count     INTEGER NOT NULL DEFAULT 0,
    is_published      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_videos_channel   ON videos (channel_id);
CREATE INDEX idx_videos_category  ON videos (category_id);
CREATE INDEX idx_videos_created   ON videos (created_at DESC);
CREATE INDEX idx_videos_visibility ON videos (visibility);
CREATE INDEX idx_videos_status    ON videos (status);

-- ─── comments ────────────────────────────────────────────────────────────

CREATE TABLE comments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id         UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments (id) ON DELETE CASCADE,
    text             TEXT NOT NULL,
    like_count       INTEGER NOT NULL DEFAULT 0,
    is_pinned        BOOLEAN NOT NULL DEFAULT FALSE,
    is_removed       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_video  ON comments (video_id);
CREATE INDEX idx_comments_user   ON comments (user_id);
CREATE INDEX idx_comments_parent ON comments (parent_comment_id);

-- ─── video_likes ──────────────────────────────────────────────────────────

CREATE TABLE video_likes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    video_id    UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
    state       like_state NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, video_id)
);

CREATE INDEX idx_video_likes_user  ON video_likes (user_id);
CREATE INDEX idx_video_likes_video ON video_likes (video_id);

-- ─── subscriptions ───────────────────────────────────────────────────────

CREATE TABLE subscriptions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    channel_id    UUID NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (subscriber_id, channel_id)
);

CREATE INDEX idx_subscriptions_subscriber ON subscriptions (subscriber_id);
CREATE INDEX idx_subscriptions_channel     ON subscriptions (channel_id);

-- ─── watch_history ───────────────────────────────────────────────────────

CREATE TABLE watch_history (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    video_id         UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
    watched_position INTEGER NOT NULL DEFAULT 0,
    last_watched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, video_id)
);

CREATE INDEX idx_watch_history_user ON watch_history (user_id);
CREATE INDEX idx_watch_history_video ON watch_history (video_id);

-- ─── notifications ───────────────────────────────────────────────────────

CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type          notification_type NOT NULL,
    title         TEXT,
    message       TEXT,
    actor_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read  ON notifications (is_read);

-- ─── reports ──────────────────────────────────────────────────────────────

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    target_type     report_target_type NOT NULL,
    target_video_id    UUID REFERENCES videos (id) ON DELETE CASCADE,
    target_comment_id  UUID REFERENCES comments (id) ON DELETE CASCADE,
    target_channel_id  UUID REFERENCES channels (id) ON DELETE CASCADE,
    target_user_id     UUID REFERENCES users (id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    status          report_status NOT NULL DEFAULT 'PENDING',
    resolution_note TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_reporter ON reports (reporter_id);
CREATE INDEX idx_reports_status   ON reports (status);
CREATE INDEX idx_reports_target   ON reports (target_type, status);

-- ─── updated_at trigger ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
