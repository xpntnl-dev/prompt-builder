---
id: overview
title: Architecture Overview
sidebar_label: Overview
sidebar_position: 1
---

# Architecture Overview

## System Architecture

This template provides a structured foundation for Claude Code projects with integrated agent-based workflows, real-time documentation, and comprehensive context tracking.

### Core Components

#### 1. Agent System
- **9 specialized research agents** for different domains
- **Read-only operation** - agents analyze and report, never modify code directly
- **Standardized reporting** to `.claude/docs/tasks/[agent-type]/`
- **Context integration** - all reports linked in central changelog

#### 2. Documentation Site (Docusaurus)
- **Real-time Dashboard** displays project activity
- **Auto-sync file watcher** updates Dashboard within 2-3 seconds
- **Searchable history** of all agent activities and commits
- **Responsive design** works on desktop and mobile

#### 3. Context Tracking System
- **Central changelog** at `.claude/docs/tasks/context.md`
- **Standardized format** for consistent Dashboard parsing
- **Git integration** via post-commit hook
- **Session continuity** support for handoffs

#### 4. MCP Integration
- **Time server** for consistent timestamps (mandatory)
- **Context7 server** for latest library documentation (recommended)
- **Standardized timezone** (Europe/London)

### Technology Stack

- **Documentation Platform**: Docusaurus 3.9.1
- **Runtime**: Node.js >= 20.0
- **Language**: TypeScript, React 19.0.0
- **File Watcher**: fswatch
- **Version Control**: Git with custom hooks
- **AI Platform**: Claude Code with MCP servers

### Project Structure

```
project-root/
├── .claude/
│   ├── agents/              # 9 agent definition files
│   ├── commands/            # Custom slash commands
│   ├── docs/
│   │   └── tasks/
│   │       ├── context.md   # Central activity log
│   │       └── [agent-type]/  # Agent reports by type
│   └── settings.local.json  # Claude Code permissions
├── docusaurus-site/
│   ├── docs/                # Documentation content
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard/   # Real-time activity display
│   │   ├── pages/           # Homepage and custom pages
│   │   └── utils/           # Parser and helpers
│   ├── static/data/         # Synced context.md copy
│   ├── auto-sync-context.sh # File watcher script
│   └── sync-context-safe.sh # Manual sync script
├── CLAUDE.md                # Project guidelines
└── validate-context-format.sh  # Format checker

```

## Design Principles

### 1. Agent-First Development
- **Research before implementation** - use agents to gather context
- **Parallel execution** when tasks are independent
- **Sequential coordination** for dependent tasks
- **Comprehensive reporting** with timestamped outputs

### 2. Context-Driven Workflow
- **Everything tracked** in context.md
- **Standardized format** enables Dashboard parsing
- **Real-time visibility** via auto-sync
- **Complete audit trail** for project history

### 3. Solo Developer Optimization
- **Quick setup** with wizard-driven configuration
- **Phased implementation** (MVP → Enhanced → Fully Featured)
- **Reusable patterns** to avoid reinventing the wheel
- **Minimal overhead** - automation where it matters

### 4. Documentation as Code
- **Documentation site integrated** in project
- **Auto-sync from context.md** eliminates manual updates
- **Searchable history** makes information discoverable
- **Version controlled** documentation alongside code

## Data Flow

### Agent Workflow
```
User Request → Agent Invocation → Analysis → Report Generation →
Context.md Update → Auto-Sync → Dashboard Display
```

### Git Commit Workflow
```
git commit → post-commit hook → Extract commit info →
Format changelog entry → Append to context.md →
Auto-Sync → Dashboard Display
```

### Documentation Sync
```
context.md changes → fswatch detects → sync-context-safe.sh runs →
Copy to static/data/ → React component re-fetches →
Dashboard updates (2-3 seconds)
```

## Key Features

### Real-Time Dashboard
- Displays all project activities in chronological order
- Filters by agent type
- Searchable content
- Inline report viewing
- Statistics and analytics

### Specialized Agents
- **codebase-analyser** - Understand existing code patterns
- **code-quality-advisor** - Best practices research
- **implementation-planner** - Phased development plans
- **docusaurus-expert** - Documentation site expertise
- **strategic-technology-advisor** - Architecture guidance
- **cloudinary-expert** - Media transformation planning
- **meta-api-expert** - Meta/Facebook/Instagram API research
- **postgres-schema-reader** - Database analysis (read-only)
- **supabase-schema-reader** - Supabase analysis (read-only)

### Custom Slash Commands
- **/context-continuity** - Session handoff documents
- **/doc-update** - Update documentation for files
- **/example-command** - Template for custom commands

### Time Standardization
- All timestamps via MCP time server
- Consistent timezone (Europe/London)
- Format: `DDMmmYYYY_HHMM` (e.g., `03Oct2025_1430`)

### Validation Tools
- **validate-context-format.sh** - Check changelog format
- Format validation ensures Dashboard compatibility
- Pre-commit integration available

## Extensibility

### Adding New Agents
1. Create agent definition in `.claude/agents/[name].md`
2. Follow frontmatter format
3. Define expertise and workflow
4. Agents auto-discovered by Claude Code

### Adding Slash Commands
1. Create command in `.claude/commands/[name].md`
2. Define command logic
3. Document usage
4. Available via `/command-name`

### Customizing Dashboard
- Modify `docusaurus-site/src/components/Dashboard/`
- Update parser in `src/utils/contextParser.ts`
- Add filters, views, or analytics
- Styling via CSS modules

---

This architecture enables efficient solo developer workflows with comprehensive tracking, real-time visibility, and systematic research-driven development.
