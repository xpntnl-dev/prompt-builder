# Documentation Dashboard

This documentation site is built using [Docusaurus](https://docusaurus.io/), with integrated context tracking and auto-sync for agent reports.

## Prerequisites

**Required:**
- Node.js 18+
- fswatch (for auto-sync): `brew install fswatch` (macOS) or `apt-get install fswatch` (Linux)

## Installation

```bash
npm install
```

## Local Development

**⚠️ Important:** Use `npm run dev` to enable auto-sync!

```bash
npm run dev
```

This command starts:
1. **Docusaurus development server** on http://localhost:4000
2. **Auto-sync file watcher** for real-time context.md updates

The auto-sync watcher monitors `.claude/docs/tasks/context.md` and automatically syncs agent updates to the Dashboard.

### Alternative (without auto-sync):

```bash
npm start
```

This starts only the Docusaurus server without the auto-sync watcher. You'll need to manually sync with `./sync-context-safe.sh` after making changes.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
