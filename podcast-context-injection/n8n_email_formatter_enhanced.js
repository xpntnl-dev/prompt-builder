// ============================================
// n8n Email Formatter - Enhanced with ALL Podcast Params
// ============================================
// Purpose: Create detailed email notification with complete podcast configuration
// ============================================

// Extract the first item from the input array
const item = $input.all()[0].json;

// Get the upstream node data
const upstreamData = $('injectPodcastConfig').first().json;

// Extract metadata from upstream node
const metadata = upstreamData.payload.metadata;
const configInjection = upstreamData.config_injection;
const transformInfo = upstreamData.transform_info;
const podcastConfig = metadata.podcast_config;

// Helper function to format arrays
const formatArray = (arr) => arr && arr.length > 0 ? arr.join(', ') : 'Not specified';

// Helper function to format boolean
const formatBool = (val) => val ? 'Yes' : 'No';

// Create email subject
const emailSubject = `✅ Podcast Created: ${metadata.title}`;

// Create detailed email body with ALL parameters
const emailContent = `
Hi there,

Your podcast episode has been successfully created with the following configuration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📻 EPISODE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: ${metadata.title}

Slug: ${transformInfo.slug}

Content Length: ${transformInfo.content_length.toLocaleString()} characters

Word Count: ${podcastConfig.word_count || 'Auto-calculated'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎙️ PODCAST BRANDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Podcast Name: ${podcastConfig.podcast_name}

Tagline: ${podcastConfig.podcast_tagline || 'None'}

Output Language: ${podcastConfig.output_language}

Ending Message: "${podcastConfig.ending_message}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 LLM CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: ${podcastConfig.llm_model_name}

Provider: ${podcastConfig.llm_provider}

API Key: ${podcastConfig.api_key_label}

Creativity Level: ${podcastConfig.creativity} / 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 CONVERSATION DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Speaker 1 Role: ${podcastConfig.roles_person1}

Speaker 2 Role: ${podcastConfig.roles_person2}

Conversation Style: ${formatArray(podcastConfig.conversation_style)}

Dialogue Structure:
${podcastConfig.dialogue_structure ? podcastConfig.dialogue_structure.map((s, i) => `  ${i + 1}. ${s}`).join('\n') : '  Not specified'}

Engagement Techniques: ${formatArray(podcastConfig.engagement_techniques)}

${podcastConfig.user_instructions ? `\nCustom Instructions:\n"${podcastConfig.user_instructions}"\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔊 TEXT-TO-SPEECH CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TTS Provider: ${podcastConfig.text_to_speech.default_tts_provider.toUpperCase()}

TTS Model: ${podcastConfig.text_to_speech.default_tts_model}

Audio Format: ${podcastConfig.text_to_speech.audio_format.toUpperCase()}

Voice Configuration:
  • Question (${podcastConfig.roles_person1}): ${podcastConfig.text_to_speech_voices.question}
  • Answer (${podcastConfig.roles_person2}): ${podcastConfig.text_to_speech_voices.answer}

Question/Answer Format: ${formatBool(podcastConfig.question_answer_format)}

Output Directories:
  • Audio: ${podcastConfig.text_to_speech.output_directories.audio}
  • Transcripts: ${podcastConfig.text_to_speech.output_directories.transcripts}
  • Metadata: ${podcastConfig.text_to_speech.output_directories.metadata}
  • Temp: ${podcastConfig.text_to_speech.temp_audio_dir}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 LONG-FORM CONTENT SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Maximum Chunks: ${podcastConfig.longform_config.max_num_chunks}

Minimum Chunk Size: ${podcastConfig.longform_config.min_chunk_size} characters

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 WORKFLOW METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execution ID: ${metadata.execution_id}

Workflow Name: ${metadata.workflow_name}

Workflow ID: ${transformInfo.workflow_id}

View Execution in n8n:
🔗 https://n8n.xpntnl.com/workflow/${transformInfo.workflow_id}/executions/${metadata.execution_id}

LLM Model Used: ${metadata.model_used}

API Version: ${metadata.version}

Timestamp: ${new Date(metadata.timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ CONFIG INJECTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Config Type: ${configInjection.config_type_selected}

Config Applied: ${formatBool(configInjection.config_applied)}

Podcast Name (from config): ${configInjection.podcast_name}

Injector Version: ${configInjection.injector_version}

Transformer Version: ${transformInfo.transformer_version}

Voices Used:
  • Question: ${configInjection.voices_used.question}
  • Answer: ${configInjection.voices_used.answer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Your podcast is ready for the next step in your workflow!

This email contains the complete configuration that was used to generate your podcast episode.

Best regards,
Revok Records Automation 🎵
`.trim();

// Return formatted output
return {
  emailSubject: emailSubject,
  emailContent: emailContent,
  // Also return structured data for potential use in other nodes
  metadata: {
    title: metadata.title,
    slug: transformInfo.slug,
    execution_id: metadata.execution_id,
    podcast_name: podcastConfig.podcast_name,
    config_type: configInjection.config_type_selected,
    timestamp: metadata.timestamp
  }
};
