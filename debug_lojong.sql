-- COMPREHENSIVE DEBUG: Find where "lojong" prompt data is coming from

-- Test 1: Does the function work at all?
SELECT 'TEST 1: Function call result' as test;
SELECT * FROM get_system_prompt_with_metadata('lojong');

-- Test 2: Does workflow exist?
SELECT 'TEST 2: Workflow existence' as test;
SELECT * FROM workflows WHERE name = 'lojong';

-- Test 3: Are there prompts for this workflow?
SELECT 'TEST 3: Prompts in lojong workflow' as test;
SELECT p.*
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
WHERE w.name = 'lojong';

-- Test 4: Are there published versions?
SELECT 'TEST 4: Published versions' as test;
SELECT pv.*
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
JOIN prompt_versions pv ON pv.prompt_id = p.id
WHERE w.name = 'lojong'
  AND pv.is_published = true
ORDER BY pv.version_number DESC;

-- Test 5: What's in the sections?
SELECT 'TEST 5: Actual section content' as test;
SELECT
  ps.section_name,
  ps.section_order,
  LEFT(ps.content, 200) as content_preview,
  LENGTH(ps.content) as content_length,
  ps.variant_name,
  pv.version_tag
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
JOIN prompt_versions pv ON pv.prompt_id = p.id
JOIN prompt_sections ps ON ps.version_id = pv.id
WHERE w.name = 'lojong'
  AND pv.is_published = true
ORDER BY pv.version_number DESC, ps.section_order;

-- Test 6: Check for JSONB columns with the text
SELECT 'TEST 6: JSONB column search' as test;
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'jsonb';

-- Test 7: Search ALL functions for this text
SELECT 'TEST 7: Functions containing our text' as test;
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND lower(routine_definition) LIKE '%wise and compassionate%';
