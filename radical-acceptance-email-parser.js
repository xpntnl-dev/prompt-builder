/**
 * Radical Acceptance Guide Email Parser
 * Version: 1.0.0
 * Date: 31 Oct 2025
 *
 * Purpose: Formats Radical Acceptance Guide output for email preview
 * Dependencies: None - pure JavaScript for n8n Code node
 *
 * FEATURES:
 * - Parses Lojong teaching structure (3-part format)
 * - Renders teaching content with proper formatting
 * - Displays slogan information prominently
 * - User context integration display
 * - Email subject line preview
 * - Development dashboard with metadata
 */

// Get the AI output - handle different input formats
let inputData = $json;

// IMPORTANT: The AI agent returns email_content and email_subject
// But we need slogan_number, slogan_text, and user_context from PREVIOUS nodes
// These should be passed through from earlier in the workflow

let aiOutput = {
  email_content: inputData.email_content || inputData.output?.email_content || '',
  email_subject: inputData.email_subject || inputData.output?.email_subject || ''
};

// Get n8n execution context
let executionId = $execution.id || 'N/A';
let workflowId = $workflow.id || 'N/A';
let n8nUrl = 'https://n8n.xpntnl.com';
let executionUrl = executionId !== 'N/A' && workflowId !== 'N/A'
  ? `${n8nUrl}/workflow/${workflowId}/executions/${executionId}`
  : null;

// Get workflow metadata from Set Fields node (must be passed from earlier node)
let workflowMetadata = {
  workflow_name: inputData.workflow_name || 'N/A',
  prompt_name: inputData.prompt_name || 'N/A',
  version_tag: inputData.version_tag || 'N/A',
  version_number: inputData.version_number || 'N/A',
  model_provider: inputData.model_provider || 'N/A',
  model_name: inputData.model_name || 'N/A',
  is_published: inputData.is_published ? 'Published' : 'Draft'
};

// Get teaching context (MUST be passed from the node that triggers the AI agent)
let teachingContext = {
  slogan_number: inputData.slogan_number || 'N/A',
  slogan_text: inputData.slogan_text || 'N/A',
  user_context: inputData.context || inputData.user_context || 'N/A'
};

// Enhanced markdown-to-HTML converter
function markdownToHtml(markdown) {
  if (!markdown) return '';

  const text = String(markdown).trim();
  if (!text) return '';

  let html = text;

  // 1. Extract and protect code blocks
  const codeBlocks = [];
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (_match, _lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    codeBlocks.push(`<pre style="background: #f5f5f5; color: #333; padding: 15px; border: 1px solid #ddd; border-radius: 6px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.4; margin: 15px 0; max-width: 100%; word-wrap: break-word; white-space: pre-wrap;"><code>${code.trim()}</code></pre>`);
    return placeholder;
  });

  // 2. Headers
  html = html
    .replace(/^### (.*$)/gim, '<h3 style="color: #333; margin: 20px 0 10px 0; font-size: 20px; font-weight: 600; line-height: 1.3;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #333; margin: 25px 0 15px 0; font-size: 24px; font-weight: 600; line-height: 1.3;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #333; margin: 30px 0 20px 0; font-size: 28px; font-weight: 600; line-height: 1.3;">$1</h1>');

  // 3. Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color: #4A90E2; text-decoration: underline; word-break: break-word;">$1</a>');

  // 4. Bold and italic
  html = html
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>');

  // 5. Paragraphs and line breaks
  html = html
    .replace(/\n\n+/g, '</p><p style="margin: 15px 0; line-height: 1.8; color: #333; max-width: 100%; word-wrap: break-word;">')
    .replace(/\n/g, '<br>');

  // 6. Wrap in paragraph if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<pre') && !html.startsWith('<p')) {
    html = `<p style="margin: 15px 0; line-height: 1.8; color: #333; max-width: 100%; word-wrap: break-word;">${html}</p>`;
  }

  // 7. Restore code blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace(`___CODE_BLOCK_${index}___`, block);
  });

  return html;
}

// Format date and time
const now = new Date();
const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

// Word count calculator
function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

// Calculate teaching word count
const teachingWordCount = getWordCount(aiOutput.email_content || '');

// Build email subject
const emailSubject = aiOutput.email_subject || `Slogan ${teachingContext.slogan_number}: ${teachingContext.slogan_text}`;

