-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0
);

-- Create index for active stories query optimization
CREATE INDEX idx_stories_active ON stories(is_active, expires_at);
