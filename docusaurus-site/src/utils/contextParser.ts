// Context.md Parser for Agent Updates Dashboard
// RVKCAT Europa System v2 - Docusaurus Integration

import { AgentUpdate, AgentType, ParsedContext } from '../types/AgentUpdate';

// Parse timestamp from format like [28Sep2025_1950] or [28Sep2025_2038]
function parseTimestamp(timestampStr: string): Date {
  // Extract timestamp from brackets like [28Sep2025_1950]
  const match = timestampStr.match(/\[(\d{2})(\w{3})(\d{4})_(\d{4})\]/);
  if (!match) {
    console.warn('Failed to parse timestamp:', timestampStr);
    return new Date(); // Fallback to current date
  }

  const [, day, monthStr, year, time] = match;
  const monthMap: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const month = monthMap[monthStr];
  if (month === undefined) {
    console.warn('Unknown month:', monthStr);
    return new Date();
  }

  const hours = parseInt(time.substring(0, 2), 10);
  const minutes = parseInt(time.substring(2, 4), 10);

  // Create date in local time
  const parsedDate = new Date(parseInt(year, 10), month, parseInt(day, 10), hours, minutes);
  return parsedDate;
}

// Generate unique ID from title and timestamp
function generateId(title: string, timestamp: string): string {
  const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timeId = timestamp.replace(/[\[\]_:]/g, '');
  return `${sanitized}-${timeId}`;
}

