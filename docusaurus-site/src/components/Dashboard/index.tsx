import React, { useState, useEffect, useMemo } from 'react';
import { AgentUpdate, FilterOptions, ParsedContext } from '../../types/AgentUpdate';
import { parseContextContent } from '../../utils/contextParser';
import AgentUpdateCard from './AgentUpdateCard';
import FilterPanel from './FilterPanel';
import styles from './Dashboard.module.css';

// We'll fetch context.md content dynamically

interface DashboardProps {
  maxItems?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

export default function Dashboard({
  maxItems = 50,
  showSearch = true,
  showFilters = true,
  compact = false
}: DashboardProps): JSX.Element {
  const [parsedContext, setParsedContext] = useState<ParsedContext | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    selectedAgents: [],
    searchText: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and parse context.md content on component mount
  useEffect(() => {
    const fetchContextContent = async () => {
      try {
        setLoading(true);
        // Fetch context.md from the static data directory
        const response = await fetch('/data/context.md');
        if (!response.ok) {
          throw new Error(`Failed to fetch context.md: ${response.statusText}`);
        }
        const contextContent = await response.text();
        const parsed = parseContextContent(contextContent);
        setParsedContext(parsed);
        setError(null);
      } catch (err) {
        console.error('Error loading context content:', err);
        setError('Failed to load agent updates. Please check that the context.md file is available.');
      } finally {
        setLoading(false);
      }
    };

    fetchContextContent();
  }, []);

  // Filter and sort updates
  const filteredUpdates = useMemo(() => {
    if (!parsedContext) return [];

    let filtered = [...parsedContext.updates];

    // Filter by selected agents
    if (filters.selectedAgents.length > 0) {
      filtered = filtered.filter(update =>
        filters.selectedAgents.includes(update.agentName)
      );
    }

    // Filter by search text
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(update =>
        update.title.toLowerCase().includes(searchLower) ||
        update.description.toLowerCase().includes(searchLower) ||
        update.agentName.toLowerCase().includes(searchLower)
      );
    }

    // Limit results
    return filtered.slice(0, maxItems);
  }, [parsedContext, filters, maxItems]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading agent updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <h3>⚠️ Error Loading Updates</h3>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!parsedContext) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.empty}>
          <h3>📋 No Updates Found</h3>
          <p>No agent updates available at this time.</p>
        </div>
      </div>
    );
  }

  const availableAgents = Object.keys(parsedContext.agentCounts) as any[];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Development Dashboard</h1>
          <p className={styles.subtitle}>
            Agent Activity & Technical Operations Center
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{parsedContext.totalCount}</span>
            <span className={styles.statLabel}>Total Updates</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{availableAgents.length}</span>
            <span className={styles.statLabel}>Active Agents</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{filteredUpdates.length}</span>
            <span className={styles.statLabel}>Filtered Results</span>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          availableAgents={availableAgents}
          agentCounts={parsedContext.agentCounts}
          onFilterChange={handleFilterChange}
          totalCount={parsedContext.totalCount}
          filteredCount={filteredUpdates.length}
        />
      )}

      {/* Updates List */}
      <main className={styles.updatesSection}>
        {filteredUpdates.length === 0 ? (
          <div className={styles.noResults}>
            <h3>🔍 No Updates Match Your Filters</h3>
            <p>Try adjusting your search terms or agent selection.</p>
          </div>
        ) : (
          <div className={styles.updatesList}>
            {filteredUpdates.map(update => (
              <AgentUpdateCard
                key={update.id}
                update={update}
                compact={compact}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Last updated: {parsedContext.lastUpdated.toLocaleString()} •{' '}
          <span className={styles.autoSync}>Auto-sync active</span>
        </p>
      </footer>
    </div>
  );
}