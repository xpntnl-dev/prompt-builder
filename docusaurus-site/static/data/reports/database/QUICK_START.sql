-- ============================================
-- PODCAST CONFIGS - QUICK START
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This will create the table, indexes, and seed 5 configs
-- ============================================

-- STEP 1: Create table
CREATE TABLE IF NOT EXISTS podcast_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name TEXT NOT NULL UNIQUE,
  config_type TEXT NOT NULL,
  description TEXT,
  llm_provider TEXT,
  llm_model TEXT,
  llm_creativity DECIMAL(2,1) CHECK (llm_creativity >= 0 AND llm_creativity <= 1),
  conversation_style JSONB,
  roles_person1 TEXT,
  roles_person2 TEXT,
  dialogue_structure JSONB,
  podcast_name TEXT,
  podcast_tagline TEXT,
  output_language TEXT DEFAULT 'English',
  engagement_techniques JSONB,
  user_instructions TEXT,
  max_num_chunks INTEGER DEFAULT 8,
  min_chunk_size INTEGER DEFAULT 600,
  tts_provider TEXT DEFAULT 'openai',
  voice_person1 TEXT,
  voice_person2 TEXT,
  tts_model TEXT,
  audio_format TEXT DEFAULT 'mp3',
  ending_message TEXT DEFAULT 'Bye Bye!',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_podcast_configs_type ON podcast_configs(config_type);
CREATE INDEX IF NOT EXISTS idx_podcast_configs_active ON podcast_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_podcast_configs_name ON podcast_configs(config_name);
CREATE INDEX IF NOT EXISTS idx_podcast_configs_default ON podcast_configs(is_default) WHERE is_default = true;

-- STEP 3: Create update trigger
CREATE OR REPLACE FUNCTION update_podcast_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER podcast_configs_updated_at
  BEFORE UPDATE ON podcast_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_podcast_configs_updated_at();

-- STEP 4: Enable RLS
ALTER TABLE podcast_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on podcast configs" ON podcast_configs FOR ALL USING (true);

-- STEP 5: Insert seed data (5 configs)

-- Config 1: Tech Startup (zen-revok-content-podcast)
INSERT INTO podcast_configs (
  config_name, config_type, description,
  llm_provider, llm_model, llm_creativity,
  conversation_style, roles_person1, roles_person2,
  dialogue_structure,
  podcast_name, podcast_tagline, output_language,
  engagement_techniques, user_instructions,
  tts_provider, voice_person1, voice_person2, tts_model,
  ending_message, is_active, is_default
) VALUES (
  'zen-revok-content-podcast',
  'tech_startup',
  'Professional tech-focused podcast for startup and business content',
  'openrouter', 'anthropic/claude-haiku-4.5', 0.7,
  '["professional", "technical", "engaging", "analytical"]'::jsonb,
  'industry expert analyst', 'founder interviewer',
  '["Introduction", "Problem Statement", "Solution Analysis", "Real-World Examples", "Actionable Takeaways", "Conclusion"]'::jsonb,
  'XPNTNL Insider', 'Tech strategies for indie music labels', 'English',
  '["data points", "case studies", "actionable insights", "pragmatic recommendations"]'::jsonb,
  'Focus on practical, actionable insights for indie music labels and tech startups. Keep it professional but accessible.',
  'openai', 'onyx', 'echo', 'tts-1-hd',
  'Thanks for tuning in to XPNTNL Insider!', true, true
);

-- Config 2: Music Creative
INSERT INTO podcast_configs (
  config_name, config_type, description,
  llm_provider, llm_model, llm_creativity,
  conversation_style, roles_person1, roles_person2,
  dialogue_structure,
  podcast_name, podcast_tagline, output_language,
  engagement_techniques, user_instructions,
  tts_provider, voice_person1, voice_person2, tts_model,
  ending_message, is_active, is_default
) VALUES (
  'revok-records-radio',
  'music_creative',
  'High-energy podcast for electronic music production and creative content',
  'openrouter', 'anthropic/claude-haiku-4.5', 0.9,
  '["enthusiastic", "fast-paced", "entertaining", "creative"]'::jsonb,
  'main enthusiastic summarizer', 'enthusiastic questioner',
  '["Hook", "Big Idea", "Creative Techniques", "Production Tips", "Sound Examples Discussion", "Wrap-up"]'::jsonb,
  'Revok Records Radio', 'Electronic music production insights', 'English',
  '["tension injection", "contrarian positioning", "rhetorical questions", "producer war stories"]'::jsonb,
  'Keep it energetic and producer-focused. Talk about music production, electronic music, and creative techniques. Use industry jargon naturally.',
  'openai', 'echo', 'shimmer', 'tts-1-hd',
  'Keep making that music!', true, false
);