// Parse agent update entry from context.md format
function parseAgentUpdate(content: string, index: number): AgentUpdate | null {
  // Match pattern: ## or ### [Title] [timestamp] - [agent-name]
  // Also handle "agent: agent-name" format for git commits
  const headerMatch = content.match(/^##+ (.+?) (\[.+?\]) - (?:agent: )?(.+)$/m);
  if (!headerMatch) {
    return null;
  }

  const [fullMatch, title, timestamp, agentName] = headerMatch;
  const headerIndex = content.indexOf(fullMatch);

  // Extract description (content after header until next ## or ### or end)
  const afterHeader = content.substring(headerIndex + fullMatch.length);
  const nextHeaderIndex = afterHeader.search(/\n##+ /);
  const descriptionSection = nextHeaderIndex >= 0
    ? afterHeader.substring(0, nextHeaderIndex)
    : afterHeader;

  // Extract description, report file, and commit message
  const lines = descriptionSection.split('\n').filter(line => line.trim());
  let description = '';
  let reportFile: string | undefined;
  let commitMessage: string | undefined;

  // For git-commit entries, extract the commit message from code block
  if (agentName.trim() === 'git-commit') {
    const commitMessageMatch = content.match(/\*\*Commit Message:\*\*[\s\S]*?```\n([\s\S]*?)```/);
    if (commitMessageMatch) {
      commitMessage = commitMessageMatch[1].trim();
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    // Handle both "**Report:**" and "Report:" formats
    if (trimmed.startsWith('**Report:**')) {
      reportFile = trimmed.replace('**Report:**', '').trim();
      // Strip backticks and extract just the filename from full path
      reportFile = reportFile.replace(/`/g, '');
      // If it's a full path like .claude/docs/tasks/continuity/file.md, extract just the filename
      if (reportFile.includes('/')) {
        reportFile = reportFile.split('/').pop() || reportFile;
      }
    } else if (trimmed.startsWith('Report:')) {
      reportFile = trimmed.replace('Report:', '').trim();
      // Strip backticks and extract just the filename from full path
      reportFile = reportFile.replace(/`/g, '');
      // If it's a full path, extract just the filename
      if (reportFile.includes('/')) {
        reportFile = reportFile.split('/').pop() || reportFile;
      }
    } else if (trimmed.startsWith('**Summary:**')) {
      // Extract summary content as the description
      description = trimmed.replace('**Summary:**', '').trim();
    } else if (trimmed && !trimmed.startsWith('###') && !trimmed.startsWith('**Report:**') && !trimmed.startsWith('**Summary:**')) {
      // Append other content if it's not already captured
      if (!description) {
        description = trimmed;
      }
    }
  }

  return {
    id: generateId(title, timestamp),
    title: title.trim(),
    timestamp: timestamp.trim(),
    agentName: agentName.trim() as AgentType,
    description: description.trim(),
    reportFile,
    parsedDate: parseTimestamp(timestamp),
    rawContent: content,
    commitMessage
  };
}

// Main parser function
export function parseContextContent(contextMd: string): ParsedContext {
  // Strip out code fence blocks ONLY for header detection to avoid parsing example entries
  const cleanedContent = contextMd.replace(/```[\s\S]*?```/g, '');

  const updates: AgentUpdate[] = [];
  const agentCounts: Record<AgentType, number> = {} as any;

  // Find all agent update headers with regex (both ## and ### formats)
  // Also handle "agent: agent-name" format
  const headerRegex = /^##+ (.+?) (\[.+?\]) - (?:agent: )?(.+)$/gm;
  let match;
  const foundUpdates: Array<{title: string, timestamp: string, agent: string, index: number}> = [];

  while ((match = headerRegex.exec(cleanedContent)) !== null) {
    foundUpdates.push({
      title: match[1],
      timestamp: match[2],
      agent: match[3],
      index: match.index
    });
  }

  // Process each found update
  for (let i = 0; i < foundUpdates.length; i++) {
    const current = foundUpdates[i];
    const next = foundUpdates[i + 1];

    // Extract content from ORIGINAL contextMd (with code blocks) using the same indices
    // We need to find the corresponding position in the original content
    const headerText = `### ${current.title} ${current.timestamp} - ${current.agent}`;
    const originalStartIndex = contextMd.indexOf(headerText);

    if (originalStartIndex === -1) {
      // Try with ## instead of ###
      const altHeaderText = `## ${current.title} ${current.timestamp} - ${current.agent}`;
      const altStartIndex = contextMd.indexOf(altHeaderText);
      if (altStartIndex === -1) continue;

      const originalEndIndex = next ? contextMd.indexOf(`### ${next.title} ${next.timestamp}`, altStartIndex + 1) : contextMd.length;
      const section = contextMd.substring(altStartIndex, originalEndIndex);
      const update = parseAgentUpdate(section, i);
      if (update) {
        updates.push(update);
        const normalizedName = update.agentName.trim();
        agentCounts[normalizedName] = (agentCounts[normalizedName] || 0) + 1;
      }
      continue;
    }

    // Find end of this section (start of next header or end of file)
    const originalEndIndex = next ? contextMd.indexOf(`### ${next.title} ${next.timestamp}`, originalStartIndex + 1) : contextMd.length;
    const section = contextMd.substring(originalStartIndex, originalEndIndex);

    const update = parseAgentUpdate(section, i);
    if (update) {
      updates.push(update);

      // Count by agent type
      const normalizedName = update.agentName.trim();
      if (agentCounts[normalizedName]) {
        agentCounts[normalizedName]++;
      } else {
        agentCounts[normalizedName] = 1;
      }
    }
  }

  // Sort by date (newest first)
  updates.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  return {
    updates,
    totalCount: updates.length,
    agentCounts,
    lastUpdated: new Date()
  };
}

// Utility function to format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Utility function to get agent type color
export function getAgentTypeColor(agentType: string): string {
  const colors: Record<string, string> = {
    'meta-api-expert': '#ff6b35',
    'codebase-analyser': '#2196f3',
    'supabase-schema-reader': '#4caf50',
    'main': '#9c27b0',
    'tech-researcher': '#f44336',
    'docusaurus-expert': '#ff9800',
    'strategic-technology-advisor': '#607d8b',
    'test': '#795548',
    'implementation-planner': '#e91e63',
    'continuity': '#673ab7',
    'context-continuity': '#673ab7',
    'code-quality-advisor': '#009688',
    'cloudinary-expert': '#00bcd4',
    'postgres-schema-reader': '#8bc34a',
    'git-commit': '#ffc107',  // Amber color for git commits
    'setup': '#4caf50'  // Green color for setup/initialization
  };

  return colors[agentType] || '#757575';
}