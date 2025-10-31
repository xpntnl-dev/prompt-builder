import React from 'react';
import { AgentUpdate } from '../../types/AgentUpdate';
import { formatRelativeTime, getAgentTypeColor } from '../../utils/contextParser';
import styles from './AgentUpdateCard.module.css';

interface AgentUpdateCardProps {
  update: AgentUpdate;
  compact?: boolean;
}

/**
 * Maps agent canonical names to their report directory names
 * Only needed when directory differs from canonical name
 */
const AGENT_DIRECTORY_MAPPINGS: Record<string, string> = {
  'postgres-schema-reader': 'schema-reader',
  'supabase-schema-reader': 'schema-reader',
  'context-continuity': 'continuity'
};

export default function AgentUpdateCard({ update, compact = false }: AgentUpdateCardProps): JSX.Element {
  const agentColor = getAgentTypeColor(update.agentName);

  // Format agent name for display
  const displayAgentName = update.agentName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Function to get the file path for display
  const getFilePath = () => {
    if (!update.reportFile) return '';
    const actualAgentDir = AGENT_DIRECTORY_MAPPINGS[update.agentName] || update.agentName;
    return `.claude/docs/tasks/${actualAgentDir}/${update.reportFile}`;
  };

  // Function to format description preserving line breaks
  const formatDescription = (text: string) => {
    // Split by " - " and create proper line breaks
    return text
      .split(' - ')
      .filter(segment => segment.trim())
      .map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && <br />}
          <span>• {segment.trim()}</span>
        </React.Fragment>
      ));
  };

  // Function to process markdown to HTML
  const processMarkdownToHTML = (markdown: string): string => {
    let html = markdown;

    // Process code blocks FIRST (before escaping HTML)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      // Apply syntax highlighting colors for common patterns
      let highlightedCode = code;

      // Escape HTML in code
      highlightedCode = highlightedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Highlight strings (both single and double quotes)
      highlightedCode = highlightedCode.replace(/"([^"\\]|\\.)*"/g, '<span class="string">"$1"</span>');
      highlightedCode = highlightedCode.replace(/'([^'\\]|\\.)*'/g, '<span class="string">\'$1\'</span>');

      // Highlight comments
      highlightedCode = highlightedCode.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
      highlightedCode = highlightedCode.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');

      // Highlight keywords
      const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static', 'get', 'set'];
      keywords.forEach(keyword => {
        highlightedCode = highlightedCode.replace(new RegExp(`\\b${keyword}\\b`, 'g'), `<span class="keyword">${keyword}</span>`);
      });

      // Highlight numbers
      highlightedCode = highlightedCode.replace(/\b\d+\b/g, '<span class="number">$&</span>');

      // Highlight property names in objects (key: value)
      highlightedCode = highlightedCode.replace(/(["\']?)(\w+)\1\s*:/g, '<span class="property">$1$2$1</span>:');

      const langClass = lang ? `language-${lang}` : '';
      return `<pre class="code-block ${langClass}"><code>${highlightedCode}</code></pre>`;
    });

    // Now escape HTML for the rest of the content
    html = html.replace(/```CODEBLOCK(\d+)```/g, (match, id) => match); // Preserve code block markers
    const codeBlocks: string[] = [];
    html = html.replace(/<pre class="code-block[^>]*>[\s\S]*?<\/pre>/g, (match) => {
      codeBlocks.push(match);
      return `\`\`\`CODEBLOCK${codeBlocks.length - 1}\`\`\``;
    });

    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Restore code blocks
    html = html.replace(/```CODEBLOCK(\d+)```/g, (match, id) => codeBlocks[parseInt(id)]);

    // Process headers (h1-h4)
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Process bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Process inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Process lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ordered">$2</li>');

    // Process blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Process horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Process links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Process line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-4]>)/g, '$1');
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<li)/g, '<ul>$1');
    html = html.replace(/(<\/li>)<\/p>/g, '$1</ul>');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

    return html;
  };

  // Function to copy file path to clipboard
  const handleCopyPath = async () => {
    const filePath = getFilePath();
    try {
      await navigator.clipboard.writeText(filePath);
      // Show brief visual feedback
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: select text for manual copy
      alert(`Copy this path:\n${filePath}`);
    }
  };

  const handleReportClick = async () => {
    if (update.reportFile) {
      try {
        const actualAgentDir = AGENT_DIRECTORY_MAPPINGS[update.agentName] || update.agentName;
        const filePath = getFilePath();

        // Try to fetch the report from static data directory
        const reportPath = `/data/reports/${actualAgentDir}/${update.reportFile}`;
        const response = await fetch(reportPath);

        if (response.ok) {
          const reportContent = await response.text();

          // Process markdown content to HTML
          const processedContent = processMarkdownToHTML(reportContent);

          // Open report in new window with enhanced markdown rendering
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            // Extract system prompt if this is a continuity report
            let systemPromptButton = '';
            let systemPromptScript = '';
            if (update.agentName === 'context-continuity' || update.agentName === 'continuity') {
              // Look for the System Prompt section - try new format first, fallback to old format
              // Use more specific regex to avoid matching code examples
              let systemPromptMatch = reportContent.match(/## System Prompt for Next Session\s*\n\n<!-- SYSTEM_PROMPT_START -->\s*([\s\S]*?)\s*<!-- SYSTEM_PROMPT_END -->/);
              let systemPrompt = '';

              if (systemPromptMatch) {
                // New format with HTML comment markers
                systemPrompt = systemPromptMatch[1].trim();
              } else {
                // Fallback to old format for backwards compatibility
                const oldFormatMatch = reportContent.match(/## System Prompt for Next Session[\s\S]*?(?=\n## |\n# |$)/);
                if (oldFormatMatch) {
                  systemPrompt = oldFormatMatch[0].replace(/## System Prompt for Next Session\s*/, '').trim();
                }
              }

              if (systemPrompt) {
                // Create the copy button
                systemPromptButton = `<button id="system-prompt-btn" class="system-prompt-button" onclick="copySystemPrompt()">📋 Copy System Prompt</button>`;

                // Create the script with the system prompt embedded as a variable
                systemPromptScript = `
                  <script>
                    window.systemPromptContent = ${JSON.stringify(systemPrompt)};
                    function copySystemPrompt() {
                      const button = document.getElementById('system-prompt-btn');
                      navigator.clipboard.writeText(window.systemPromptContent).then(() => {
                        button.textContent = '✓ System Prompt Copied';
                        setTimeout(() => button.textContent = '📋 Copy System Prompt', 2000);
                      }).catch(err => {
                        console.error('Failed to copy:', err);
                        alert('Failed to copy system prompt');
                      });
                    }
                  </script>
                `;
              }
            }

            // Write the complete HTML with inline styles and markdown processing
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${update.reportFile} - ${displayAgentName}</title>
                  <style>
                    body {
                      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                      max-width: 1200px;
                      margin: 0 auto;
                      padding: 0;
                      line-height: 1.6;
                      color: #e1e4e8;
                      background: #0d1117;
                    }
                    .header {
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      padding: 30px;
                      color: white;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
                    .header h1 {
                      margin: 0 0 15px 0;
                      font-size: 2rem;
                      font-weight: 700;
                      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .metadata {
                      display: flex;
                      gap: 20px;
                      align-items: center;
                      margin-bottom: 20px;
                    }
                    .agent-badge {
                      background: rgba(255, 255, 255, 0.2);
                      padding: 6px 12px;
                      border-radius: 20px;
                      font-size: 0.9rem;
                      font-weight: 600;
                      backdrop-filter: blur(10px);
                    }
                    .date {
                      font-size: 0.9rem;
                      opacity: 0.9;
                    }
                    .file-path {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      background: rgba(255, 255, 255, 0.15);
                      padding: 12px 16px;
                      border-radius: 8px;
                      backdrop-filter: blur(10px);
                    }
                    .file-path-label {
                      font-weight: 600;
                      font-size: 0.9rem;
                    }
                    .file-path-value {
                      flex: 1;
                      font-family: 'Monaco', 'Menlo', monospace;
                      background: rgba(0, 0, 0, 0.2);
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 0.85rem;
                    }
                    .copy-button {
                      background: rgba(255, 255, 255, 0.25);
                      border: 1px solid rgba(255, 255, 255, 0.3);
                      color: white;
                      padding: 6px 12px;
                      border-radius: 6px;
                      font-size: 0.85rem;
                      font-weight: 600;
                      cursor: pointer;
                    }
                    .copy-button:hover {
                      background: rgba(255, 255, 255, 0.35);
                    }
                    .system-prompt-button {
                      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      color: white;
                      padding: 6px 12px;
                      border-radius: 6px;
                      font-size: 0.85rem;
                      font-weight: 600;
                      cursor: pointer;
                      margin-left: auto;
                      transition: all 0.2s ease;
                      box-shadow: 0 2px 6px rgba(255, 107, 53, 0.2);
                    }
                    .system-prompt-button:hover {
                      transform: translateY(-2px);
                      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.5);
                    }
                    .content {
                      padding: 30px;
                      background: #0d1117;
                    }
                    h1 { color: #58a6ff; border-bottom: 2px solid #30363d; padding-bottom: 8px; margin: 30px 0 16px 0; }
                    h2 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 6px; margin: 24px 0 12px 0; }
                    h3 { color: #58a6ff; margin: 20px 0 10px 0; }
                    h4 { color: #58a6ff; margin: 16px 0 8px 0; }
                    code {
                      background: #161b22;
                      color: #79c0ff;
                      padding: 2px 6px;
                      border-radius: 4px;
                      font-family: 'Monaco', 'Menlo', monospace;
                      font-size: 0.9em;
                      border: 1px solid #30363d;
                    }
                    pre, .code-block {
                      background: #161b22;
                      border: 1px solid #30363d;
                      border-radius: 8px;
                      padding: 16px;
                      overflow-x: auto;
                      line-height: 1.5;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                    pre code, .code-block code {
                      background: none;
                      border: none;
                      padding: 0;
                      color: #e1e4e8;
                    }
                    /* Syntax highlighting colors */
                    .code-block .string {
                      color: #a5d6ff;
                    }
                    .code-block .keyword {
                      color: #ff7b72;
                    }
                    .code-block .comment {
                      color: #8b949e;
                      font-style: italic;
                    }
                    .code-block .number {
                      color: #79c0ff;
                    }
                    .code-block .property {
                      color: #7ee83f;
                    }
                    blockquote {
                      color: #8b949e;
                      border-left: 4px solid #58a6ff;
                      padding: 12px 16px;
                      margin: 16px 0;
                      background: #161b22;
                      border-radius: 0 6px 6px 0;
                      font-style: italic;
                    }
                    ul, ol {
                      margin: 12px 0;
                      padding-left: 30px;
                    }
                    li {
                      margin: 6px 0;
                    }
                    hr {
                      border: none;
                      border-top: 2px solid #30363d;
                      margin: 24px 0;
                    }
                    p { margin: 12px 0; color: #e1e4e8; }
                    strong { font-weight: 600; color: #f0f6fc; }
                    em { font-style: italic; color: #e1e4e8; }
                    a { color: #58a6ff; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>${update.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
                    <div class="metadata">
                      <span class="agent-badge">${displayAgentName}</span>
                      <span class="date">${update.parsedDate.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      ${systemPromptButton}
                    </div>
                    <div class="file-path">
                      <span class="file-path-label">File Path:</span>
                      <code class="file-path-value">${filePath}</code>
                      <button class="copy-button" onclick="navigator.clipboard.writeText('${filePath}').then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = '📋 Copy', 1000); })">📋 Copy</button>
                    </div>
                  </div>
                  <div class="content">
                    ${processedContent}
                  </div>
                  ${systemPromptScript}
                </body>
              </html>
            `);
            newWindow.document.close();
          }
        } else {
          // Fallback: show report location info
          alert('Report: ' + update.reportFile + '\n\nLocation: ' + filePath + '\n\nThis report contains detailed findings from the ' + displayAgentName + ' agent.\n\nNote: Report file not yet available in dashboard.');
        }
      } catch (error) {
        console.error('Error loading report:', error);
        // Fallback: show report location info
        alert('Report: ' + update.reportFile + '\n\nLocation: ' + getFilePath() + '\n\nThis report contains detailed findings from the ' + displayAgentName + ' agent.\n\nNote: Report file not yet available in dashboard.');
      }
    }
  };

  return (
    <div
      className={`${styles.card} ${compact ? styles.compact : ''}`}
      style={{ '--agent-color': agentColor } as React.CSSProperties}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{update.title}</h3>
          <div className={styles.metadata}>
            <span
              className={styles.agentBadge}
              style={{ backgroundColor: agentColor }}
            >
              {displayAgentName}
            </span>
            <span className={styles.timestamp}>
              {formatRelativeTime(update.parsedDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <div className={styles.description}>
          <p>{formatDescription(update.description)}</p>
        </div>
      )}

      {/* Commit Message (for git-commit entries) */}
      {!compact && update.commitMessage && update.agentName === 'git-commit' && (
        <div className={styles.commitMessage}>
          <div className={styles.commitMessageLabel}>Commit Message:</div>
          <pre className={styles.commitMessageContent}>{update.commitMessage}</pre>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.dateInfo}>
          <span className={styles.fullDate}>
            {update.parsedDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {update.reportFile && (
          <div className={styles.reportActions}>
            <div className={styles.filePath}>
              <span className={styles.filePathText}>{getFilePath()}</span>
              <button
                className={styles.copyButton}
                onClick={handleCopyPath}
                title="Copy file path to clipboard"
              >
                📋
              </button>
            </div>
            <button
              className={styles.reportButton}
              onClick={handleReportClick}
              title={`View ${update.reportFile}`}
            >
              📄 View Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}