# Context.md Changelog Format Guide

**Purpose:** Ensure all agent and command outputs appear correctly in the Dashboard

**Location:** `.claude/docs/tasks/context.md`

---

## Required Format

The Dashboard parser requires this EXACT format for changelog entries:

```markdown
### [Title] [Timestamp] - agent-or-command-name
**Summary:** Brief description (optional but recommended)

**Report:** `.claude/docs/tasks/[directory]/[filename].md` (optional)
```

---

## Format Breakdown

### Header Line

```
### [Title] [Timestamp] - agent-name
```

**Components:**
1. **`###`** - Exactly 3 hash marks (level-3 header)
2. **`[Title]`** - Descriptive title (no brackets in actual text)
3. **`[Timestamp]`** - Format: `[DDMmmYYYY_HHMM]`
4. **` - `** - Space, hyphen, space
5. **`agent-name`** - Lowercase, hyphenated identifier

**Order Matters:**
- Title must come FIRST
- Timestamp in brackets comes SECOND
- Agent name comes LAST (after hyphen)

---

## Timestamp Format

**Pattern:** `[DDMmmYYYY_HHMM]`

**Example:** `[03Oct2025_1430]`

**Breakdown:**
- `DD` - Two-digit day (01-31)
- `Mmm` - Three-letter month (Jan, Feb, Mar, etc.)
- `YYYY` - Four-digit year
- `_` - Underscore separator
- `HHMM` - 24-hour time (0000-2359)

**Getting Timestamps:**
Always use the MCP time server:
```
mcp__time__get_current_time(timezone="Europe/London")
```

**Never:**
- Use system time
- Guess the time
- Use placeholders like `[TIMESTAMP]`

---

## Agent/Command Names

**Format:** lowercase with hyphens

**Valid Examples:**
- `codebase-analyser`
- `code-quality-advisor`
- `implementation-planner`
- `context-continuity`
- `doc-update`

**Invalid Examples:**
- `Codebase Analyser` (spaces, capitalized)
- `codebase_analyser` (underscores)
- `CODEBASE-ANALYSER` (all caps)

---

## Complete Examples

### Minimal (No Summary or Report)

```markdown
### Initial Project Setup [03Oct2025_1200] - setup
```

### With Summary

```markdown
### Database Schema Analysis [03Oct2025_1430] - postgres-schema-reader
**Summary:** Analyzed production schema, documented 12 tables with relationships, identified 3 optimization opportunities.
```

### With Summary and Report

```markdown
### OAuth Integration Research [03Oct2025_1545] - meta-api-expert
**Summary:** Researched Meta OAuth 2.0 flow, documented required scopes and permissions, created implementation checklist.

**Report:** `.claude/docs/tasks/meta-api-expert/oauth-integration-research_03Oct2025_1545.md`
```

### Session Handoff

```markdown
### Session Handoff - Authentication Feature [03Oct2025_1700] - context-continuity
**Summary:** Created detailed continuity brief for OAuth2 implementation. Documented 8 completed components, 3 pending tasks, and critical integration patterns.

**Report:** `.claude/docs/tasks/continuity/continuity_session_brief_03Oct2025_1700.md`
```

---

## Common Mistakes

### ❌ Timestamp Before Title

**Wrong:**
```markdown
### [03Oct2025_1430] Initial Setup - setup
```

**Correct:**
```markdown
### Initial Setup [03Oct2025_1430] - setup
```

### ❌ Wrong Timestamp Format

**Wrong:**
```markdown
### Analysis [2025-10-03 14:30] - codebase-analyser
### Analysis [03/10/2025_1430] - codebase-analyser
### Analysis [Oct032025_1430] - codebase-analyser
```

**Correct:**
```markdown
### Analysis [03Oct2025_1430] - codebase-analyser
```

### ❌ Agent Name Formatting

**Wrong:**
```markdown
### Analysis [03Oct2025_1430] - Codebase Analyser
### Analysis [03Oct2025_1430] - codebase_analyser
### Analysis [03Oct2025_1430] - agent: codebase-analyser
```

**Correct:**
```markdown
### Analysis [03Oct2025_1430] - codebase-analyser
```

### ❌ Missing Hyphen

**Wrong:**
```markdown
### Analysis [03Oct2025_1430] codebase-analyser
```

**Correct:**
```markdown
### Analysis [03Oct2025_1430] - codebase-analyser
```

---

## Validation

### Automatic Validation

Run the validation script to check all entries:

```bash
./validate-context-format.sh
```

