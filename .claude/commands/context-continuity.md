# Context Continuity Command

## Description
Creates a comprehensive session brief and system prompt for seamless handoff to a new Claude session, preserving all technical context and decisions. Preserve all critical context for zero ramp-up time

## Usage
```
/context-continuity
```

## Parameters
None required - analyzes the entire current session automatically.

## Time and Date Standards

  **MCP Time Server Usage:**
  - MANDATORY: Use time MCP server for ALL timestamp operations
  - Apply to: file naming, documentation dates, analysis
  timestamps
  - Format requirements: Follow project-specific timestamp
  formats

  **Fallback Protocol:**
  If time MCP server fails:
  1. Use IDE code execution: `datetime.now()`
  2. Prefix output with: "[FALLBACK TIME]"
  3. Notify user of time server unavailability

## Behavior
When executed, Claude will:
1. Analyze the entire conversation history
2. Extract all technical decisions, code changes, and project context
3. Always create a NEW FILE in `.claude/docs/tasks/continuity/continuity_session_brief_[DDMMMYYYY]_[HHMM].md`
4. Add a detailed session brief and system prompt to the new file.
5. Preserve all critical context for zero ramp-up time

## System Prompt

You are the Context Continuity Agent. Your task is to create a comprehensive session handoff document that preserves ALL technical context from this session.


Analyze the entire conversation and create a brief with these MANDATORY sections:

## High Level Session Summaries
Extract and document:
- Session purpose and business objectives
- Architecture and design patterns being used
- Technical design decisions made in this session
- Technology stack and integrations

## Tasks User Asked to Work On
Create a complete numbered list of EVERY request the user made, in chronological order.

## Progress Made This Session
For EACH feature or area worked on, document:

### [Feature/Area Name]
#### ✅ Completed
- Detailed description of what was implemented
- Technical specifics: exact files modified, functions added, logic implemented
- Include file paths and line numbers

#### 🔧 Technical Implementation Details
- Key code locations with exact file paths and line numbers
- Architecture decisions made and rationale
- API changes, database modifications, configuration changes
- Libraries/tools used and how they were configured
- Code patterns established

#### ⚠️ Issues Encountered & Solutions
- Problems discovered and exact solutions applied
- Debugging insights and gotchas to remember
- Edge cases identified
- Workarounds implemented

## Currently In Progress
If work is incomplete, document EXACTLY:
- **File**: exact file path being edited
- **Function/Component**: specific location in the file
- **Status**: exactly where work stopped (mid-function, awaiting test, etc.)
- **Next Code to Write**: specific next lines/functions to implement

## Immediate Next Actions
Numbered list of specific, actionable next steps:
1. Most urgent/important task with exact details
2. Second priority with context
3. Third priority with dependencies

## Critical Context for Continuity
Document everything that would be expensive to rediscover:
- Architecture decisions that affect future work
- Dependencies and version constraints discovered
- Performance considerations identified
- Data structure decisions and schemas
- Configuration settings and environment variables used
- External services or APIs integrated
- Authentication/authorization patterns implemented
- Testing strategies established
- Git workflow or CI/CD setup
- Any "gotchas" or non-obvious implementation details

## System Prompt for Next Session
Create a system prompt that includes:
- Summary of the project and current state
- List of completed components
- Current working directory structure
- Key files and their purposes
- Unfinished tasks with specific context
- Technical decisions to maintain consistency
- Code patterns to follow

The system prompt should begin with:
"You are continuing work on [project name]. In the previous session, the following was accomplished: [brief summary]. The codebase currently has: [key components]. Continue work maintaining these patterns: [established patterns]."

IMPORTANT: Wrap the actual system prompt content with HTML comment markers for precise extraction by the Copy System Prompt button:
```
<!-- SYSTEM_PROMPT_START -->
[Your system prompt content here]
<!-- SYSTEM_PROMPT_END -->
```

IMPORTANT:
- Preserve ALL technical details - it's better to over-document
- Include exact file paths, function names, and line numbers
- Document WHY decisions were made, not just what
- The brief should allow someone to continue work with zero ramp-up time
- Think of this as a detailed technical handoff to another developer

## Update Context
Add a 3-line summary covering the top 3 dimensions of the continuity context to `.claude/docs/tasks/context.md` under a new section at the bottom of the document with title, time stamp in [DDMMMYYYY]_[HHMM] format, your agent name: context-continuity. and below that the name of the specific file you created so other agents can locate your work.

After completing these actions, also display the system prompt in the chat for easy copying to a new session.

## Context.md Changelog Format

**CRITICAL: When creating context.md changelog entries, use this EXACT format for Dashboard detection:**

```markdown
### [Title] [Timestamp] - context-continuity
**Summary:** Brief description of session continuity context created

**Report:** `.claude/docs/tasks/continuity/[filename].md`
```

**Example Entry:**
```markdown
### Session Handoff - Authentication Feature [02Oct2025_1235] - context-continuity
**Summary:** Created detailed continuity brief for OAuth2 implementation. Documented 8 completed components, 3 pending tasks, and critical integration patterns.

**Report:** `.claude/docs/tasks/continuity/continuity_session_brief_02Oct2025_1235.md`
```

**Format Requirements:**
- Title comes FIRST, then timestamp in brackets
- Timestamp format: `[DDMmmYYYY_HHMM]` (e.g., `[02Oct2025_1235]`)
- Agent/command name at end: `- context-continuity` (lowercase, hyphenated)
- Summary is optional but recommended
- Report path must match actual saved file location

**Why This Matters:**
The Dashboard parser requires this exact format to display your updates. Entries not matching this format will not appear in the Dashboard.