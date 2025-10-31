---
id: getting-started
title: Development Getting Started
sidebar_label: Getting Started
sidebar_position: 1
---

# Development Getting Started

## Quick Start

### Prerequisites

Before using this template, ensure you have:

- **Node.js**: >= 20.0 (strict requirement)
- **npm**: Latest version (comes with Node.js)
- **Git**: For version control
- **Claude Code**: Anthropic's CLI for Claude
- **fswatch**: For file watching (install via Homebrew on macOS)

**Check versions:**
```bash
node --version  # Should be >= 20.0
npm --version
git --version
claude --version
fswatch --version
```

**Install missing tools:**
```bash
# macOS
brew install node@20
brew install fswatch

# Verify Claude Code is installed
claude --help
```

### Installation

1. **Clone or use the template:**
   ```bash
   # If creating from template
   git clone <template-repo-url> my-project
   cd my-project
   ```

2. **Install Docusaurus dependencies:**
   ```bash
   cd docusaurus-site
   npm install
   ```

3. **Verify MCP servers:**
   ```bash
   claude mcp list
   ```

   You should see:
   - ✅ `time` (mandatory)
   - ✅ `context7` (recommended)

4. **Configure project:**
   - Update `CLAUDE.md` with project-specific details
   - Update `docusaurus-site/docusaurus.config.ts` with project name/description
   - Configure agent files in `.claude/agents/` if needed

5. **Start development server:**
   ```bash
   cd docusaurus-site
   npm run dev
   ```

   Navigate to http://localhost:3000 (or configured port)

## Development Workflow

### Before Implementing a Feature

**Step 1: Use Agents for Research**

```
@codebase-analyser

Please analyze the existing code related to [feature area] to understand current patterns and dependencies.
```

```
@code-quality-advisor

Research best practices for implementing [feature] using [technology/library].
```

**Step 2: Create Implementation Plan**

```
@implementation-planner

Based on the codebase analysis and best practices research, create a detailed implementation plan for [feature] with MVP, Enhanced, and Fully Featured phases.
```

**Step 3: Track Tasks**

Use TodoWrite to track implementation steps:
```
// Claude will create todo list
// Mark tasks as in_progress → completed as you work
```

### During Implementation

1. **Follow the plan systematically**
   - Implement one phase at a time
   - Test after each phase
   - Update context.md after major steps

2. **Update context.md regularly**

   After significant work, add an entry:
   ```markdown
   ### [Feature Name] Implementation [Timestamp] - manual
   **Summary:** Implemented [description of work]

   **Details:** [Brief explanation or link to commit]
   ```

3. **Commit frequently**
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

   The post-commit hook will automatically log to context.md

### After Implementation

1. **Update documentation:**
   ```
   /doc-update [files you created/modified]
   ```

2. **Verify Dashboard:**
   - Check http://localhost:3000
   - Confirm your updates appear
   - Verify format is correct

3. **Validate format:**
   ```bash
   ./validate-context-format.sh
   ```

4. **Create session handoff:**
   ```
   /context-continuity
   ```

## Agent Usage Guidelines

### Agent Coordination

**Sequential (when tasks depend on each other):**
```
1. @codebase-analyser first (understand existing code)
2. @code-quality-advisor second (research best practices)
3. @implementation-planner third (create plan based on context)
```

**Parallel (when tasks are independent):**
```
@postgres-schema-reader and @supabase-schema-reader
# Can run simultaneously if analyzing different databases
```

### Agent Best Practices

1. **Be Specific in Requests:**
   ```
   ❌ @codebase-analyser analyze the code
   ✅ @codebase-analyser analyze the authentication flow in src/auth/ focusing on JWT token handling and session management
   ```

2. **Provide Context:**
   ```
   @implementation-planner

   I need to add a user profile editing feature. The codebase-analyser found that we use React with TypeScript and have an existing user service. Create a plan that integrates with these patterns.
   ```

3. **Review Reports Thoroughly:**
   - Read the full report, not just summary
   - Check Dashboard for linked report files
   - Use findings to inform implementation

4. **Agent-First Development:**
   - ALWAYS use agents before implementing
   - Don't skip research phase
   - Plans save time and prevent mistakes

## Slash Command Examples

### Context Continuity

Create handoff document at end of session:
```
/context-continuity
```

Output: `.claude/docs/tasks/continuity/continuity_session_brief_[timestamp].md`

### Documentation Updates

Update docs for specific files:
```
/doc-update src/components/UserProfile.tsx
```

Update docs for multiple files:
```
/doc-update "src/components/*.tsx"
```

Update all documentation:
```
/doc-update
```

## Project Structure

