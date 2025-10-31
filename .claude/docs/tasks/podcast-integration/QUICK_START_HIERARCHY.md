# Podcast Hierarchy - Quick Start Guide

## What Changed?

**Before:** Flat list of configs (confusing)
**After:** Podcasts → Configs (clear hierarchy)

---

## Run This SQL First

```bash
# 1. Open Supabase SQL Editor
# 2. Copy and paste ALL contents from:
.claude/docs/tasks/database/podcasts_hierarchy_schema.sql

# 3. Click "Run"
# 4. Should see verification query showing 5 podcasts with 1 config each
```

---

## Test the UI

```bash
# Start dev server
npm run dev

# Open browser to:
http://localhost:5173/podcasts
```

**You should see:**
- 5 podcasts listed (XPNTNL Insider, Revok Records Radio, etc.)
- Each showing 1 config
- Brand colors displayed
- Card/list view toggle

**Click a podcast:**
- See podcast detail page
- See list of its configurations
- "New Config" button

**Create new config:**
- From podcast detail: Click "New Config" (podcast pre-selected)
- Or go to `/podcasts/configs/new` (select from dropdown)

---

## New URL Structure

```
/podcasts                          → All podcasts (parent level)
/podcasts/{id}                     → One podcast + its configs
/podcasts/{id}/edit                → Edit podcast
/podcasts/new                      → Create podcast

/podcasts/configs/new              → Create config (select podcast)
/podcasts/configs/new?podcast_id=xxx → Create config (pre-selected)
/podcasts/configs/{id}             → Config detail (breadcrumbs show parent)
/podcasts/configs/{id}/edit        → Edit config
```

---

## Database Schema

```sql
-- Parent table
podcasts
  - id (PK)
  - podcast_name
  - podcast_tagline
  - description
  - brand_color
  - default_output_language
  - is_active

-- Child table (updated)
podcast_configs
  - id (PK)
  - podcast_id (FK → podcasts.id) ← NEW!
  - config_name
  - config_type
  - [...all other fields same as before]
```

---

## What to Test

### ✅ Podcasts
1. List shows 5 podcasts
2. Can toggle card/list view
3. Can create new podcast
4. Can edit podcast
5. Can delete podcast (shows warning about configs)

### ✅ Configs
6. Can create config from podcast detail
7. Can create config with dropdown
8. Config pages show correct breadcrumbs
9. All existing features still work

### ✅ Navigation
10. "Podcasts" link goes to list
11. Breadcrumbs show: Podcasts → Podcast Name → Config Name

---

## If Something Goes Wrong

```sql
-- Rollback: Remove new column and table
ALTER TABLE podcast_configs DROP COLUMN podcast_id;
DROP TABLE podcasts CASCADE;
```

Then:
```bash
git revert HEAD
```

---

## Next Steps After Testing

If everything works:

```sql
-- Optional: Clean up redundant columns
ALTER TABLE podcast_configs DROP COLUMN podcast_name;
ALTER TABLE podcast_configs DROP COLUMN podcast_tagline;
ALTER TABLE podcast_configs ALTER COLUMN podcast_id SET NOT NULL;
```

---

## Files to Review

**Key SQL:**
- `.claude/docs/tasks/database/podcasts_hierarchy_schema.sql`

**New Pages:**
- `src/routes/podcasts/+page.svelte` (podcasts list)
- `src/routes/podcasts/[id]/+page.svelte` (podcast detail)
- `src/routes/podcasts/new/+page.svelte` (create podcast)

**Updated Pages:**
- `src/routes/podcasts/configs/new/+page.svelte` (podcast selection added)
- Config detail/edit pages (breadcrumbs updated)

**Navigation:**
- `src/routes/+layout.svelte` (simplified)

---

## Questions?

See detailed documentation:
`.claude/docs/tasks/podcast-integration/HIERARCHY_IMPLEMENTATION.md`
