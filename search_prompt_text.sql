-- Search for prompt text across all relevant tables in the database
-- Looking for: "You are a wise and compassionate guide specializing in sharing uplifting teachings about"

-- Search in prompt_sections (current active table)
SELECT
  'prompt_sections' as table_name,
  id,
  version_id,
  section_name,
  LEFT(content, 100) as content_preview,
  section_order,
  created_at
FROM prompt_sections
WHERE content ILIKE '%You are a wise and compassionate guide specializing in sharing uplifting teachings about%'

UNION ALL

-- Search in prompt_versions (in case content is stored there)
SELECT
  'prompt_versions' as table_name,
  id::text,
  prompt_id::text as version_id,
  version_tag as section_name,
  NULL as content_preview,
  version_number as section_order,
  created_at
FROM prompt_versions
WHERE version_tag ILIKE '%You are a wise and compassionate guide%'
   OR model_provider ILIKE '%You are a wise and compassionate guide%'
   OR model_name ILIKE '%You are a wise and compassionate guide%'

UNION ALL

-- Search in prompts table
SELECT
  'prompts' as table_name,
  id::text,
  workflow_id::text as version_id,
  name as section_name,
  description as content_preview,
  NULL as section_order,
  created_at
FROM prompts
WHERE name ILIKE '%You are a wise and compassionate guide%'
   OR description ILIKE '%You are a wise and compassionate guide%'

UNION ALL

-- Search in workflows table
SELECT
  'workflows' as table_name,
  id::text,
  NULL as version_id,
  name as section_name,
  description as content_preview,
  NULL as section_order,
  created_at
FROM workflows
WHERE name ILIKE '%You are a wise and compassionate guide%'
   OR description ILIKE '%You are a wise and compassionate guide%'

ORDER BY created_at DESC;

-- If you had a discarded/archived prompts table, add it here:
-- Uncomment and modify if the table exists

/*
UNION ALL

SELECT
  'archived_prompts' as table_name,
  id::text,
  NULL as version_id,
  title as section_name,
  LEFT(content, 100) as content_preview,
  NULL as section_order,
  created_at
FROM archived_prompts
WHERE content ILIKE '%You are a wise and compassionate guide%'
   OR title ILIKE '%You are a wise and compassionate guide%'
*/
