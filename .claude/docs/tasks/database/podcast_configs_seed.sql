-- ============================================
-- Podcast Configurations - Seed Data
-- ============================================
-- Purpose: Insert 5 preset podcast configurations
-- Source: Based on inject-podcast-config.js from podcastfy-zeebotsage
-- Version: 1.0.0
-- Date: 31 Oct 2025
-- ============================================

-- ============================================
-- 1. Tech Startup / Professional Podcast
-- ============================================
INSERT INTO podcast_configs (
  config_name,
  config_type,
  description,
  llm_provider,
  llm_model,
  llm_creativity,
  conversation_style,
  roles_person1,
  roles_person2,
  dialogue_structure,
  podcast_name,
  podcast_tagline,
  output_language,
  engagement_techniques,
  user_instructions,
  max_num_chunks,
  min_chunk_size,
  tts_provider,
  voice_person1,
  voice_person2,
  tts_model,
  audio_format,
  ending_message,
  is_active,
  is_default
) VALUES (
  'zen-revok-content-podcast',
  'tech_startup',
  'Professional tech-focused podcast for startup and business content',
  'openrouter',
  'anthropic/claude-haiku-4.5',
  0.7,
  '["professional", "technical", "engaging", "analytical"]'::jsonb,
  'industry expert analyst',
  'founder interviewer',
  '["Introduction", "Problem Statement", "Solution Analysis", "Real-World Examples", "Actionable Takeaways", "Conclusion"]'::jsonb,
  'XPNTNL Insider',
  'Tech strategies for indie music labels',
  'English',
  '["data points", "case studies", "actionable insights", "pragmatic recommendations"]'::jsonb,
  'Focus on practical, actionable insights for indie music labels and tech startups. Keep it professional but accessible.',
  8,
  600,
  'openai',
  'onyx',
  'echo',
  'tts-1-hd',
  'mp3',
  'Thanks for tuning in to XPNTNL Insider!',
  true,
  true
);

-- ============================================
-- 2. Music Creative / Enthusiastic Podcast
-- ============================================
INSERT INTO podcast_configs (
  config_name,
  config_type,
  description,
  llm_provider,
  llm_model,
  llm_creativity,
  conversation_style,
  roles_person1,
  roles_person2,
  dialogue_structure,
  podcast_name,
  podcast_tagline,
  output_language,
  engagement_techniques,
  user_instructions,
  max_num_chunks,
  min_chunk_size,
  tts_provider,
  voice_person1,
  voice_person2,
  tts_model,
  audio_format,
  ending_message,
  is_active,
  is_default
) VALUES (
  'revok-records-radio',
  'music_creative',
  'High-energy podcast for electronic music production and creative content',
  'openrouter',
  'anthropic/claude-haiku-4.5',
  0.9,
  '["enthusiastic", "fast-paced", "entertaining", "creative"]'::jsonb,
  'main enthusiastic summarizer',
  'enthusiastic questioner',
  '["Hook", "Big Idea", "Creative Techniques", "Production Tips", "Sound Examples Discussion", "Wrap-up"]'::jsonb,
  'Revok Records Radio',
  'Electronic music production insights',
  'English',
  '["tension injection", "contrarian positioning", "rhetorical questions", "producer war stories"]'::jsonb,
  'Keep it energetic and producer-focused. Talk about music production, electronic music, and creative techniques. Use industry jargon naturally.',
  8,
  600,
  'openai',
  'echo',
  'shimmer',
  'tts-1-hd',
  'mp3',
  'Keep making that music!',
  true,
  false
);

-- ============================================
-- 3. Educational / Tutorial Podcast
-- ============================================
INSERT INTO podcast_configs (
  config_name,
  config_type,
  description,
  llm_provider,
  llm_model,
  llm_creativity,
  conversation_style,
  roles_person1,
  roles_person2,
  dialogue_structure,
  podcast_name,
  podcast_tagline,
  output_language,
  engagement_techniques,
  user_instructions,
  max_num_chunks,
  min_chunk_size,
  tts_provider,
  voice_person1,
  voice_person2,
  tts_model,
  audio_format,
  ending_message,
  is_active,
  is_default
) VALUES (
  'learning-lab-podcast',
  'educational',
  'Clear, structured educational podcast for tutorials and how-to content',
  'openrouter',
  'anthropic/claude-haiku-4.5',
  0.5,
  '["educational", "clear", "structured", "patient"]'::jsonb,
  'teacher',
  'curious student',
  '["Learning Objectives", "Core Concepts", "Step-by-Step Walkthrough", "Common Mistakes", "Practice Tips", "Summary"]'::jsonb,
  'Learning Lab',
  'Making complex topics simple',
  'English',
  '["clear examples", "analogies", "step-by-step breakdowns", "recap summaries"]'::jsonb,
  'Explain concepts clearly and methodically. Break down complex topics into digestible pieces. Use analogies and real-world examples.',
  8,
  600,
  'openai',
  'echo',
  'nova',
  'tts-1-hd',
  'mp3',
  'Keep learning!',
  true,
  false
);

