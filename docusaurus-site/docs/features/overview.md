---
id: overview
title: Features Overview
sidebar_label: Overview
sidebar_position: 1
---

# Features Overview

## Core Features

### Agent System

The template includes 9 specialized research agents that analyze, research, and plan without modifying source code directly.

#### codebase-analyser
**Purpose:** Comprehensive code context gathering before implementation

**When to use:**
- Before implementing any new feature
- When debugging complex issues
- To understand existing patterns and dependencies
- Before major refactoring

**Output:** Detailed report analyzing code structure, patterns, dependencies, and architectural decisions

#### code-quality-advisor
**Purpose:** Best practices research and quality standards

**When to use:**
- Before implementing new features (ensure latest practices)
- When reviewing security considerations
- To verify library versions and compatibility
- For maintainability guidance

**Output:** Research report on best practices, security standards, and recommended patterns

#### implementation-planner
**Purpose:** Create detailed step-by-step implementation plans

**When to use:**
- After gathering context from other agents
- For complex multi-step features
- To break down large tasks into manageable phases
- When time estimation is needed

**Output:** Phased implementation plan (MVP → Enhanced → Fully Featured) optimized for solo developers

#### strategic-technology-advisor
**Purpose:** High-level technical decision making and architecture guidance

**When to use:**
- When evaluating technology choices
- For system architecture decisions
- To assess strategic technical roadmap
- When considering major platform changes

**Output:** Strategic analysis with recommendations, trade-offs, and implementation considerations

#### docusaurus-expert
**Purpose:** Documentation site configuration and management

**When to use:**
- Site configuration issues
- Theme customization
- Build troubleshooting
- Deployment setup
- Content management strategies

**Output:** Docusaurus-specific guidance and solutions

#### cloudinary-expert
**Purpose:** Image and video transformation planning

**When to use:**
- Media optimization strategies
- URL generation patterns
- Transformation rule planning
- Integration architecture

**Output:** Cloudinary implementation plan with best practices

#### meta-api-expert
**Purpose:** Meta/Facebook/Instagram API integration

**When to use:**
- Meta API research
- Best practices for FB/IG integration
- Implementation planning for social features
- API version and capability research

**Output:** Meta API integration plan with best practices

#### postgres-schema-reader
**Purpose:** PostgreSQL database analysis (read-only)

**When to use:**
- Schema documentation needed
- Understanding database structure
- Query optimization insights
- Table relationship mapping

**Output:** Complete database schema report with tables, columns, relationships, and constraints

#### supabase-schema-reader
**Purpose:** Supabase production database analysis (read-only)

**When to use:**
- Supabase schema documentation
- RLS policy review
- Table and relationship understanding
- Production database insights

**Output:** Supabase-specific schema report including RLS policies and triggers

### Slash Commands

#### /context-continuity
**Purpose:** Create session handoff documents

**Usage:**
```
/context-continuity
```

**When to use:**
- End of work session
- Before major context shift
- When handing off work to future sessions
- To document current project state

**Output:** Comprehensive session brief at `.claude/docs/tasks/continuity/continuity_session_brief_[timestamp].md`

#### /doc-update
**Purpose:** Update Docusaurus documentation for files

**Usage:**
```
/doc-update
/doc-update src/utils/helpers.js
/doc-update "src/components/*.tsx"
```

**When to use:**
- After implementing features
- When adding new components
- To keep documentation in sync with code

**Output:** Updated documentation files in `docusaurus-site/docs/`

#### /example-command
**Purpose:** Template for creating custom slash commands

**Usage:**
```
/example-command [args]
```

**When to use:**
- As a starting point for new commands
- To understand command structure
- For reference implementation

**Output:** Example output demonstrating command pattern

### Dashboard Features

#### Real-Time Activity Display
- Shows all project activities in chronological order
- Latest updates appear at the top
- Auto-updates within 2-3 seconds of changes
- Responsive design for desktop and mobile

#### Search and Filters
- Full-text search across all activities
- Filter by agent type
- Filter by date range
- Tag-based filtering

