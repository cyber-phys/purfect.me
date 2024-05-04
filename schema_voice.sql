-- schema.sql

CREATE TABLE IF NOT EXISTS voices (
    id TEXT PRIMARY KEY,
    name TEXT,
    creation_time TEXT
);