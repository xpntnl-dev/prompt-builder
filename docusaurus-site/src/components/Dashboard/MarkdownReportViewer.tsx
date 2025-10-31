import React, { useEffect, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import styles from './MarkdownReportViewer.module.css';

interface MarkdownReportViewerProps {
  content: string;
  title: string;
  agentName: string;
  filePath: string;
  date: Date;
}

export default function MarkdownReportViewer({
  content,
  title,
  agentName,
  filePath,
  date
}: MarkdownReportViewerProps): JSX.Element {
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Process the markdown content to handle different elements
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    lines.forEach((line, index) => {
      // Check for code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Starting a code block
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim() || 'text';
          codeBlockContent = [];
        } else {
          // Ending a code block
          inCodeBlock = false;
          const code = codeBlockContent.join('\n');
          elements.push(
            <div key={`code-${index}`} className={styles.codeBlock}>
              <Highlight
                theme={themes.nightOwl}
                code={code}
                language={codeBlockLanguage as any}
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre className={className} style={style}>
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          );
        }
      } else if (inCodeBlock) {
        codeBlockContent.push(line);
      } else {
        // Process regular markdown elements
        if (line.startsWith('# ')) {
          elements.push(<h1 key={index} className={styles.h1}>{line.slice(2)}</h1>);
        } else if (line.startsWith('## ')) {
          elements.push(<h2 key={index} className={styles.h2}>{line.slice(3)}</h2>);
        } else if (line.startsWith('### ')) {
          elements.push(<h3 key={index} className={styles.h3}>{line.slice(4)}</h3>);
        } else if (line.startsWith('#### ')) {
          elements.push(<h4 key={index} className={styles.h4}>{line.slice(5)}</h4>);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          elements.push(
            <li key={index} className={styles.listItem}>
              {processInlineMarkdown(line.slice(2))}
            </li>
          );
        } else if (line.match(/^\d+\.\s/)) {
          elements.push(
            <li key={index} className={styles.orderedListItem}>
              {processInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
            </li>
          );
        } else if (line.startsWith('> ')) {
          elements.push(
            <blockquote key={index} className={styles.blockquote}>
              {processInlineMarkdown(line.slice(2))}
            </blockquote>
          );
        } else if (line.startsWith('---') || line.startsWith('***')) {
          elements.push(<hr key={index} className={styles.divider} />);
        } else if (line.trim()) {
          elements.push(
            <p key={index} className={styles.paragraph}>
              {processInlineMarkdown(line)}
            </p>
          );
        } else {
          elements.push(<br key={index} />);
        }
      }
    });

    setProcessedContent(elements);
  }, [content]);

  // Process inline markdown like **bold**, *italic*, `code`
  const processInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Process inline code first
    const codeRegex = /`([^`]+)`/g;
    let match;
    let lastIndex = 0;

    while ((match = codeRegex.exec(text)) !== null) {
      // Add text before code
      if (match.index > lastIndex) {
        parts.push(processBoldItalic(text.slice(lastIndex, match.index), key++));
      }
      // Add code
      parts.push(
        <code key={key++} className={styles.inlineCode}>
          {match[1]}
        </code>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(processBoldItalic(text.slice(lastIndex), key++));
    }

    return parts.length > 0 ? parts : text;
  };

  const processBoldItalic = (text: string, baseKey: number): React.ReactNode => {
    // Process bold and italic
    let processed = text;

    // Bold
    processed = processed.replace(/\*\*(.+?)\*\*/g, (_, content) =>
      `<strong>${content}</strong>`
    );

    // Italic
    processed = processed.replace(/\*(.+?)\*/g, (_, content) =>
      `<em>${content}</em>`
    );

    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );

    if (processed !== text) {
      return <span key={baseKey} dangerouslySetInnerHTML={{ __html: processed }} />;
    }

    return text;
  };

  return (
    <div className={styles.viewer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.metadata}>
          <span className={styles.agent}>{agentName}</span>
          <span className={styles.date}>
            {date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className={styles.filePath}>
          <span className={styles.filePathLabel}>File Path:</span>
          <code className={styles.filePathValue}>{filePath}</code>
          <button
            className={styles.copyButton}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(filePath);
                const button = document.activeElement as HTMLButtonElement;
                if (button) {
                  const originalText = button.textContent;
                  button.textContent = '✓ Copied';
                  setTimeout(() => {
                    button.textContent = originalText;
                  }, 1000);
                }
              } catch (error) {
                console.error('Failed to copy:', error);
              }
            }}
          >
            📋 Copy
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {processedContent}
      </div>
    </div>
  );
}