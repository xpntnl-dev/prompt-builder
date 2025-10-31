# [Claude Project Template]

This project uses an Enhanced Claude Code structure with specialized agents and comprehensive context tracking.

## Project Overview

**Description:** [This is a template to put in place the basic essential services, scripts, configurations needed for new claude code projects. A well organised baseline of essential enhancements to claude code that have been developed to suit the way i work and the kinds of projects i work on]

**Repository:** https://github.com/xpntnl-dev/claude-project-template

---

## Working with This Project

### General Approach

**Solo Developer Optimized:**
All solutions and workflows should be designed for quick implementation by a single developer working in a bootstrapped startup.

**Think First:**
Take time to analyze and think through problems thoroughly before coding. Consider alternatives and choose the best option.

**Follow TODO Lists:**
Use the TodoWrite tool to systematically track multi-step complex tasks.

**Clarify Assumptions:**
Check with the project owner to clarify your understanding of their request by paraphrasing it back to them. 
Do not start any work until they confirm your understanding.
come back to them with any questions or clarifications you may have
where there are options present the project owner with a list of A, B, C style options to choose from

**One Step at a Time:**
When proposing solutions requiring user interaction, proceed slowly. Each step should be confirmed before moving to the next.

---

## Agent System

This project includes 9 specialized research agents. **Use agents proactively** for research before implementing features.

###  Available Agents

**codebase-analyser**
- Use BEFORE implementing any feature
- Provides comprehensive context about existing code
- Analyzes patterns, dependencies, and architectural decisions

**code-quality-advisor**
- Use BEFORE implementation
- Ensures latest code practices and correct versions
- Reviews security and maintainability standards

**implementation-planner**
- Takes research output and creates detailed step-by-step plans
- Phases work for solo developer workflow
- Provides time estimates

**strategic-technology-advisor**
- Evaluates technology choices
- Provides architectural guidance
- Assists with strategic technical roadmap planning

**docusaurus-expert**
- Docusaurus site configuration
- Content management and theming
- Build troubleshooting and deployment

**meta-api-expert**
- Meta/Facebook/Instagram API integration
- Best practices research
- Implementation planning

**cloudinary-expert**
- Image and video transformation strategies
- URL generation and optimization
- Integration planning

**postgres-schema-reader**
- PostgreSQL database analysis (read-only)
- Schema documentation
- Query optimization insights

**supabase-schema-reader**
- Supabase production database analysis (read-only)
- RLS policy documentation
- Table and relationship mapping

### Agent Coordination

**READ-ONLY Agents:**
Most agents operate in read-only mode - they analyze and create reports but don't modify source code directly.

**Agent Output:**
- All reports saved to `.claude/docs/tasks/[agent-type]/`
- Referenced in context.md changelog
- Timestamped for easy tracking

**Agent Workflow:**
1. Use specific agent over general-purpose when task matches expertise
2. Run agents in parallel when tasks are independent
3. Sequence agents for dependent tasks (e.g., codebase-analyser → implementation-planner)

---

## Context Management

### Context.md System

All project activities, agent reports, and decisions are tracked in:
`.claude/docs/tasks/context.md`

**This file:**
- Provides project history
- Lists all agent activities (latest at bottom)
- Links to detailed reports
- Enables session handoffs
- Powers the Dashboard

### Context.md Changelog Format

**CRITICAL:** All agents and commands must use this exact format:

```markdown
### [Title] [Timestamp] - agent-name
**Summary:** Brief description of what was done

**Report:** `.claude/docs/tasks/[agent-dir]/[filename].md`
```

**Example:**
```markdown
### Database Schema Analysis [03Oct2025_1430] - postgres-schema-reader
**Summary:** Analyzed production schema, documented 12 tables, identified 3 optimization opportunities.

**Report:** `.claude/docs/tasks/postgres-schema-reader/schema-analysis_03Oct2025_1430.md`
```

**Format Validation:**
Run `./validate-context-format.sh` to check all entries follow the correct format.

---

## Documentation Dashboard

### Accessing the Dashboard

```bash
cd docusaurus-site
npm run dev
```

### Dashboard Features

- **Real-time Updates:** File watcher automatically syncs context.md changes
- **Searchable History:** Filter by agent, search by keywords
- **Report Viewer:** Read detailed reports inline
- **Statistics:** Track agent activity and project progress

### Auto-Sync

The `npm run dev` command starts both:
1. Docusaurus development server 
2. File watcher for automatic context.md sync

**Manual Sync:**
```bash
cd docusaurus-site
./sync-context-safe.sh
```

---

## GitHub Commit Sync

This template includes automatic GitHub commit synchronization to track development activity in Supabase.

### How It Works

The workflow at `.github/workflows/trigger-github-sync.yml` automatically:
- Triggers on every push to `main` branch
- Sends commit data to your Supabase Edge Function
- Syncs ALL your GitHub repositories (not just this one)
- Stores commits in `github_commits` table for tracking

### Setup Requirements

**1. GitHub Repository Secret**

Add `SUPABASE_ANON_KEY` to your repository:
1. Go to: **Repo Settings → Secrets and variables → Actions**
2. Click: **New repository secret**
3. Name: `SUPABASE_ANON_KEY`
4. Value: Your Supabase project's anon/public key

**2. Update Workflow File**

Edit `.github/workflows/trigger-github-sync.yml`:
- Replace `YOUR_PROJECT.supabase.co` with your Supabase project URL
- No other changes needed

