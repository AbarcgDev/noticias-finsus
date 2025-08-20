CREATE TABLE IF NOT EXISTS notas_finsus (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT ,
    pubDate DEFAULT CURRENT_TIMESTAMP
);