```
project-root/
├── .claude/
│   ├── agents/                  # Agent definitions
│   │   ├── codebase-analyser.md
│   │   ├── code-quality-advisor.md
│   │   ├── implementation-planner.md
│   │   └── ... (6 more agents)
│   ├── commands/                # Slash commands
│   │   ├── context-continuity.md
│   │   ├── doc-update.md
│   │   └── example-command.md
│   ├── docs/
│   │   ├── CONTEXT_MD_FORMAT_GUIDE.md
│   │   └── tasks/
│   │       ├── context.md       # ⭐ Central activity log
│   │       ├── codebase-analyser/
│   │       ├── implementation-planner/
│   │       └── ... (agent reports)
│   └── settings.local.json      # Claude Code permissions
├── docusaurus-site/
│   ├── docs/                    # Documentation content
│   │   ├── intro.md
│   │   ├── context.md           # Synced from .claude
│   │   ├── architecture/
│   │   ├── features/
│   │   ├── database/
│   │   └── development/
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard/       # Real-time Dashboard
│   │   ├── pages/
│   │   │   └── index.tsx        # Homepage with Dashboard
│   │   └── utils/
│   │       └── contextParser.ts # Parses context.md
│   ├── static/data/
│   │   └── context.md           # Auto-synced copy
│   ├── docusaurus.config.ts     # Site configuration
│   ├── sidebars.ts              # Navigation structure
│   ├── auto-sync-context.sh     # File watcher script
│   ├── sync-context-safe.sh     # Manual sync script
│   └── package.json
├── CLAUDE.md                    # ⭐ Project guidelines
├── SETUP_WIZARD.md              # Setup instructions
└── validate-context-format.sh  # Format checker
```

### Key Files

**`.claude/docs/tasks/context.md`**
- Central activity log
- Dashboard data source
- Must follow exact format

**`CLAUDE.md`**
- Project guidelines
- Workflow patterns
- Agent usage instructions
- Customizable for your project

**`docusaurus-site/docusaurus.config.ts`**
- Site title, tagline, URL
- Port configuration
- Theme settings
- Plugin configuration

**`validate-context-format.sh`**
- Validates changelog format
- Ensures Dashboard compatibility
- Run before committing

## Troubleshooting

### Dashboard Not Updating

**Check format:**
```bash
./validate-context-format.sh
```

**Check file watcher:**
```bash
ps aux | grep fswatch
```

**Manual sync:**
```bash
cd docusaurus-site
./sync-context-safe.sh
```

**Check logs:**
```bash
tail -f docusaurus-site/logs/auto-sync.log
```

### Agent Not Found

**List available agents:**
```bash
ls .claude/agents/
```

**Verify agent format:**
- Check frontmatter exists
- Verify markdown syntax
- Restart Claude Code

### MCP Server Issues

**Check status:**
```bash
claude mcp list
```

**Reconnect:**
```bash
claude mcp restart
```

**Verify configuration:**
Check `~/.claude/mcp.json` or project-local MCP config

### Build Errors

**Clear cache:**
```bash
cd docusaurus-site
rm -rf .docusaurus build
npm run build
```

**Reinstall dependencies:**
```bash
cd docusaurus-site
rm -rf node_modules package-lock.json
npm install
```

**Check Node version:**
```bash
node --version  # Must be >= 20.0
```

### Git Hook Not Running

**Check hook exists:**
```bash
ls -la .git/hooks/post-commit
```

**Make executable:**
```bash
chmod +x .git/hooks/post-commit
```

**Test manually:**
```bash
.git/hooks/post-commit
tail -20 .claude/docs/tasks/context.md
```

## Best Practices

### Context Management

1. **Update Regularly**
   - Add entry after significant work
   - Don't batch multiple tasks into one entry
   - Use descriptive titles

2. **Follow Format Exactly**
   ```markdown
   ### [Title] [Timestamp] - agent-name
   **Summary:** Description

   **Report:** `.claude/docs/tasks/[agent-type]/[file].md`
   ```

3. **Validate Before Committing**
   ```bash
   ./validate-context-format.sh
   ```

### Time Management

1. **Always Use MCP Time Server**
   ```
   mcp__time__get_current_time(timezone="Europe/London")
   ```

2. **Never Use:**
   - System time or datetime.now()
   - Guessed timestamps
   - Placeholders like "TBD" or "TIMESTAMP"

3. **Consistent Format**
   - `DDMmmYYYY_HHMM`
   - Example: `03Oct2025_1430`

### Agent Workflow

1. **Research First**
   - Use agents before coding
   - Read full reports
   - Follow recommendations

2. **Sequential Coordination**
   - codebase-analyser first
   - code-quality-advisor second
   - implementation-planner third

3. **Trust Agent Output**
   - Agents are specialized experts
   - Reports are comprehensive
   - Plans are optimized for solo developers

### Documentation

1. **Keep Docs in Sync**
   - Use `/doc-update` after features
   - Update architecture docs for major changes
   - Link to agent reports for context

2. **Dashboard as Source of Truth**
   - Check Dashboard regularly
   - Verify updates appear
   - Use for project tracking

3. **Session Handoffs**
   - Use `/context-continuity` at end of sessions
   - Provides complete context for next session
   - Enables seamless continuation

## Common Commands

**Development:**
```bash
cd docusaurus-site && npm run dev          # Start dev server
cd docusaurus-site && npm run build        # Build for production
cd docusaurus-site && npm run serve        # Serve built site
```

**Validation:**
```bash
./validate-context-format.sh               # Check changelog format
cd docusaurus-site && npm run typecheck    # TypeScript validation
```

**Sync:**
```bash
cd docusaurus-site && ./sync-context-safe.sh  # Manual sync
```

**Git:**
```bash
git add .
git commit -m "message"                    # Auto-logs to context.md
git status
git log
```

**MCP:**
```bash
claude mcp list                            # List MCP servers
claude mcp restart                         # Restart servers
```

---

This development workflow combines agent-based research, real-time documentation, and systematic tracking to optimize solo developer productivity.