// Build development dashboard
const dashboardFooter = `
  <div style="margin-top: 30px; padding: 20px; background: #2c3e50; border-radius: 8px; color: white;">
    <h3 style="margin: 0 0 15px 0; color: #ecf0f1; text-align: center; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">🔧 Development Dashboard</h3>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
      <div style="background: #34495e; padding: 15px; border-radius: 6px; border-left: 3px solid #8e44ad;">
        <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase; margin-bottom: 8px;">Workflow</div>
        <div style="font-size: 14px; font-weight: bold; color: #ecf0f1; margin-bottom: 4px;">${workflowMetadata.workflow_name}</div>
        <div style="font-size: 12px; color: #bdc3c7;">Prompt: ${workflowMetadata.prompt_name}</div>
      </div>

      <div style="background: #34495e; padding: 15px; border-radius: 6px; border-left: 3px solid #e67e22;">
        <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase; margin-bottom: 8px;">Version</div>
        <div style="font-size: 14px; font-weight: bold; color: #ecf0f1; margin-bottom: 4px;">${workflowMetadata.version_tag}</div>
        <div style="font-size: 12px; color: #bdc3c7;">#${workflowMetadata.version_number} • ${workflowMetadata.is_published}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
      <div style="background: #34495e; padding: 15px; border-radius: 6px; border-left: 3px solid #3498db;">
        <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase; margin-bottom: 8px;">Model</div>
        <div style="font-size: 14px; font-weight: bold; color: #ecf0f1; margin-bottom: 4px;">${workflowMetadata.model_provider}</div>
        <div style="font-size: 12px; color: #ecf0f1;">${workflowMetadata.model_name}</div>
      </div>

      <div style="background: #34495e; padding: 15px; border-radius: 6px; border-left: 3px solid #2ecc71;">
        <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase; margin-bottom: 8px;">Teaching Stats</div>
        <div style="font-size: 14px; font-weight: bold; color: #ecf0f1; margin-bottom: 4px;">${teachingWordCount} words</div>
        <div style="font-size: 12px; color: #bdc3c7;">Target: 400-500 words</div>
      </div>
    </div>

    <div style="background: #34495e; padding: 15px; border-radius: 6px; border-left: 3px solid #f39c12; margin-bottom: 15px;">
      <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase; margin-bottom: 8px;">Slogan Context</div>
      <div style="margin-bottom: 8px;">
        <div style="font-size: 10px; color: #95a5a6;">Slogan Number</div>
        <div style="font-size: 13px; color: #ecf0f1;">#${teachingContext.slogan_number}</div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="font-size: 10px; color: #95a5a6;">Slogan Text</div>
        <div style="font-size: 13px; color: #ecf0f1;">${teachingContext.slogan_text}</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #95a5a6;">User Context</div>
        <div style="font-size: 11px; color: #bdc3c7; line-height: 1.4;">${teachingContext.user_context}</div>
      </div>
    </div>

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #34495e; text-align: center;">
      <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">
        Teaching Generated: ${formattedDate} ${formattedTime} • radical_acceptance_parser v1.0.0
      </div>
      ${executionUrl ? `
      <div style="margin-top: 8px;">
        <a href="${executionUrl}" style="display: inline-block; padding: 6px 12px; background: #8e44ad; color: white; text-decoration: none; border-radius: 4px; font-size: 11px; font-weight: bold;">🔍 View Execution in n8n</a>
      </div>
      ` : ''}
    </div>
  </div>
`;

// Complete email HTML
const emailContent = `
  <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
    <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

      <!-- Teaching Header -->
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 2px solid #8e44ad;">
        <div style="display: inline-block; padding: 6px 14px; background: #8e44ad; color: white; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">RADICAL ACCEPTANCE GUIDE</div>
        <h1 style="color: #2c3e50; margin: 0 0 8px 0; font-size: 28px; line-height: 1.3; font-weight: 600;">${emailSubject}</h1>
        <div style="color: #7f8c8d; font-size: 14px; font-style: italic;">
          Slogan ${teachingContext.slogan_number} of 59: ${teachingContext.slogan_text}
        </div>
      </div>

      <!-- User Context Display (if provided) -->
      ${teachingContext.user_context && teachingContext.user_context !== 'N/A' ? `
      <div style="margin: 0 0 30px 0; padding: 20px; background: #ecf0f1; border-left: 4px solid #95a5a6; border-radius: 4px;">
        <div style="font-size: 12px; color: #7f8c8d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Today's Context</div>
        <div style="color: #2c3e50; font-size: 15px; line-height: 1.6; font-style: italic;">
          ${teachingContext.user_context}
        </div>
      </div>
      ` : ''}

      <!-- Main Teaching Content -->
      <div style="margin: 30px 0; color: #2c3e50; line-height: 1.8; font-size: 17px;">
        ${markdownToHtml(aiOutput.email_content || 'No teaching content available')}
      </div>

      <!-- Practice Callout (if "Today's Practice" is found in content) -->
      ${(aiOutput.email_content || '').includes("Today's Practice") || (aiOutput.email_content || '').includes("**Today's Practice**") ? `
      <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); border-radius: 8px; color: white; text-align: center;">
        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; opacity: 0.9;">Remember</div>
        <div style="font-size: 18px; font-weight: 600; line-height: 1.5;">
          Practice this teaching in your daily life today
        </div>
      </div>
      ` : ''}

      <!-- Email Subject Line Preview -->
      <div style="margin: 40px 0 0 0; padding: 20px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #8e44ad;">
        <div style="font-size: 11px; color: #7f8c8d; text-transform: uppercase; font-weight: bold; margin-bottom: 10px;">📧 Email Subject Line</div>
        <div style="font-size: 16px; color: #2c3e50; font-weight: 600;">${emailSubject}</div>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

      ${dashboardFooter}
    </div>
  </div>
`;

return {
  json: {
    emailSubject: emailSubject,
    emailContent: emailContent,
    slogan_number: teachingContext.slogan_number,
    slogan_text: teachingContext.slogan_text,
    word_count: teachingWordCount,
    word_count_status: teachingWordCount >= 400 && teachingWordCount <= 500 ? 'Within target' : teachingWordCount < 400 ? 'Below target' : 'Above target',
    model_used: workflowMetadata.model_name,
    parser_version: '1.0.0',
    workflow_metadata: workflowMetadata,
    teaching_context: teachingContext,
    execution_info: {
      execution_id: executionId,
      workflow_id: workflowId,
      execution_url: executionUrl
    },
    debug: {
      parsedSuccessfully: true,
      workflowMetadataRetrieved: workflowMetadata.workflow_name !== 'N/A',
      teachingContextRetrieved: teachingContext.slogan_number !== 'N/A',
      wordCountValid: teachingWordCount >= 400 && teachingWordCount <= 500
    }
  }
};
