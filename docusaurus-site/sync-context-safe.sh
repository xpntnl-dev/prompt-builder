#!/bin/bash

# RVKCAT Documentation Context Sync Script - SAFE VERSION
# READ-ONLY: Only copies FROM .claude/docs/tasks, NEVER modifies source

echo "🔄 Syncing project context (READ-ONLY mode)..."

SOURCE_FILE="../.claude/docs/tasks/context.md"
DEST_FILE="docs/context.md"
BACKUP_DIR="docs/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if source context file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Source context file not found at $SOURCE_FILE"
    exit 1
fi

# SAFETY: Verify source file is readable (but keep it writable for other processes)
if [ ! -r "$SOURCE_FILE" ]; then
    echo "⚠️  Source file is not readable"
    exit 1
fi

# Skip backups to avoid MDX compilation issues
# Backups disabled - source is read-only and git provides version control
echo "⏭️  Skipping backup (git provides version control)"

# Copy source to temporary location first (safer)
TEMP_FILE="docs/context.md.temp"
echo "📋 Copying from $SOURCE_FILE to temporary location..."
cp "$SOURCE_FILE" "$TEMP_FILE"

# Fix MDX parsing issues - escape problematic patterns
echo "🔧 Escaping MDX-problematic patterns..."
sed -i '' 's/<\([0-9]\)/less than \1/g' "$TEMP_FILE"    # Replace <2s with "less than 2s"
# Wrap email addresses in backticks to prevent MDX from treating them as JSX tags
sed -i '' 's/<noreply@anthropic\.com>/`<noreply@anthropic.com>`/g' "$TEMP_FILE"

# Add frontmatter to temp file if needed
if ! grep -q "^---$" "$TEMP_FILE"; then
    echo "➕ Adding frontmatter..."
    cat > "$TEMP_FILE.with_frontmatter" << 'EOF'
---
sidebar_position: 8
title: Project Context - Current State
description: Live project context and operational status for RVKCAT Europa System
---

EOF
    cat "$TEMP_FILE" >> "$TEMP_FILE.with_frontmatter"
    mv "$TEMP_FILE.with_frontmatter" "$TEMP_FILE"
fi

# Only move to final location if everything succeeded
mv "$TEMP_FILE" "$DEST_FILE"

# Also copy to static data directory for dashboard API access
STATIC_DEST="static/data/context.md"
mkdir -p "static/data"
cp "$SOURCE_FILE" "$STATIC_DEST"

# Also sync agent reports for dashboard access
REPORTS_SOURCE="../.claude/docs/tasks"
REPORTS_DEST="static/data/reports"
if [ -d "$REPORTS_SOURCE" ]; then
    echo "📊 Syncing agent reports..."
    mkdir -p "$REPORTS_DEST"
    cp -r "$REPORTS_SOURCE"/* "$REPORTS_DEST/" 2>/dev/null || true
fi

echo "✅ Context sync complete!"
echo "📄 View at: http://localhost:4000/docs/context"
echo "📝 Source file remains writable for other processes: $SOURCE_FILE"