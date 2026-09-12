-- IndTube — Notifications + Creator Studio Migration
-- Extends the existing notifications table and adds creator analytics structures.
-- Does NOT duplicate or modify existing tables from 001/002/003/005.

-- ─── Extend notifications table ─────────────────────────────────────────────
-- Add fields for richer notification context (link_url, actor_avatar, actor_name).
-- These are nullable so existing notifications remain valid.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_avatar_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_name TEXT;

-- Add a notification_type value for comment replies if not present
-- (notification_type enum already has COMMENT, LIKE, SUBSCRIBE, UPLOAD, SYSTEM)

-- Index for efficient "unread count" queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications (user_id, is_read);

-- Index for created_at ordering within a user
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

-- ─── daily_video_stats ──────────────────────────────────────────────────────
-- Aggregated daily statistics per video. Populated by backend logic when views
-- or interactions are recorded. Allows creator analytics without scanning the
-- full events tables each time.

CREATE TABLE IF NOT EXISTS daily_video_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id        UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
    stat_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    views           INTEGER NOT NULL DEFAULT 0,
    likes           INTEGER NOT NULL DEFAULT 0,
    dislikes        INTEGER NOT NULL DEFAULT 0,
    comments        INTEGER NOT NULL DEFAULT 0,
    unique_watchers INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (video_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_video ON daily_video_stats (video_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_video_stats (stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_channel ON daily_video_stats (video_id, stat_date);

-- ─── daily_channel_stats ────────────────────────────────────────────────────
-- Aggregated daily statistics per channel for creator dashboard.

CREATE TABLE IF NOT EXISTS daily_channel_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
    stat_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    total_views     INTEGER NOT NULL DEFAULT 0,
    new_subscribers INTEGER NOT NULL DEFAULT 0,
    new_comments    INTEGER NOT NULL DEFAULT 0,
    new_likes       INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (channel_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_channel_stats_channel ON daily_channel_stats (channel_id);
CREATE INDEX IF NOT EXISTS idx_daily_channel_stats_date ON daily_channel_stats (stat_date DESC);

-- ─── updated_at trigger for new tables ──────────────────────────────────────

CREATE TRIGGER trg_daily_video_stats_updated_at
    BEFORE UPDATE ON daily_video_stats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_daily_channel_stats_updated_at
    BEFORE UPDATE ON daily_channel_stats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── trigger: upsert daily_video_stats on video view ────────────────────────

CREATE OR REPLACE FUNCTION upsert_daily_video_view_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_video_stats (video_id, stat_date, views, unique_watchers)
    VALUES (NEW.video_id, CURRENT_DATE, 1, 1)
    ON CONFLICT (video_id, stat_date)
    DO UPDATE SET views = daily_video_stats.views + 1,
                  unique_watchers = daily_video_stats.unique_watchers + 1,
                  updated_at = now();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_video_view_stats ON video_view_events;
CREATE TRIGGER trg_video_view_stats
    AFTER INSERT ON video_view_events
    FOR EACH ROW EXECUTE FUNCTION upsert_daily_video_view_stats();
