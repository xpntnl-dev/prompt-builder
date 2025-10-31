#!/bin/bash

# Context.md Format Validator
# Validates that changelog entries follow the Dashboard-compatible format

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CONTEXT_FILE=".claude/docs/tasks/context.md"

# Check if context.md exists
if [ ! -f "$CONTEXT_FILE" ]; then
    echo -e "${RED}❌ Error: $CONTEXT_FILE not found${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Validating context.md format...${NC}"
echo ""

# Expected format regex: ### [Title] [Timestamp] - agent-name
HEADER_REGEX="^### .+ \[[0-9]{2}[A-Z][a-z]{2}[0-9]{4}_[0-9]{4}\] - [a-z-]+$"

# Extract all level-3 headers
mapfile -t HEADERS < <(grep "^### " "$CONTEXT_FILE" || true)

if [ ${#HEADERS[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: No changelog entries found (no ### headers)${NC}"
    echo "This might be a new project. Add your first entry using the format:"
    echo ""
    echo "### [Title] [Timestamp] - agent-name"
    echo "**Summary:** Brief description"
    echo ""
    echo "**Report:** \`.claude/docs/tasks/[dir]/[file].md\`"
    exit 0
fi

echo -e "Found ${#HEADERS[@]} changelog entries to validate:"
echo ""

VALID_COUNT=0
INVALID_COUNT=0
INVALID_ENTRIES=()

for i in "${!HEADERS[@]}"; do
    HEADER="${HEADERS[$i]}"
    LINE_NUM=$((i + 1))

    # Check if header matches expected format
    if [[ $HEADER =~ $HEADER_REGEX ]]; then
        echo -e "${GREEN}✓${NC} Line $LINE_NUM: ${HEADER:4}"
        ((VALID_COUNT++))
    else
        echo -e "${RED}✗${NC} Line $LINE_NUM: ${HEADER:4}"
        INVALID_ENTRIES+=("$HEADER")
        ((INVALID_COUNT++))
    fi
done

echo ""
echo "─────────────────────────────────────────"
echo -e "Results: ${GREEN}$VALID_COUNT valid${NC} | ${RED}$INVALID_COUNT invalid${NC}"
echo "─────────────────────────────────────────"
echo ""

if [ $INVALID_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Format validation FAILED${NC}"
    echo ""
    echo "Invalid entries found. They won't appear in the Dashboard."
    echo ""
    echo -e "${YELLOW}Expected format:${NC}"
    echo "### [Title] [Timestamp] - agent-name"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "### Initial Project Setup [03Oct2025_1200] - setup"
    echo "### Database Schema Analysis [02Oct2025_1545] - postgres-schema-reader"
    echo ""
    echo -e "${YELLOW}Common mistakes:${NC}"
    echo "1. Timestamp before title (should be title first)"
    echo "2. Wrong timestamp format (should be DDMmmYYYY_HHMM)"
    echo "3. Agent name with spaces or uppercase"
    echo "4. Missing hyphen before agent name"
    echo ""
    echo -e "${YELLOW}Invalid entries:${NC}"
    for ENTRY in "${INVALID_ENTRIES[@]}"; do
        echo "  - ${ENTRY:4}"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ All entries are valid!${NC}"
    echo ""
    echo "Your changelog entries are properly formatted and will"
    echo "appear in the Dashboard at http://localhost:4000/docs/dashboard"
    echo ""
    exit 0
fi
