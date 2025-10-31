-- Rollback: Remove section variants support
-- Created: 26 October 2025
-- Description: Rolls back variant_number and is_active_variant columns
--              WARNING: This will delete all non-active variants!

BEGIN;

-- Step 1: Delete all non-active variants (keep only active ones)
-- This prevents data loss by keeping the active variant for each section
DELETE FROM prompt_sections
WHERE is_active_variant = false;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS idx_prompt_sections_active;
DROP INDEX IF EXISTS idx_prompt_sections_variants;

-- Step 3: Drop constraints
ALTER TABLE prompt_sections
  DROP CONSTRAINT IF EXISTS prompt_sections_max_variants_check;

ALTER TABLE prompt_sections
  DROP CONSTRAINT IF EXISTS prompt_sections_version_order_variant_key;

-- Step 4: Restore original unique constraint
ALTER TABLE prompt_sections
  ADD CONSTRAINT prompt_sections_version_id_section_order_key
    UNIQUE(version_id, section_order);

-- Step 5: Drop columns
ALTER TABLE prompt_sections
  DROP COLUMN IF EXISTS variant_number,
  DROP COLUMN IF EXISTS is_active_variant;

COMMIT;

-- Verification query (run after rollback)
-- SELECT version_id, section_order, section_name
-- FROM prompt_sections
-- ORDER BY version_id, section_order;