#### Report Viewer
- Inline viewing of detailed reports
- Expandable/collapsible entries
- Syntax highlighting for code
- Links to report files

#### Statistics and Analytics
- Total activity count
- Activity by agent type
- Recent activity trends
- Commit frequency

### Context Management

#### Central Changelog
**File:** `.claude/docs/tasks/context.md`

**Format:**
```markdown
### [Title] [Timestamp] - agent-name
**Summary:** Brief description

**Report:** `.claude/docs/tasks/[agent-type]/[filename].md`
```

**Features:**
- Chronological activity log
- Standardized format for Dashboard parsing
- Links to detailed reports
- Git commit integration
- Session continuity support

#### Auto-Sync File Watcher
- Monitors context.md for changes
- Automatically syncs to `static/data/context.md`
- Triggers Dashboard refresh
- Logs to `logs/auto-sync.log`

**Manual sync:**
```bash
cd docusaurus-site
./sync-context-safe.sh
```

#### Format Validation
**Script:** `validate-context-format.sh`

Validates that all changelog entries follow the correct format for Dashboard compatibility.

```bash
./validate-context-format.sh
```

### Time Standardization

#### MCP Time Server Integration
- **Mandatory** for all timestamps
- Consistent timezone (Europe/London)
- Format: `DDMmmYYYY_HHMM`
- Example: `03Oct2025_1430`

**Usage:**
```
mcp__time__get_current_time(timezone="Europe/London")
```

**Never:**
- Use system time or datetime.now()
- Guess timestamps
- Use placeholders

### Git Integration

#### Post-Commit Hook
Automatically logs every commit to context.md

**Information captured:**
- Commit hash (short)
- Commit author
- Commit message (full)
- File change statistics
- Insertions/deletions count

**Format:**
```markdown
### [Commit Title] [Timestamp] - git-commit
**Summary:** Committed by [author] ([hash]) - [N] file(s) changed, [N] insertion(s), [N] deletion(s)

**Commit Message:**
```
[Full commit message]
```
```

**Auto-triggers:** Dashboard update via file watcher

## Workflow Examples

### Implementing a New Feature

1. **Research Phase:**
   ```
   @codebase-analyser - Understand related code
   @code-quality-advisor - Research best practices
   ```

2. **Planning Phase:**
   ```
   @implementation-planner - Create step-by-step plan
   ```

3. **Implementation:**
   - Follow plan systematically
   - Use TodoWrite to track progress
   - Update context.md for major steps

4. **Documentation:**
   ```
   /doc-update [modified files]
   ```

5. **Handoff:**
   ```
   /context-continuity
   ```

### Database Schema Analysis

1. **Analyze Schema:**
   ```
   @postgres-schema-reader
   # or
   @supabase-schema-reader
   ```

2. **Review Report:**
   - Check Dashboard for report link
   - Read detailed schema documentation
   - Identify tables, relationships, constraints

3. **Use Insights:**
   - Reference schema in implementation
   - Optimize queries based on indexes
   - Follow naming conventions

### Architecture Decision

1. **Strategic Review:**
   ```
   @strategic-technology-advisor - Evaluate options
   ```

2. **Implementation Planning:**
   ```
   @implementation-planner - Break down chosen approach
   ```

3. **Document Decision:**
   - Add entry to context.md
   - Link to detailed report
   - Include rationale and trade-offs

## Best Practices

### Agent Usage
- Always use agents for research before implementation
- Run independent agents in parallel for efficiency
- Sequence dependent agents (codebase-analyser → implementation-planner)
- Review agent reports thoroughly before coding

### Context Management
- Update context.md after all significant work
- Follow the exact changelog format
- Validate format before committing: `./validate-context-format.sh`
- Use descriptive titles and summaries

### Documentation
- Keep documentation in sync with code changes
- Use `/doc-update` after features
- Link to agent reports for detailed context
- Update Dashboard regularly

### Time Management
- Use MCP time server exclusively
- Never guess or use placeholders
- Consistent timezone across all timestamps
- Format validation in pre-commit hooks

---

These features work together to create an efficient, well-documented, and traceable development workflow optimized for solo developers.
