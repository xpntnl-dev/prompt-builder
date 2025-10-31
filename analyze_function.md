# Analysis of get_system_prompt_with_metadata Function

## Function Logic Breakdown

```sql
CREATE OR REPLACE FUNCTION public.get_system_prompt_with_metadata(workflow_name_param text)
```

### Step 1: Find Target Version
```sql
SELECT pv.id INTO target_version_id
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
JOIN prompt_versions pv ON pv.prompt_id = p.id
WHERE w.name = workflow_name_param
  AND p.is_active = true
  AND pv.is_published = true
ORDER BY pv.version_number DESC
LIMIT 1;
```

**What this does:**
- Looks for workflow named 'lojong'
- Finds active prompt in that workflow
- Gets latest published version
- Returns the version_id

**Critical Question:** What if there's NO published version?

### Step 2: Error if Not Found
```sql
IF target_version_id IS NULL THEN
  RAISE EXCEPTION 'No published version found for workflow "%"', workflow_name_param;
END IF;
```

**This means:** If no published version exists, the function should ERROR, not return data from elsewhere.

### Step 3: Assemble Prompt
```sql
RETURN QUERY
SELECT
  w.name::TEXT as workflow_name,
  p.name::TEXT as prompt_name,
  pv.version_tag::TEXT as version_tag,
  pv.version_number as version_number,
  pv.model_provider::TEXT as model_provider,
  pv.model_name::TEXT as model_name,
  pv.is_published as is_published,
  -- Assemble sections in order with double newline separator
  STRING_AGG(ps.content, E'\n\n' ORDER BY ps.section_order)::TEXT as prompt_content,
  COUNT(ps.id)::INTEGER as section_count,
  pv.created_at as created_at
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
JOIN prompt_versions pv ON pv.prompt_id = p.id
LEFT JOIN prompt_sections ps ON ps.version_id = pv.id
WHERE pv.id = target_version_id
GROUP BY w.name, p.name, pv.version_tag, pv.version_number,
         pv.model_provider, pv.model_name, pv.is_published, pv.created_at;
```

**Key observation:** `LEFT JOIN prompt_sections` means it will still return a row even if there are NO sections!

## Conclusion: NO FALLBACK LOGIC

The function has:
- ❌ No fallback to other tables
- ❌ No alternative data sources
- ❌ No hardcoded defaults
- ✅ Only uses: workflows → prompts → prompt_versions → prompt_sections

## Possible Explanations for Missing Text

1. **The text isn't in THIS database**
   - Could be in a different Supabase project
   - Could be in a local development database vs production

2. **The text is being injected at runtime**
   - Application code might be adding it
   - Could be in environment variables
   - Might be hardcoded in the frontend

3. **Different function is being called**
   - There might be another version: `get_system_prompt_with_metadata_v2`
   - Or overloaded function with different parameters

4. **Text is in a column we haven't searched**
   - JSONB column?
   - Array column?
   - Different data type?

## Next Steps to Investigate

### 1. Check for JSONB/Array columns
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (data_type = 'jsonb' OR data_type LIKE '%array%')
ORDER BY table_name;
```

### 2. Check for function variants
```sql
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%prompt%'
ORDER BY routine_name;
```

### 3. Test the actual function call
```sql
-- See what it actually returns
SELECT * FROM get_system_prompt_with_metadata('lojong');

-- Check if workflow exists
SELECT * FROM workflows WHERE name = 'lojong';

-- Check if prompt is active
SELECT p.*
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
WHERE w.name = 'lojong';

-- Check if version is published
SELECT pv.*
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
JOIN prompt_versions pv ON pv.prompt_id = p.id
WHERE w.name = 'lojong'
ORDER BY pv.version_number DESC;
```

### 4. Check the actual content
```sql
-- Get the actual sections for lojong
SELECT ps.*, pv.version_tag
FROM workflows w
JOIN prompts p ON p.workflow_id = w.id
JOIN prompt_versions pv ON pv.prompt_id = p.id
JOIN prompt_sections ps ON ps.version_id = pv.id
WHERE w.name = 'lojong'
ORDER BY pv.version_number DESC, ps.section_order;
```
