# Troubleshooting Guide

Common issues and solutions for Enhanced Claude Code projects.

---

## Dashboard Issues

### Dashboard Not Showing Any Updates

**Symptoms:**
- Dashboard loads but shows "No Updates Found"
- Recently added entries don't appear

**Diagnosis:**
```bash
# 1. Check if context.md exists and has content
cat .claude/docs/tasks/context.md

# 2. Check if file watcher is running
ps aux | grep fswatch

# 3. Check sync logs
cat docusaurus-site/logs/auto-sync.log
```

**Solutions:**

**A. Validate Format:**
```bash
./validate-context-format.sh
```
Fix any format errors reported.

**B. Restart File Watcher:**
```bash
cd docusaurus-site
pkill -f auto-sync-context
npm run dev
```

**C. Manual Sync:**
```bash
cd docusaurus-site
./sync-context-safe.sh
```

**D. Check Synced File:**
```bash
cat docusaurus-site/static/data/context.md
```
Should match `.claude/docs/tasks/context.md`

---

### Dashboard Shows Some But Not All Updates

**Cause:** Format mismatch on missing entries

**Solution:**
```bash
./validate-context-format.sh
```

Look for entries marked with ✗ and fix their format.

**Common Fixes:**
- Move timestamp after title: `### Title [Timestamp] - agent`
- Fix timestamp format: `[DDMmmYYYY_HHMM]`
- Use lowercase hyphenated agent name: `codebase-analyser`
- Add hyphen before agent: `- agent-name`

---

### Dashboard Shows Old Data

**Cause:** File watcher not syncing changes

**Check:**
```bash
# View watcher status
ps aux | grep fswatch

# Check last sync time
ls -la docusaurus-site/static/data/context.md
```

**Solution:**
```bash
cd docusaurus-site
pkill -f auto-sync
npm run dev
```

Wait 2-3 seconds after saving context.md for sync to occur.

---

### "Failed to fetch context.md" Error

**Cause:** Docusaurus server not running or file not synced

**Solution:**
```bash
# 1. Ensure server is running
cd docusaurus-site
npm run dev

# 2. Check file exists
ls -la static/data/context.md

# 3. Manual sync if missing
./sync-context-safe.sh

# 4. Restart server
pkill -f docusaurus
npm run dev
```

---

## File Watcher Issues

### File Watcher Not Starting

**Error:** `fswatch: command not found`

**Solution:**
```bash
# macOS
brew install fswatch

# Linux (Ubuntu/Debian)
sudo apt-get install fswatch

# Linux (Fedora)
sudo dnf install fswatch
```

After installing, make scripts executable:
```bash
chmod +x docusaurus-site/auto-sync-context.sh
chmod +x docusaurus-site/sync-context-safe.sh
```

---

### File Watcher Already Running

**Error:** `Auto-sync is already running (PID: XXXXX)`

**Solution:**
```bash
cd docusaurus-site

# Kill existing watcher
pkill -f auto-sync-context

# Remove stale PID file
rm -f auto-sync.pid

# Restart
npm run dev
```

---

### Changes Not Being Detected

**Symptoms:**
- Save context.md but Dashboard doesn't update
- No errors in logs

**Diagnosis:**
```bash
# Check watcher is monitoring correct file
ps aux | grep fswatch
# Should show: fswatch -o ../.claude/docs/tasks/context.md
```

**Solution:**
```bash
cd docusaurus-site

# Stop watcher
pkill -f auto-sync-context

# Verify paths are correct
head -20 auto-sync-context.sh | grep SOURCE_FILE
# Should show: SOURCE_FILE="../.claude/docs/tasks/context.md"

# Restart
npm run dev
```

---

### Sync Timeout Errors

**Error in logs:** `Sync timed out after 30s`

**Cause:** Large file or slow system

**Solution:**
Edit `docusaurus-site/auto-sync-context.sh`:
```bash
# Find line: SYNC_TIMEOUT=30
# Change to: SYNC_TIMEOUT=60
```

