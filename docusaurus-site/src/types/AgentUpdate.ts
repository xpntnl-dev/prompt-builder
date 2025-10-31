// TypeScript interfaces for Agent Updates Dashboard
// RVKCAT Europa System v2 - Docusaurus Integration

// AgentType is now a string to allow any agent name from context.md
export type AgentType = string;

export interface AgentUpdate {
  id: string;
  title: string;
  timestamp: string;
  agentName: string;
  description: string;
  reportFile?: string;
  parsedDate: Date;
  rawContent: string;
  commitMessage?: string;
}

export interface ParsedContext {
  updates: AgentUpdate[];
  totalCount: number;
  agentCounts: Record<string, number>;
  lastUpdated: Date;
}

export interface FilterOptions {
  selectedAgents: string[];
  searchText: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardProps {
  maxItems?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}