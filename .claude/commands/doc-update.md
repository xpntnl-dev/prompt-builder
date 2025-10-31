# Documentation Update Command

## Description
Manually trigger documentation updates for specific files or the entire project using the Docusaurus Expert agent.

## Usage
```
/doc-update [file-pattern]
```

## Parameters
- `file-pattern` (optional) - Specific files to document (e.g., "src/utils/*.js" or "src/components/Button.tsx")

## Behavior
When this command is executed, Claude will:
1. Analyze the specified files (or all JS/TS files if none specified)
2. Use the docusaurus-expert agent to generate/update documentation
3. Create or update files in the docs-site/ directory
4. Provide a summary of changes made

## Examples
```
/doc-update
/doc-update src/utils/helpers.js
/doc-update "src/components/*.tsx"
```

## System Prompt
You are executing the doc-update command. Use the docusaurus-expert agent to analyze and create comprehensive documentation for the specified files.

IMPORTANT: Actually create and edit documentation files in docusaurus-site/. Do not just provide recommendations.

For each function/component found:
- Create detailed API documentation with TypeScript types
- Include practical usage examples
- Follow existing Docusaurus structure and styling
- Add cross-references to related documentation
- Include the auto-generation footer

Focus on creating actionable, comprehensive documentation that developers can immediately use.

## Context.md Changelog Format

**CRITICAL: When creating context.md changelog entries, use this EXACT format for Dashboard detection:**

```markdown
### [Title] [Timestamp] - doc-update
**Summary:** Brief description of documentation changes made

**Report:** `.claude/docs/tasks/docusaurus-expert/[filename].md`
```

**Example Entry:**
```markdown
### Documentation Update - API Utils [02Oct2025_1235] - doc-update
**Summary:** Updated documentation for 8 utility functions in src/utils/, added code examples and TypeScript signatures.

**Report:** `.claude/docs/tasks/docusaurus-expert/api-utils-doc-update_02Oct2025_1235.md`
```

**Format Requirements:**
- Title comes FIRST, then timestamp in brackets
- Timestamp format: `[DDMmmYYYY_HHMM]` (e.g., `[02Oct2025_1235]`)
- Command name at end: `- doc-update` (lowercase, hyphenated)
- Summary is optional but recommended
- Report path must match actual saved file location

**Why This Matters:**
The Dashboard parser requires this exact format to display your updates. Entries not matching this format will not appear in the Dashboard.