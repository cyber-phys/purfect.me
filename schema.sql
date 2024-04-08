-- schema.sql

CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT,
    character_prompt TEXT,
    video_system_prompt TEXT,
    video_prompt TEXT,
    canvas_system_prompt TEXT,
    canvas_prompt TEXT,
    starting_messages BLOB,
    voice TEXT,
    base_model TEXT,
    is_video_transcription_enabled INTEGER,
    is_video_transcription_continuous INTEGER,
    video_transcription_model TEXT,
    video_transcription_interval INTEGER,
    is_canvas_enabled INTEGER,
    canvas_model TEXT,
    canvas_interval INTEGER,
    bio TEXT,
    creation_time TEXT
);