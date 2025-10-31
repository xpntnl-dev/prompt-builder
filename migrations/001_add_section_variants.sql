-- Migration: Add section variants support
-- Created: 26 October 2025
-- Description: Adds variant_number and is_active_variant columns to prompt_sections
--              with constraint to limit max 5 variants per section

BEGIN;

-- Step 1: Add new columns with defaults
-- All existing sections become variant 1 (active)
ALTER TABLE prompt_sections
  ADD COLUMN variant_number INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN is_active_variant BOOLEAN DEFAULT true NOT NULL;

-- Step 2: Drop old unique constraint
ALTER TABLE prompt_sections
  DROP CONSTRAINT IF EXISTS prompt_sections_version_id_section_order_key;

-- Step 3: Add new unique constraint allowing multiple variants per section_order
ALTER TABLE prompt_sections
  ADD CONSTRAINT prompt_sections_version_order_variant_key
    UNIQUE(version_id, section_order, variant_number);

-- Step 4: Add check constraint to limit max 5 variants per section
-- This prevents creating more than 5 variants for any section position
ALTER TABLE prompt_sections
  ADD CONSTRAINT prompt_sections_max_variants_check
    CHECK (variant_number >= 1 AND variant_number <= 5);

-- Step 5: Add partial index for efficient active variant queries
-- Only indexes rows where is_active_variant = true
CREATE INDEX idx_prompt_sections_active
  ON prompt_sections(version_id, section_order, is_active_variant)
  WHERE is_active_variant = true;

-- Step 6: Add index for variant lookup queries
CREATE INDEX idx_prompt_sections_variants
  ON prompt_sections(version_id, section_order, variant_number);

-- Step 7: Add comment to table explaining new columns
COMMENT ON COLUMN prompt_sections.variant_number IS
  'Variant number (1-5) for this section position. Multiple variants can exist per section_order.';

COMMENT ON COLUMN prompt_sections.is_active_variant IS
  'Indicates if this variant is currently active. Only one variant per section_order can be active.';

COMMIT;

-- Verification query (run after migration)
-- SELECT version_id, section_order, variant_number, is_active_variant, section_name
-- FROM prompt_sections
-- ORDER BY version_id, section_order, variant_number;
