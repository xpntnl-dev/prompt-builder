# Welcome to Your Enhanced Claude Code Project

This project is configured with an Enhanced Claude Code structure featuring:

## Core Features

### 🤖 Specialized Agents
Nine research agents for different domains:
- Codebase analysis
- Code quality review
- Implementation planning
- Technology strategy
- And more...

### 📊 Development Dashboard
View all agent activities, reports, and updates in a beautiful web interface.

[Go to Dashboard →](./dashboard)

### 📝 Context Management
All agent activities are tracked in `.claude/docs/tasks/context.md` with automatic synchronization to this documentation site.

### ⚡ Auto-Sync
File watcher automatically syncs context updates to the dashboard in real-time.

## Getting Started

1. **Review the Dashboard** - See all agent updates and reports
2. **Read CLAUDE.md** - Understand project guidelines and best practices
3. **Check Context.md** - Review the project history and agent activities
4. **Use Agents** - Invoke specialized agents for research and analysis
5. **Run Slash Commands** - Use `/context-continuity`, `/doc-update`, and custom commands

## Project Structure

```
.claude/
├── agents/           # 9 specialized research agents
├── commands/         # 3 slash commands
└── docs/
    └── tasks/
        └── context.md   # Central activity log

docusaurus-site/     # This documentation site
├── docs/             # Documentation pages
├── src/
│   └── components/
│       └── Dashboard/  # Agent updates dashboard
└── static/
    └── data/
        └── reports/    # Synced agent reports
```

## Next Steps

- Explore the [Dashboard](./dashboard) to see agent activities
- Read the project guidelines in `CLAUDE.md`
- Review context format in `.claude/docs/CONTEXT_MD_FORMAT_GUIDE.md`
