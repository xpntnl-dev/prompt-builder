import React, { useState } from 'react';
import { AgentType, FilterOptions } from '../../types/AgentUpdate';
import { getAgentTypeColor } from '../../utils/contextParser';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  availableAgents: AgentType[];
  agentCounts: Record<AgentType, number>;
  onFilterChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterPanel({
  availableAgents,
  agentCounts,
  onFilterChange,
  totalCount,
  filteredCount
}: FilterPanelProps): JSX.Element {
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort agents by count (descending)
  const sortedAgents = [...availableAgents].sort((a, b) => {
    return (agentCounts[b] || 0) - (agentCounts[a] || 0);
  });

  const handleAgentToggle = (agent: AgentType) => {
    const newSelected = selectedAgents.includes(agent)
      ? selectedAgents.filter(a => a !== agent)
      : [...selectedAgents, agent];

    setSelectedAgents(newSelected);
    onFilterChange({
      selectedAgents: newSelected,
      searchText
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);
    onFilterChange({
      selectedAgents,
      searchText: newSearchText
    });
  };

  const handleClearAll = () => {
    setSelectedAgents([]);
    setSearchText('');
    onFilterChange({
      selectedAgents: [],
      searchText: ''
    });
  };

  const handleSelectAll = () => {
    setSelectedAgents([...availableAgents]);
    onFilterChange({
      selectedAgents: [...availableAgents],
      searchText
    });
  };

  const formatAgentName = (agent: AgentType): string => {
    return agent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={styles.filterPanel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Agent Updates</h3>
          <div className={styles.counts}>
            <span className={styles.count}>
              {filteredCount} of {totalCount} updates
            </span>
          </div>
        </div>
        <button
          className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filters"
        >
          🔽
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search updates..."
          value={searchText}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* Filters */}
      <div className={`${styles.filtersSection} ${isExpanded ? styles.expanded : ''}`}>
        {/* Filter Controls */}
        <div className={styles.filterControls}>
          <button
            className={styles.controlButton}
            onClick={handleClearAll}
            disabled={selectedAgents.length === 0}
          >
            Clear All
          </button>
          <button
            className={styles.controlButton}
            onClick={handleSelectAll}
            disabled={selectedAgents.length === availableAgents.length}
          >
            Select All
          </button>
        </div>

        {/* Agent Filter Chips */}
        <div className={styles.agentChips}>
          {sortedAgents.map(agent => {
            const isSelected = selectedAgents.includes(agent);
            const count = agentCounts[agent] || 0;
            const agentColor = getAgentTypeColor(agent);

            return (
              <button
                key={agent}
                className={`${styles.agentChip} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleAgentToggle(agent)}
                style={{
                  '--agent-color': agentColor,
                  '--agent-color-light': `${agentColor}20`
                } as React.CSSProperties}
              >
                <span className={styles.agentName}>
                  {formatAgentName(agent)}
                </span>
                <span className={styles.agentCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}