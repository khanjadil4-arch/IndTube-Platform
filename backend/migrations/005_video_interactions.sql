-- IndTube — Video Interactions Migration
-- Adds comment_likes and video_view_events tables for interaction tracking.
-- Does not modify existing tables from 001/002/003 — only adds new tables,
-- indexes, and a trigger to maintain denormalized comment counts.

-- ─── comment_likes ──────────────────────────────────────────────────────────
-- Tracks per-user likes on comments. One like per user per comment.

CREATE TABLE IF NOT EXISTS comment_likes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    comment_id  UUID NOT NULL REFERENCES comments (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user    ON comment_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes (comment_id);

-- ─── video_view_events ──────────────────────────────────────────────────────
-- Tracks individual view events for deduplication and analytics.
-- A view is counted once per user per video per 5-minute window.
-- For anonymous views, user_id is NULL and a session hash is used.

CREATE TABLE IF NOT EXISTS video_view_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id     UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
    user_id      UUID REFERENCES users (id) ON DELETE CASCADE,
    session_hash TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_view_events_video ON video_view_events (video_id);
CREATE INDEX IF NOT EXISTS idx_video_view_events_user  ON video_view_events (user_id);
CREATE INDEX IF NOT EXISTS idx_video_view_events_created ON video_view_events (created_at DESC);

-- ─── trigger: maintain comment.like_count ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
DECLARE
    cid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        cid := NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        cid := OLD.comment_id;
    END IF;

    UPDATE comments
       SET like_count = (
         SELECT count(*) FROM comment_likes WHERE comment_id = cid
       )
     WHERE id = cid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_likes_insert ON comment_likes;
CREATE TRIGGER trg_comment_likes_insert
    AFTER INSERT ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

DROP TRIGGER IF EXISTS trg_comment_likes_delete ON comment_likes;
CREATE TRIGGER trg_comment_likes_delete
    AFTER DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- ─── trigger: maintain video.like_count / dislike_count ─────────────────────

CREATE OR REPLACE FUNCTION update_video_like_counts()
RETURNS TRIGGER AS $$
DECLARE
    vid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        vid := NEW.video_id;
    ELSIF TG_OP = 'DELETE' THEN
        vid := OLD.video_id;
    ELSIF TG_OP = 'UPDATE' THEN
        vid := NEW.video_id;
    END IF;

    UPDATE videos
       SET like_count = (
         SELECT count(*) FROM video_likes WHERE video_id = vid AND state = 'LIKE'
       ),
       dislike_count = (
         SELECT count(*) FROM video_likes WHERE video_id = vid AND state = 'DISLIKE'
       )
     WHERE id = vid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_video_likes_insert ON video_likes;
CREATE TRIGGER trg_video_likes_insert
    AFTER INSERT ON video_likes
    FOR EACH ROW EXECUTE FUNCTION update_video_like_counts();

DROP TRIGGER IF EXISTS trg_video_likes_delete ON video_likes;
CREATE TRIGGER trg_video_likes_delete
    AFTER DELETE ON video_likes
    FOR EACH ROW EXECUTE FUNCTION update_video_like_counts();

DROP TRIGGER IF EXISTS trg_video_likes_update ON video_likes;
CREATE TRIGGER trg_video_likes_update
    AFTER UPDATE ON video_likes
    FOR EACH ROW EXECUTE FUNCTION update_video_like_counts();

-- ─── trigger: maintain channels.subscriber_count ────────────────────────────

CREATE OR REPLACE FUNCTION update_channel_subscriber_count()
RETURNS TRIGGER AS $$
DECLARE
    cid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        cid := NEW.channel_id;
    ELSIF TG_OP = 'DELETE' THEN
        cid := OLD.channel_id;
    END IF;

    UPDATE channels
       SET subscriber_count = (
         SELECT count(*) FROM subscriptions WHERE channel_id = cid
       )
     WHERE id = cid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_insert ON subscriptions;
CREATE TRIGGER trg_subscriptions_insert
    AFTER INSERT ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_channel_subscriber_count();

DROP TRIGGER IF EXISTS trg_subscriptions_delete ON subscriptions;
CREATE TRIGGER trg_subscriptions_delete
    AFTER DELETE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_channel_subscriber_count();

-- ─── trigger: maintain video.comment_count ──────────────────────────────────

CREATE OR REPLACE FUNCTION update_video_comment_count()
RETURNS TRIGGER AS $$
DECLARE
    vid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        vid := NEW.video_id;
    ELSIF TG_OP = 'DELETE' THEN
        vid := OLD.video_id;
    END IF;

    UPDATE videos
       SET comment_count = (
         SELECT count(*) FROM comments
          WHERE video_id = vid AND is_removed = FALSE
       )
     WHERE id = vid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comments_insert ON comments;
CREATE TRIGGER trg_comments_insert
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION update_video_comment_count();

DROP TRIGGER IF EXISTS trg_comments_delete ON comments;
CREATE TRIGGER trg_comments_delete
    AFTER DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_video_comment_count();
