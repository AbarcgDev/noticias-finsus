CREATE TABLE IF NOT EXISTS noticieros (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    transcript TEXT NOT NULL,
    wav_audio_id TEXT NOT NULL,
    publication_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);