-- ============================================
-- 4. Storytelling / Narrative Podcast
-- ============================================
INSERT INTO podcast_configs (
  config_name,
  config_type,
  description,
  llm_provider,
  llm_model,
  llm_creativity,
  conversation_style,
  roles_person1,
  roles_person2,
  dialogue_structure,
  podcast_name,
  podcast_tagline,
  output_language,
  engagement_techniques,
  user_instructions,
  max_num_chunks,
  min_chunk_size,
  tts_provider,
  voice_person1,
  voice_person2,
  tts_model,
  audio_format,
  ending_message,
  is_active,
  is_default
) VALUES (
  'behind-the-scenes-stories',
  'storytelling',
  'Dramatic, engaging podcast for narrative and behind-the-scenes content',
  'openrouter',
  'anthropic/claude-haiku-4.5',
  0.85,
  '["storytelling", "dramatic", "engaging", "immersive"]'::jsonb,
  'narrator storyteller',
  'curious investigator',
  '["The Setup", "Rising Action", "The Turning Point", "Behind the Scenes", "The Resolution", "Reflections"]'::jsonb,
  'Behind the Curtain',
  'Stories from the inside',
  'English',
  '["vivid descriptions", "emotional hooks", "suspense building", "character development"]'::jsonb,
  'Tell the story with drama and flair. Build suspense, use vivid details, and make listeners feel like they are there.',
  8,
  600,
  'openai',
  'fable',
  'onyx',
  'tts-1-hd',
  'mp3',
  'Until next time, keep uncovering the stories!',
  true,
  false
);

-- ============================================
-- 5. Debate / Analysis Podcast
-- ============================================
INSERT INTO podcast_configs (
  config_name,
  config_type,
  description,
  llm_provider,
  llm_model,
  llm_creativity,
  conversation_style,
  roles_person1,
  roles_person2,
  dialogue_structure,
  podcast_name,
  podcast_tagline,
  output_language,
  engagement_techniques,
  user_instructions,
  max_num_chunks,
  min_chunk_size,
  tts_provider,
  voice_person1,
  voice_person2,
  tts_model,
  audio_format,
  ending_message,
  is_active,
  is_default
) VALUES (
  'perspectives-debate-podcast',
  'debate',
  'Balanced, analytical podcast for discussion and debate content',
  'openrouter',
  'anthropic/claude-haiku-4.5',
  0.6,
  '["analytical", "balanced", "thought-provoking", "respectful"]'::jsonb,
  'proponent analyst',
  'skeptical counterpoint',
  '["Topic Introduction", "Argument For", "Argument Against", "Evidence Review", "Common Ground", "Final Thoughts"]'::jsonb,
  'Perspectives',
  'Exploring both sides of the story',
  'English',
  '["pros and cons analysis", "evidence citation", "devil''s advocate questions", "counterpoint exploration"]'::jsonb,
  'Present multiple viewpoints fairly and analytically. Challenge assumptions and explore nuance. Balance passion with reason.',
  8,
  600,
  'openai',
  'echo',
  'onyx',
  'tts-1-hd',
  'mp3',
  'Thanks for exploring perspectives with us!',
  true,
  false
);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify all configs were inserted successfully:
-- SELECT config_name, config_type, podcast_name, voice_person1, voice_person2, is_default
-- FROM podcast_configs
-- ORDER BY config_type;

-- ============================================
-- Usage Notes
-- ============================================
-- 1. Run podcast_configs_schema.sql FIRST
-- 2. Then run this seed data SQL
-- 3. The "zen-revok-content-podcast" is marked as default for tech_startup type
-- 4. All configs use OpenAI TTS with different voice pairings
-- 5. All configs use Claude Haiku 4.5 via OpenRouter for LLM
-- 6. Creativity levels vary from 0.5 (educational) to 0.9 (music creative)
-- ============================================