**Output:**
- ✓ Lists all valid entries
- ✗ Highlights invalid entries
- Provides specific error messages
- Suggests corrections

### Manual Validation

Check each entry matches this regex pattern:

```regex
^### .+ \[[0-9]{2}[A-Z][a-z]{2}[0-9]{4}_[0-9]{4}\] - [a-z-]+$
```

**Pattern breakdown:**
- `^###` - Starts with 3 hashes
- ` .+ ` - Title (at least one character)
- `\[[0-9]{2}` - Opening bracket + 2 digits (day)
- `[A-Z][a-z]{2}` - 3-letter month (capitalized)
- `[0-9]{4}` - 4 digits (year)
- `_[0-9]{4}\]` - Underscore + 4 digits (time) + closing bracket
- ` - ` - Space, hyphen, space
- `[a-z-]+$` - Lowercase letters and hyphens (agent name)

---

## Dashboard Integration

### How It Works

1. **File Watcher** monitors `.claude/docs/tasks/context.md`
2. **Auto-Sync** copies to `docusaurus-site/static/data/context.md`
3. **Parser** (`contextParser.ts`) reads and validates entries
4. **Dashboard** displays validated entries in real-time

### What Gets Displayed

**For Each Valid Entry:**
- Title
- Timestamp (formatted for readability)
- Agent/command name (with color coding)
- Summary (if provided)
- Link to detailed report (if provided)

**Invalid Entries:**
- Not displayed in Dashboard
- Must be fixed before they appear
- Run validation script to identify issues

---

## Agent-Specific Directories

Each agent saves reports to its own directory:

| Agent/Command | Directory |
|---------------|-----------|
| codebase-analyser | `.claude/docs/tasks/codebase-analyser/` |
| code-quality-advisor | `.claude/docs/tasks/code-quality-advisor/` |
| implementation-planner | `.claude/docs/tasks/implementation-planner/` |
| docusaurus-expert | `.claude/docs/tasks/docusaurus-expert/` |
| strategic-technology-advisor | `.claude/docs/tasks/strategic-technology-advisor/` |
| cloudinary-expert | `.claude/docs/tasks/cloudinary-expert/` |
| meta-api-expert | `.claude/docs/tasks/meta-api-expert/` |
| postgres-schema-reader | `.claude/docs/tasks/postgres-schema-reader/` |
| supabase-schema-reader | `.claude/docs/tasks/supabase-schema-reader/` |
| context-continuity | `.claude/docs/tasks/continuity/` |
| doc-update | `.claude/docs/tasks/docusaurus-expert/` |
| other commands | `.claude/docs/tasks/miscellaneous/` |

---

## Best Practices

1. **Always include Summary** - Helps understand changes without reading full report
2. **Link to Report** - Provides path to detailed analysis
3. **Use descriptive titles** - "Auth System Analysis" not just "Analysis"
4. **Validate before committing** - Run `./validate-context-format.sh`
5. **Keep entries concise** - Summary should be 1-2 sentences
6. **Use MCP time server** - Ensures consistent timestamps
7. **Test Dashboard** - Verify entry appears after adding

---

## Troubleshooting

### Entry Not Appearing in Dashboard

**Check:**
1. Format matches exactly (run validation script)
2. File watcher is running (`ps aux | grep fswatch`)
3. Sync completed successfully
4. No typos in agent name
5. Timestamp format is correct

**Fix:**
1. Run `./validate-context-format.sh`
2. Fix any highlighted errors
3. Save file
4. Wait 2-3 seconds for auto-sync
5. Refresh Dashboard

### Validation Script Errors

**Common Issues:**
- Timestamp in wrong position (before title)
- Wrong timestamp format (check DDMmmYYYY_HHMM)
- Agent name has spaces or capitals
- Missing hyphen before agent name
- Using `**Agent:**` on separate line (old format)

---

## Template

Copy this template for new entries:

```markdown
### [Your Title Here] [DDMmmYYYY_HHMM] - agent-name
**Summary:** Brief description of what was accomplished (1-2 sentences).

**Report:** `.claude/docs/tasks/[directory]/[filename]_[timestamp].md`
```

**Replace:**
- `[Your Title Here]` - Descriptive title
- `[DDMmmYYYY_HHMM]` - Actual timestamp from MCP server
- `agent-name` - Lowercase, hyphenated agent/command identifier
- `[directory]` - Agent-specific directory
- `[filename]` - Descriptive filename
- `[timestamp]` - Same timestamp as in header

---

**Version:** 4.0.0
**Last Updated:** [TIMESTAMP]