### Features

✅ **Real-time Sync** - Triggers immediately on push to main
✅ **Manual Trigger** - Can be run via GitHub Actions UI
✅ **Silent Failure** - Won't break builds if not configured
✅ **Delta Mode** - Only syncs new commits (efficient)

### Finding Your Supabase Keys

**Anon Key:**
- Supabase Dashboard → Settings → API → anon/public key

**Project URL:**
- Supabase Dashboard → Settings → API → Project URL
- Format: `https://xxxxx.supabase.co`

### Troubleshooting

**Workflow not running?**
- Check GitHub Actions tab for errors
- Verify secret is added correctly
- Ensure Supabase URL is updated in workflow

**No commits appearing in Supabase?**
- Verify Edge Function is deployed at `/functions/v1/github-sync`
- Check Edge Function logs in Supabase
- Confirm `github_commits` table exists

---

## Time and Date Standards

**MANDATORY: Use MCP time server for ALL timestamps**

```
mcp__time__get_current_time(timezone="Europe/London")
```

**Format:** `DDMmmYYYY_HHMM`
**Example:** `03Oct2025_1430`

**Never:**
- Use system time or datetime.now()
- Guess timestamps
- Use placeholders

---

## Slash Commands

### /context-continuity

Creates detailed session handoff documents for continuing work later.

**When to use:**
- End of session
- Before major context shift
- When handing off work

**Output:** `.claude/docs/tasks/continuity/continuity_session_brief_[timestamp].md`

### /doc-update

Updates Docusaurus documentation for specified files.

**Usage:**
```
/doc-update
/doc-update src/utils/helpers.js
/doc-update "src/components/*.tsx"
```

### /example-command

Template for creating your own custom slash commands.

---

## Project-Specific Guidelines

[Add your project-specific development guidelines here]

### Code Style

[Define coding standards]

### Testing Strategy

[Define testing approach]

### Deployment Process

[Define deployment workflow]

### Environment Setup

[List required environment variables and setup steps]

---

## Common Workflows

### Starting a New Feature

1. **Research Phase:**
   ```
   @codebase-analyser - Gather context about related code
   @code-quality-advisor - Research best practices for this feature
   ```

2. **Planning Phase:**
   ```
   @implementation-planner - Create step-by-step implementation plan
   ```

3. **Implementation Phase:**
   - Follow the plan systematically
   - Use TodoWrite to track progress
   - Update context.md as you complete major steps

4. **Documentation Phase:**
   ```
   /doc-update [files you created/modified]
   ```

5. **Session Handoff:**
   ```
   /context-continuity
   ```

### Debugging an Issue

1. **Analyze Context:**
   ```
   @codebase-analyser - Understand the code area with the bug
   ```

2. **Review Quality:**
   ```
   @code-quality-advisor - Check for known issues/patterns
   ```

3. **Fix and Document:**
   - Implement fix
   - Update tests
   - Document in context.md

### Architecture Decision

1. **Strategic Review:**
   ```
   @strategic-technology-advisor - Evaluate options and recommend approach
   ```

2. **Plan Implementation:**
   ```
   @implementation-planner - Break down the chosen approach
   ```

3. **Document Decision:**
   - Add entry to context.md
   - Link to detailed report

---

## Important Files

**Configuration:**
- `CLAUDE.md` - This file (project guidelines)
- `.claude/settings.local.json` - Claude Code permissions
- `.claude/agents/` - Agent definitions
- `.claude/commands/` - Slash command definitions

**Context:**
- `.claude/docs/tasks/context.md` - Central activity log
- `.claude/docs/tasks/*/` - Agent report directories

**Documentation:**
- `docusaurus-site/` - Documentation website
- `docs/` - Additional project documentation

**Scripts:**
- `validate-context-format.sh` - Check changelog format
- `docusaurus-site/auto-sync-context.sh` - File watcher
- `docusaurus-site/sync-context-safe.sh` - Manual sync

---

## Troubleshooting

### Dashboard Not Showing Updates

1. Check format: `./validate-context-format.sh`
2. Verify file watcher: `ps aux | grep fswatch`
3. Manual sync: `cd docusaurus-site && ./sync-context-safe.sh`
4. Check logs: `docusaurus-site/logs/auto-sync.log`

### Agent Not Responding

1. Verify agent file exists: `ls .claude/agents/[agent-name].md`
2. Check agent format (valid frontmatter)
3. Restart Claude Code

### MCP Server Issues

1. Check status: `claude mcp list`
2. Verify connection
3. Reinstall if needed

See `docs/TROUBLESHOOTING.md` for detailed solutions.

---

## Best Practices

1. **Always use agents for research** - Don't implement without context
2. **Keep context.md updated** - Document all significant work
3. **Follow the changelog format** - Ensure Dashboard visibility
4. **Use TodoWrite for complex tasks** - Track progress systematically
5. **Run validation before committing** - `./validate-context-format.sh`
6. **Create session handoffs** - `/context-continuity` at end of work
7. **Check Dashboard regularly** - Monitor project progress
8. **Restart Claude Code** - After significant configuration changes

---

## Getting Help


**Claude Code Documentation:**
https://docs.claude.com/en/docs/claude-code

**Project-Specific Help:**
[Add your support channels]

---

**Version:** 6.1.2
**Last Updated:** 06Oct2025
