# Example Command

## Description
Brief description of what this command does.

## Usage
```
/example-command [optional-argument]
```

## Parameters
- `optional-argument` - Description of the parameter

## Behavior
When this command is executed, Claude will:
1. Action 1
2. Action 2
3. Action 3

## Examples
```
/example-command
/example-command "some argument"
```

## System Prompt
You are executing the example-command. [Detailed instructions for Claude on how to behave when this command is run]

## Context.md Changelog Format

**CRITICAL: When creating context.md changelog entries, use this EXACT format for Dashboard detection:**

```markdown
### [Title] [Timestamp] - example-command
**Summary:** Brief description of what this command accomplished

**Report:** `.claude/docs/tasks/[appropriate-directory]/[filename].md`
```

**Example Entry:**
```markdown
### Custom Analysis Report [02Oct2025_1235] - example-command
**Summary:** Executed custom analysis command, generated insights from 100 data points.

**Report:** `.claude/docs/tasks/miscellaneous/custom-analysis_02Oct2025_1235.md`
```

**Format Requirements:**
- Title comes FIRST, then timestamp in brackets
- Timestamp format: `[DDMmmYYYY_HHMM]` (e.g., `[02Oct2025_1235]`)
- Command name at end: `- example-command` (lowercase, hyphenated)
- Summary is optional but recommended
- Report path must match actual saved file location

**Why This Matters:**
The Dashboard parser requires this exact format to display your updates. Entries not matching this format will not appear in the Dashboard.