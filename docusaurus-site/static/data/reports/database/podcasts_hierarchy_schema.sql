-- ============================================
-- PODCASTS HIERARCHY - SCHEMA MIGRATION
-- ============================================
-- This adds a parent "podcasts" table and updates podcast_configs
-- to establish a one-to-many relationship
-- ============================================

-- STEP 1: Create podcasts parent table
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_name TEXT NOT NULL UNIQUE,
  podcast_tagline TEXT,
  description TEXT,
  default_output_language TEXT DEFAULT 'English',
  brand_color TEXT, -- Hex color for UI display
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create indexes for podcasts
CREATE INDEX IF NOT EXISTS idx_podcasts_name ON podcasts(podcast_name);
CREATE INDEX IF NOT EXISTS idx_podcasts_active ON podcasts(is_active);

-- STEP 3: Create update trigger for podcasts
CREATE OR REPLACE FUNCTION update_podcasts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_podcasts_updated_at();

-- STEP 4: Enable RLS for podcasts
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on podcasts" ON podcasts FOR ALL USING (true);

-- STEP 5: Add podcast_id foreign key to podcast_configs
-- First, add the column (nullable initially to allow migration)
ALTER TABLE podcast_configs
ADD COLUMN IF NOT EXISTS podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE;

-- Create index on FK
CREATE INDEX IF NOT EXISTS idx_podcast_configs_podcast_id ON podcast_configs(podcast_id);

-- STEP 6: Remove podcast_name and podcast_tagline from podcast_configs
-- These now live in the parent podcasts table
-- NOTE: We'll keep these columns for now during migration, drop them after data is migrated

-- STEP 7: Insert parent podcasts (inferred from existing configs)
INSERT INTO podcasts (podcast_name, podcast_tagline, brand_color, description) VALUES
  ('XPNTNL Insider', 'Tech strategies for indie music labels', '#3B82F6', 'Professional tech-focused podcast for startup and business content'),
  ('Revok Records Radio', 'Electronic music production insights', '#8B5CF6', 'High-energy podcast for electronic music production and creative content'),
  ('Learning Lab', 'Making complex topics simple', '#10B981', 'Clear, structured educational podcast for tutorials and how-to content'),
  ('Behind the Curtain', 'Stories from the inside', '#F59E0B', 'Dramatic, engaging podcast for narrative and behind-the-scenes content'),
  ('Perspectives', 'Exploring both sides of the story', '#EF4444', 'Balanced, analytical podcast for discussion and debate content')
ON CONFLICT (podcast_name) DO NOTHING;

-- STEP 8: Update existing podcast_configs with correct podcast_id
UPDATE podcast_configs
SET podcast_id = (SELECT id FROM podcasts WHERE podcast_name = 'XPNTNL Insider')
WHERE config_name = 'zen-revok-content-podcast';

UPDATE podcast_configs
SET podcast_id = (SELECT id FROM podcasts WHERE podcast_name = 'Revok Records Radio')
WHERE config_name = 'revok-records-radio';

UPDATE podcast_configs
SET podcast_id = (SELECT id FROM podcasts WHERE podcast_name = 'Learning Lab')
WHERE config_name = 'learning-lab-podcast';

UPDATE podcast_configs
SET podcast_id = (SELECT id FROM podcasts WHERE podcast_name = 'Behind the Curtain')
WHERE config_name = 'behind-the-scenes-stories';

UPDATE podcast_configs
SET podcast_id = (SELECT id FROM podcasts WHERE podcast_name = 'Perspectives')
WHERE config_name = 'perspectives-debate-podcast';

-- STEP 9: Make podcast_id NOT NULL after migration
-- Run this after verifying all configs have podcast_id assigned
-- ALTER TABLE podcast_configs ALTER COLUMN podcast_id SET NOT NULL;

-- STEP 10: Verify the relationship
SELECT
  p.podcast_name,
  p.podcast_tagline,
  COUNT(pc.id) as config_count,
  STRING_AGG(pc.config_name, ', ' ORDER BY pc.config_name) as configs
FROM podcasts p
LEFT JOIN podcast_configs pc ON pc.podcast_id = p.id
GROUP BY p.id, p.podcast_name, p.podcast_tagline
ORDER BY p.podcast_name;

-- ============================================
-- Migration Complete!
-- You should see 5 podcasts with 1 config each
-- ============================================

-- OPTIONAL STEP 11: Drop redundant columns from podcast_configs
-- Run this ONLY after confirming the migration worked
-- ALTER TABLE podcast_configs DROP COLUMN IF EXISTS podcast_name;
-- ALTER TABLE podcast_configs DROP COLUMN IF EXISTS podcast_tagline;

-- ROLLBACK (if needed):
-- ALTER TABLE podcast_configs DROP COLUMN podcast_id;
-- DROP TABLE podcasts CASCADE;