Restart watcher:
```bash
cd docusaurus-site
pkill -f auto-sync
npm run dev
```

---

## Agent Issues

### Agent Not Found

**Error:** `Agent 'agent-name' not found`

**Diagnosis:**
```bash
ls .claude/agents/
# Should list: codebase-analyser.md, code-quality-advisor.md, etc.
```

**Solution:**

**A. Check File Exists:**
```bash
ls .claude/agents/[agent-name].md
```

**B. Check Filename Matches:**
Agent files must be lowercase, hyphenated, with `.md` extension.

**C. Check Frontmatter:**
```yaml
---
name: agent-name
canonical_name: agent-name
directory: agent-name
description: [description]
---
```

**D. Restart Claude Code** after fixing.

---

### Agent Creates Invalid Changelog Entries

**Symptoms:**
- Agent completes task but entry doesn't appear in Dashboard

**Solution:**

**A. Check Agent File Has Format Guidance:**
```bash
grep "Context.md Changelog Format" .claude/agents/[agent-name].md
```

Should return matches. If not, agent file is missing format section.

**B. Add Format Guidance:**
See `docs/CONTEXT_MD_FORMAT_GUIDE.md` for the required section to add.

**C. Test Format:**
After agent runs, validate:
```bash
./validate-context-format.sh
```

---

### Agent Report Not Found

**Error:** Clicking report link in Dashboard shows 404

**Cause:** Report file not synced to `docusaurus-site/static/data/reports/`

**Solution:**
```bash
cd docusaurus-site

# Check sync script copied reports
ls -la static/data/reports/

# Manual sync if needed
./sync-context-safe.sh

# Check again
ls -la static/data/reports/[agent-type]/
```

**Note:** Reports are synced from `.claude/docs/tasks/` to `static/data/reports/`

---

## MCP Server Issues

### Time Server Not Found

**Error:** `mcp__time__get_current_time` fails

**Diagnosis:**
```bash
claude mcp list
```

Look for `time` server in output.

**Solution:**
```bash
# Install at PROJECT level (local to this project)
claude mcp add time /Users/$(whoami)/.local/bin/mcp-server-time -s local

# Verify
claude mcp list
```

**Note:** Using `-s local` installs the server for this project only. This ensures project-specific MCP configurations.

---

### Context7 Server Not Connected

**Diagnosis:**
```bash
claude mcp list
# Look for: context7: [status]
```

**Solution:**

**A. Get API Key:**
Visit https://context7.com and sign up for free API key.

**B. Install:**
```bash
# Install at PROJECT level (local to this project)
claude mcp add --transport http context7 https://mcp.context7.com/mcp \
  --header "Context7-API-Key: YOUR_API_KEY" -s local
```

**C. Verify:**
```bash
claude mcp list
# Should show: context7: ... - ✓ Connected
```

**Note:** Using `-s local` installs the server for this project only. This ensures project-specific MCP configurations.

---

### MCP Server Shows "Not Connected"

**Diagnosis:**
```bash
claude mcp get [server-name]
```

**Common Causes:**
1. Server binary missing
2. Wrong path
3. Invalid API key (for HTTP servers)
4. Network issues

**Solutions:**

**For stdio servers:**
```bash
# Check binary exists
ls -la /path/to/server/binary

# Test manually
/path/to/server/binary
```

**For HTTP servers:**
```bash
# Test URL
curl -H "API-Key: YOUR_KEY" https://server-url/health

# Reinstall with correct API key
claude mcp remove [server-name] -s user
claude mcp add [server-name] [url] --header "API-Key: YOUR_KEY" -s user
```

---

## Docusaurus Issues

### "Cannot find module" Errors

**Error:** Build fails with missing module errors

