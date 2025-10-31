-- COMPREHENSIVE SEARCH: Find text across ALL tables in the database
-- This query will search every text column in every table for the prompt text

-- Step 1: First, let's see what tables exist with text columns
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type IN ('text', 'character varying', 'varchar', 'USER-DEFINED')
ORDER BY table_name, ordinal_position;

-- Step 2: Search across ALL likely tables
-- (Run this after reviewing Step 1 results)

-- Search available_models
SELECT 'available_models' as source_table, 'model_name' as column_name, model_name as found_in, id, created_at
FROM available_models WHERE model_name ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'available_models', 'provider', provider, id, created_at
FROM available_models WHERE provider ILIKE '%wise and compassionate guide%'

UNION ALL

-- Search workflows
SELECT 'workflows' as source_table, 'name' as column_name, name as found_in, id::text, created_at
FROM workflows WHERE name ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'workflows', 'description', description, id::text, created_at
FROM workflows WHERE description ILIKE '%wise and compassionate guide%'

UNION ALL

-- Search prompts
SELECT 'prompts' as source_table, 'name' as column_name, name as found_in, id::text, created_at
FROM prompts WHERE name ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'prompts', 'description', description, id::text, created_at
FROM prompts WHERE description ILIKE '%wise and compassionate guide%'

UNION ALL

-- Search prompt_versions
SELECT 'prompt_versions' as source_table, 'version_tag' as column_name, version_tag as found_in, id::text, created_at
FROM prompt_versions WHERE version_tag ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'prompt_versions', 'model_provider', model_provider, id::text, created_at
FROM prompt_versions WHERE model_provider ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'prompt_versions', 'model_name', model_name, id::text, created_at
FROM prompt_versions WHERE model_name ILIKE '%wise and compassionate guide%'

UNION ALL

-- Search prompt_sections (main content location)
SELECT 'prompt_sections' as source_table, 'content' as column_name, LEFT(content, 100) as found_in, id::text, created_at
FROM prompt_sections WHERE content ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'prompt_sections', 'section_name', section_name, id::text, created_at
FROM prompt_sections WHERE section_name ILIKE '%wise and compassionate guide%'
UNION ALL
SELECT 'prompt_sections', 'variant_name', variant_name, id::text, created_at
FROM prompt_sections WHERE variant_name ILIKE '%wise and compassionate guide%'

ORDER BY created_at DESC;
