-- IndTube — Upload Sessions Migration
-- Tracks multipart upload sessions for resume/retry support.

CREATE TABLE upload_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id        UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
    channel_id      UUID NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
    storage_key     TEXT NOT NULL,
    s3_upload_id    TEXT NOT NULL,
    file_size       BIGINT NOT NULL,
    chunk_size      INTEGER NOT NULL,
    total_parts     INTEGER NOT NULL,
    uploaded_parts  INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upload_sessions_video   ON upload_sessions (video_id);
CREATE INDEX idx_upload_sessions_channel ON upload_sessions (channel_id);
CREATE INDEX idx_upload_sessions_status   ON upload_sessions (status);

CREATE TRIGGER trg_upload_sessions_updated_at
    BEFORE UPDATE ON upload_sessions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
