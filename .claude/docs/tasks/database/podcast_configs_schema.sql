-- ============================================
-- Podcast Configurations Table Schema
-- ============================================
-- Purpose: Store podcast generation configurations for the Podcastfy pipeline
-- Integration: Configs are queried by n8n and sent to Flask API for podcast generation
-- Version: 1.0.0
-- Date: 31 Oct 2025
-- ============================================

-- Create the podcast_configs table
CREATE TABLE IF NOT EXISTS podcast_configs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  config_name TEXT NOT NULL UNIQUE,
  config_type TEXT NOT NULL, -- 'tech_startup', 'music_creative', 'educational', 'storytelling', 'debate', 'custom'
  description TEXT,

  -- LLM Configuration
  llm_provider TEXT, -- 'anthropic', 'openai', 'openrouter'
  llm_model TEXT,
  llm_creativity DECIMAL(2,1) CHECK (llm_creativity >= 0 AND llm_creativity <= 1),

  -- Conversation Settings
  conversation_style JSONB, -- Array of style strings: ["professional", "technical", "engaging"]
  roles_person1 TEXT, -- Role description for speaker 1 (e.g., "expert", "interviewer")
  roles_person2 TEXT, -- Role description for speaker 2 (e.g., "questioner", "clarifier")
  dialogue_structure JSONB, -- Array of section names: ["Introduction", "Main Content", "Conclusion"]

  -- Branding
  podcast_name TEXT,
  podcast_tagline TEXT,
  output_language TEXT DEFAULT 'English',

  -- Engagement
  engagement_techniques JSONB, -- Array of technique strings: ["data points", "case studies"]
  user_instructions TEXT, -- Free-form instructions for LLM

  -- Long-form Settings
  max_num_chunks INTEGER DEFAULT 8,
  min_chunk_size INTEGER DEFAULT 600,

  -- TTS (Text-to-Speech) Configuration
  tts_provider TEXT DEFAULT 'openai', -- 'openai', 'elevenlabs', 'edge', 'gemini'
  voice_person1 TEXT, -- Voice for question/person1 (e.g., "onyx", "echo")
  voice_person2 TEXT, -- Voice for answer/person2 (e.g., "echo", "shimmer")
  tts_model TEXT, -- e.g., "tts-1-hd" for OpenAI
  audio_format TEXT DEFAULT 'mp3',
  ending_message TEXT DEFAULT 'Bye Bye!',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Only one config should be default per config_type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_podcast_configs_type ON podcast_configs(config_type);
CREATE INDEX IF NOT EXISTS idx_podcast_configs_active ON podcast_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_podcast_configs_name ON podcast_configs(config_name);
CREATE INDEX IF NOT EXISTS idx_podcast_configs_default ON podcast_configs(is_default) WHERE is_default = true;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE podcast_configs IS 'Podcast generation configurations for Podcastfy pipeline integration';
COMMENT ON COLUMN podcast_configs.config_name IS 'Unique identifier name (e.g., "zen-revok-content-podcast")';
COMMENT ON COLUMN podcast_configs.config_type IS 'Preset type: tech_startup, music_creative, educational, storytelling, debate, or custom';
COMMENT ON COLUMN podcast_configs.conversation_style IS 'JSON array of style keywords that define the podcast tone';
COMMENT ON COLUMN podcast_configs.engagement_techniques IS 'JSON array of techniques to make podcast engaging';
COMMENT ON COLUMN podcast_configs.dialogue_structure IS 'JSON array defining the sections of the podcast';
COMMENT ON COLUMN podcast_configs.llm_creativity IS 'Temperature/creativity setting from 0.0 (conservative) to 1.0 (maximum creativity)';
COMMENT ON COLUMN podcast_configs.voice_person1 IS 'TTS voice for primary speaker (OpenAI: alloy, echo, fable, onyx, nova, shimmer)';
COMMENT ON COLUMN podcast_configs.voice_person2 IS 'TTS voice for secondary speaker';
COMMENT ON COLUMN podcast_configs.is_default IS 'Whether this is the default config for its config_type';

-- ============================================
-- Trigger for updated_at
-- ============================================

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

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- NOTE: Adjust these policies based on your auth requirements
-- For now, allowing all authenticated users to read/write

ALTER TABLE podcast_configs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all configs
CREATE POLICY "Allow authenticated users to read podcast configs"
  ON podcast_configs
  FOR SELECT
  USING (true);

-- Allow all authenticated users to insert configs
CREATE POLICY "Allow authenticated users to insert podcast configs"
  ON podcast_configs
  FOR INSERT
  WITH CHECK (true);

-- Allow all authenticated users to update configs
CREATE POLICY "Allow authenticated users to update podcast configs"
  ON podcast_configs
  FOR UPDATE
  USING (true);

-- Allow all authenticated users to delete configs
CREATE POLICY "Allow authenticated users to delete podcast configs"
  ON podcast_configs
  FOR DELETE
  USING (true);

-- ============================================
-- Usage Notes
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Then run the seed data from podcast_configs_seed.sql
-- 3. The prompt-builder app will query this table via Supabase client
-- 4. n8n will query this table to inject configs into podcast payloads
-- 5. Flask API (simple_api.py) receives the config and deep merges with base YAML
-- ============================================
