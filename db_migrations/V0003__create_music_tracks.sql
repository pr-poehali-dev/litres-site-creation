-- Таблица музыкальных треков
CREATE TABLE IF NOT EXISTS music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    duration VARCHAR(20) NOT NULL,
    cover TEXT,
    audio_url TEXT NOT NULL,
    is_adult_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_music_tracks_artist ON music_tracks(artist);
CREATE INDEX IF NOT EXISTS idx_music_tracks_created_at ON music_tracks(created_at);