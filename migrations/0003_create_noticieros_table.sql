CREATE TABLE IF NOT EXISTS noticieros (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    guion TEXT NOT NULL,
    state TEXT NOT NULL,
    publicationDate DEFAULT CURRENT_TIMESTAMP,
    approvedBy TEXT
);