**Solution:**
```bash
cd docusaurus-site

# Clean install
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

### Port 4000 Already in Use

**Error:** `Port 4000 is already in use`

**Solution:**

**A. Kill Existing Process:**
```bash
lsof -ti:4000 | xargs kill -9
```

**B. Use Different Port:**
```bash
cd docusaurus-site
npm start -- --port 4001
```

**C. Update Package.json:**
Edit `docusaurus-site/package.json`:
```json
"start": "docusaurus start -- --port 4001"
```

---

### Build Fails with YAML Errors

**Error:** `can not read a block mapping entry`

**Cause:** Special characters in frontmatter

**Solution:**

**A. Quote Values with Special Characters:**
```yaml
---
title: "My Title: With Colon"
sidebar_label: "Dashboard"  # Not: 📊 Dashboard
---
```

**B. Escape Special Characters:**
Use quotes around any value containing: `:`, `[`, `]`, `{`, `}`, `#`, `&`, `*`, `!`, `|`, `>`, `@`, `` ` ``

---

## Permission Issues

### Script Not Executable

**Error:** `Permission denied: ./script-name.sh`

**Solution:**
```bash
chmod +x ./script-name.sh
```

---

### Cannot Write to Directory

**Error:** `Permission denied` when saving files

**Solution:**
```bash
# Check ownership
ls -la .claude/docs/tasks/

# Fix if needed
sudo chown -R $(whoami) .claude/
```

---

## Context.md Issues

### Context.md Deleted or Corrupted

**Solution:**

**A. Restore from Backup:**
```bash
# If using git
git checkout .claude/docs/tasks/context.md
```

**B. Create New from Template:**
```bash
cp docs/context.md.template .claude/docs/tasks/context.md
```

**C. Rebuild from Reports:**
List all reports and manually create entries:
```bash
find .claude/docs/tasks -name "*.md" -type f
```

---

### Merge Conflicts in Context.md

**Cause:** Multiple sessions editing simultaneously

**Solution:**
```bash
# View conflict
git diff .claude/docs/tasks/context.md

# Keep both versions
# Manually merge, ensuring format is correct

# Validate after merge
./validate-context-format.sh
```

---

## General Issues

### Claude Code Not Loading Configuration

**Symptoms:**
- Agents not available
- Commands not found
- Settings not applied

**Solution:**
```bash
# 1. Check .claude directory exists
ls -la .claude/

# 2. Verify file structure
ls .claude/agents/
ls .claude/commands/

# 3. Restart Claude Code
# Close and reopen the project

# 4. Check for errors
# Look in Claude Code output panel
```

---

### Performance Issues

**Symptoms:**
- Slow agent responses
- Dashboard sluggish
- File watcher using high CPU

**Solutions:**

**A. Limit File Watcher:**
Edit `docusaurus-site/auto-sync-context.sh`:
```bash
# Increase debounce time
DEBOUNCE_SECONDS=5  # From 2 to 5
```

**B. Optimize Dashboard:**
```bash
cd docusaurus-site
npm run build
npm run serve
```
Production build is faster than dev server.

**C. Clean Up Old Reports:**
```bash
# Archive old reports
mkdir .claude/docs/tasks/archive
mv .claude/docs/tasks/*/202[0-3]*.md .claude/docs/tasks/archive/
```

---

## Getting More Help

### Check Logs

**Auto-Sync Logs:**
```bash
tail -f docusaurus-site/logs/auto-sync.log
```

**Docusaurus Logs:**
```bash
cd docusaurus-site
npm start 2>&1 | tee docusaurus.log
```

**Claude Code Logs:**
Check Output panel in Claude Code interface.

### Debug Mode

**Enable Verbose Logging:**
Edit scripts to add `set -x` at top:
```bash
#!/bin/bash
set -euo pipefail
set -x  # Enable debug output
```

### Report Issues

**Template Repository:**
https://github.com/[YOUR-ORG]/claude-project-template/issues

**Claude Code:**
https://github.com/anthropics/claude-code/issues

---

**Version:** 4.0.0
**Last Updated:** [TIMESTAMP]
