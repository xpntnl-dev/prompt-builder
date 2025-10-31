// ============================================
// n8n Code Node: Transform Database Config + Agent Output
// ============================================
// Purpose: Merge podcast config from database with agent-generated content
// Input Nodes:
//   - Postgres Node (database_output_podconfig.json)
//   - Previous Node (podcast_Agent_output.json)
// Output: Formatted payload for Flask API (podcast_http_payload_working.json format)
// ============================================

// Get the database config (from getPodcastConfig postgres node)
const dbConfig = $('getPodcastConfig').first().json;

// Get the agent output (from podcastTransform code node)
const agentOutput = $('podcastTransform').first().json;

// Extract content and metadata from agent output
const content = agentOutput.payload?.content || agentOutput.content || '';
const agentMetadata = agentOutput.payload?.metadata || agentOutput.metadata || {};
const transformInfo = agentOutput.transform_info || {};

// Build the podcast_config object from database fields
const podcastConfig = {
  // Basic Configuration
  word_count: null,  // Not in DB, set if needed from content analysis

  // LLM Configuration
  llm_model_name: dbConfig.llm_model || 'gpt-4o-mini',
  llm_provider: dbConfig.llm_provider || 'openai',
  api_key_label: dbConfig.llm_provider ? `${dbConfig.llm_provider.toUpperCase()}_API_KEY` : 'OPENAI_API_KEY',

  // Creativity/Temperature
  creativity: dbConfig.llm_creativity !== null ? parseFloat(dbConfig.llm_creativity) : 0.7,
  conversation_config: {
    creativity: dbConfig.llm_creativity !== null ? parseFloat(dbConfig.llm_creativity) : 0.7
  },

  // Conversation Settings
  conversation_style: dbConfig.conversation_style || ['engaging', 'enthusiastic', 'educational'],
  roles_person1: dbConfig.roles_person1 || 'main summarizer',
  roles_person2: dbConfig.roles_person2 || 'questioner/clarifier',
  dialogue_structure: dbConfig.dialogue_structure || [
    'Introduction',
    'Main Content Summary',
    'Key Insights',
    'Practical Applications',
    'Conclusion'
  ],
  engagement_techniques: dbConfig.engagement_techniques || [
    'rhetorical questions',
    'vivid descriptions',
    'enthusiasm',
    'real-world examples'
  ],

  // Branding
  podcast_name: dbConfig.podcast_name || 'EUROPA Daily Brief',
  podcast_tagline: dbConfig.podcast_tagline || null,
  output_language: dbConfig.output_language || 'English',
  ending_message: dbConfig.ending_message || 'Bye Bye!',

  // Custom Instructions
  user_instructions: dbConfig.user_instructions || '',

  // Long-form Settings
  longform_config: {
    max_num_chunks: dbConfig.max_num_chunks || 8,
    min_chunk_size: dbConfig.min_chunk_size || 600
  },

  // Text-to-Speech Configuration
  text_to_speech: {
    default_tts_model: dbConfig.tts_model || 'tts-1-hd',
    default_tts_provider: dbConfig.tts_provider || 'openai',
    audio_format: dbConfig.audio_format || 'mp3',
    temp_audio_dir: 'temp/',
    ending_message: dbConfig.ending_message || 'Bye Bye!',
    output_directories: {
      audio: 'data/audio',
      transcripts: 'data/transcripts',
      metadata: 'data/metadata'
    }
  },

  // TTS Voices
  question_answer_format: true,
  text_to_speech_voices: {
    question: dbConfig.voice_person1 || 'onyx',
    answer: dbConfig.voice_person2 || 'echo'
  }
};

// Build the complete payload matching the working format
const payload = {
  payload: {
    content: content,
    metadata: {
      name: transformInfo.slug || agentMetadata.name || 'untitled',
      execution_id: transformInfo.execution_id || agentMetadata.execution_id || '',
      title: transformInfo.title || agentMetadata.title || 'Untitled',
      workflow_name: agentMetadata.workflow_name || 'podcast-generator',
      model_used: agentMetadata.model_used || 'claude-sonnet-4.5',
      version: agentMetadata.version || 'v1.0',
      timestamp: agentMetadata.timestamp || new Date().toISOString(),
      podcast_config: podcastConfig,
      config_type: dbConfig.config_type || 'custom'
    }
  },
  config_injection: {
    config_type_selected: dbConfig.config_type || 'custom',
    config_applied: true,
    voices_used: {
      question: dbConfig.voice_person1 || 'onyx',
      answer: dbConfig.voice_person2 || 'echo'
    },
    podcast_name: dbConfig.podcast_name || 'EUROPA Daily Brief',
    injector_version: '1.0.0'
  },
  transform_info: {
    content_length: content.length,
    slug: transformInfo.slug || agentMetadata.name || 'untitled',
    title: transformInfo.title || agentMetadata.title || 'Untitled',
    execution_id: transformInfo.execution_id || agentMetadata.execution_id || '',
    workflow_id: transformInfo.workflow_id || '',
    transformer_version: transformInfo.transformer_version || '1.0.0'
  },
  ready_for_api: true
};

// Return the formatted payload
return payload;