-- Config 3: Educational
INSERT INTO podcast_configs (
  config_name, config_type, description,
  llm_provider, llm_model, llm_creativity,
  conversation_style, roles_person1, roles_person2,
  dialogue_structure,
  podcast_name, podcast_tagline, output_language,
  engagement_techniques, user_instructions,
  tts_provider, voice_person1, voice_person2, tts_model,
  ending_message, is_active, is_default
) VALUES (
  'learning-lab-podcast',
  'educational',
  'Clear, structured educational podcast for tutorials and how-to content',
  'openrouter', 'anthropic/claude-haiku-4.5', 0.5,
  '["educational", "clear", "structured", "patient"]'::jsonb,
  'teacher', 'curious student',
  '["Learning Objectives", "Core Concepts", "Step-by-Step Walkthrough", "Common Mistakes", "Practice Tips", "Summary"]'::jsonb,
  'Learning Lab', 'Making complex topics simple', 'English',
  '["clear examples", "analogies", "step-by-step breakdowns", "recap summaries"]'::jsonb,
  'Explain concepts clearly and methodically. Break down complex topics into digestible pieces. Use analogies and real-world examples.',
  'openai', 'echo', 'nova', 'tts-1-hd',
  'Keep learning!', true, false
);

-- Config 4: Storytelling
INSERT INTO podcast_configs (
  config_name, config_type, description,
  llm_provider, llm_model, llm_creativity,
  conversation_style, roles_person1, roles_person2,
  dialogue_structure,
  podcast_name, podcast_tagline, output_language,
  engagement_techniques, user_instructions,
  tts_provider, voice_person1, voice_person2, tts_model,
  ending_message, is_active, is_default
) VALUES (
  'behind-the-scenes-stories',
  'storytelling',
  'Dramatic, engaging podcast for narrative and behind-the-scenes content',
  'openrouter', 'anthropic/claude-haiku-4.5', 0.85,
  '["storytelling", "dramatic", "engaging", "immersive"]'::jsonb,
  'narrator storyteller', 'curious investigator',
  '["The Setup", "Rising Action", "The Turning Point", "Behind the Scenes", "The Resolution", "Reflections"]'::jsonb,
  'Behind the Curtain', 'Stories from the inside', 'English',
  '["vivid descriptions", "emotional hooks", "suspense building", "character development"]'::jsonb,
  'Tell the story with drama and flair. Build suspense, use vivid details, and make listeners feel like they are there.',
  'openai', 'fable', 'onyx', 'tts-1-hd',
  'Until next time, keep uncovering the stories!', true, false
);

-- Config 5: Debate
INSERT INTO podcast_configs (
  config_name, config_type, description,
  llm_provider, llm_model, llm_creativity,
  conversation_style, roles_person1, roles_person2,
  dialogue_structure,
  podcast_name, podcast_tagline, output_language,
  engagement_techniques, user_instructions,
  tts_provider, voice_person1, voice_person2, tts_model,
  ending_message, is_active, is_default
) VALUES (
  'perspectives-debate-podcast',
  'debate',
  'Balanced, analytical podcast for discussion and debate content',
  'openrouter', 'anthropic/claude-haiku-4.5', 0.6,
  '["analytical", "balanced", "thought-provoking", "respectful"]'::jsonb,
  'proponent analyst', 'skeptical counterpoint',
  '["Topic Introduction", "Argument For", "Argument Against", "Evidence Review", "Common Ground", "Final Thoughts"]'::jsonb,
  'Perspectives', 'Exploring both sides of the story', 'English',
  '["pros and cons analysis", "evidence citation", "devil''s advocate questions", "counterpoint exploration"]'::jsonb,
  'Present multiple viewpoints fairly and analytically. Challenge assumptions and explore nuance. Balance passion with reason.',
  'openai', 'echo', 'onyx', 'tts-1-hd',
  'Thanks for exploring perspectives with us!', true, false
);

-- STEP 6: Verify installation
SELECT
  config_name,
  config_type,
  podcast_name,
  voice_person1 || ' / ' || voice_person2 as voices,
  is_active,
  is_default
FROM podcast_configs
ORDER BY config_type;

-- ============================================
-- Installation Complete!
-- You should see 5 configs listed above
-- zen-revok-content-podcast should be marked as default
-- ============================================
