import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Podcast, PodcastConfig } from '$lib/types';
import type { ModelPricingDisplay } from '$lib/types/openrouter';
import { getModelsForDropdown } from '$lib/server/openrouter';

export const load: PageServerLoad = async ({ params }) => {
	const { data: config, error: configError } = await supabase
		.from('podcast_configs')
		.select('*')
		.eq('id', params.id)
		.single();

	if (configError || !config) {
		throw error(404, 'Podcast configuration not found');
	}

	// Load parent podcast
	const { data: podcast } = await supabase
		.from('podcasts')
		.select('*')
		.eq('id', (config as PodcastConfig).podcast_id)
		.single();

	// Load available models from OpenRouter API (same as prompt editor)
	let models: ModelPricingDisplay[] = [];
	try {
		models = await getModelsForDropdown();
		console.log(`[Podcast Config] Loaded ${models.length} models from OpenRouter`);
	} catch (err) {
		console.error('[Podcast Config] Failed to load models from OpenRouter:', err);
	}

	return {
		config: config as PodcastConfig,
		podcast: podcast as Podcast | null,
		models
	};
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const { error: deleteError } = await supabase
			.from('podcast_configs')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Error deleting podcast config:', deleteError);
			return fail(500, { error: `Failed to delete configuration: ${deleteError.message}` });
		}

		throw redirect(303, '/podcasts/configs');
	},

	toggleActive: async ({ params }) => {
		// Get current config
		const { data: config } = await supabase
			.from('podcast_configs')
			.select('is_active')
			.eq('id', params.id)
			.single();

		if (!config) {
			return fail(404, { error: 'Configuration not found' });
		}

		// Toggle active state
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				is_active: !config.is_active,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error toggling active state:', updateError);
			return fail(500, { error: `Failed to update configuration: ${updateError.message}` });
		}

		return { success: true };
	},

	updateLLMAndTTS: async ({ request, params }) => {
		const formData = await request.formData();

		// LLM fields
		const model_id = formData.get('model_id') as string;
		const creativityStr = formData.get('llm_creativity') as string;

		// TTS fields
		const tts_provider = formData.get('tts_provider') as string;
		const tts_model = formData.get('tts_model') as string;
		const voice_person1 = formData.get('voice_person1') as string;
		const voice_person2 = formData.get('voice_person2') as string;
		const audio_format = formData.get('audio_format') as string;

		// Validate required TTS fields
		if (!tts_provider || !audio_format) {
			return fail(400, { error: 'TTS provider and audio format are required' });
		}

		// Parse LLM model details if model_id provided
		let llm_provider: string | null = null;
		let llm_model: string | null = null;

		if (model_id) {
			// First try to get from database
			const { data: model, error: modelError } = await supabase
				.from('available_models')
				.select('provider, model_name')
				.eq('id', model_id)
				.single();

			if (!modelError && model) {
				llm_provider = model.provider;
				llm_model = model.model_name;
			} else {
				// Fallback: parse the model_id directly (format: "provider/model")
				const parts = model_id.split('/');
				if (parts.length === 2) {
					llm_provider = parts[0];
					llm_model = parts[1];
				}
			}
		}

		// Parse and validate creativity value
		const llm_creativity = creativityStr ? parseFloat(creativityStr) : null;

		if (llm_creativity !== null && (llm_creativity < 0 || llm_creativity > 1)) {
			return fail(400, { error: 'Creativity must be between 0.0 and 1.0' });
		}

		// Update config with all LLM and TTS fields
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				llm_provider,
				llm_model,
				llm_creativity,
				tts_provider,
				tts_model: tts_model || null,
				voice_person1: voice_person1 || null,
				voice_person2: voice_person2 || null,
				audio_format,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating LLM and TTS configuration:', updateError);
			return fail(500, { error: `Failed to update configuration: ${updateError.message}` });
		}

		return { success: true };
	},

	updateBasic: async ({ request, params }) => {
		const formData = await request.formData();
		const config_name = formData.get('config_name') as string;
		const config_type = formData.get('config_type') as string;
		const description = formData.get('description') as string;

		// Validate required fields
		if (!config_name || !config_type) {
			return fail(400, { error: 'Configuration name and type are required' });
		}

		// Validate config_type is valid enum value
		const validTypes = ['tech_startup', 'music_creative', 'educational', 'storytelling', 'debate', 'custom'];
		if (!validTypes.includes(config_type)) {
			return fail(400, { error: 'Invalid configuration type' });
		}

		// Update database
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				config_name,
				config_type,
				description: description || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating basic info:', updateError);
			return fail(500, { error: `Failed to update configuration: ${updateError.message}` });
		}

		return { success: true };
	},

	updateBranding: async ({ request, params }) => {
		const formData = await request.formData();
		const podcast_name = formData.get('podcast_name') as string;
		const podcast_tagline = formData.get('podcast_tagline') as string;
		const output_language = formData.get('output_language') as string;
		const ending_message = formData.get('ending_message') as string;

		// Validate required fields
		if (!podcast_name || !output_language) {
			return fail(400, { error: 'Podcast name and output language are required' });
		}

		if (!ending_message) {
			return fail(400, { error: 'Ending message is required' });
		}

		// Update database
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				podcast_name,
				podcast_tagline: podcast_tagline || null,
				output_language,
				ending_message,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating branding:', updateError);
			return fail(500, { error: `Failed to update branding: ${updateError.message}` });
		}

		return { success: true };
	},

	updateConversation: async ({ request, params }) => {
		const formData = await request.formData();
		const roles_person1 = formData.get('roles_person1') as string;
		const roles_person2 = formData.get('roles_person2') as string;
		const conversation_style_raw = formData.get('conversation_style') as string;
		const dialogue_structure_raw = formData.get('dialogue_structure') as string;

		// Parse JSONB arrays from comma-separated strings
		let conversation_style = null;
		let dialogue_structure = null;

		if (conversation_style_raw && conversation_style_raw.trim()) {
			conversation_style = conversation_style_raw
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
		}

		if (dialogue_structure_raw && dialogue_structure_raw.trim()) {
			dialogue_structure = dialogue_structure_raw
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
		}

		// Update database
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				roles_person1: roles_person1 || null,
				roles_person2: roles_person2 || null,
				conversation_style,
				dialogue_structure,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating conversation settings:', updateError);
			return fail(500, { error: `Failed to update conversation settings: ${updateError.message}` });
		}

		return { success: true };
	},

	updateEngagement: async ({ request, params }) => {
		const formData = await request.formData();
		const engagement_techniques_raw = formData.get('engagement_techniques') as string;
		const user_instructions = formData.get('user_instructions') as string;

		// Parse JSONB array from comma-separated string
		let engagement_techniques = null;

		if (engagement_techniques_raw && engagement_techniques_raw.trim()) {
			engagement_techniques = engagement_techniques_raw
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
		}

		// Update database
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				engagement_techniques,
				user_instructions: user_instructions || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating engagement:', updateError);
			return fail(500, { error: `Failed to update engagement: ${updateError.message}` });
		}

		return { success: true };
	},

	updateLongform: async ({ request, params }) => {
		const formData = await request.formData();
		const max_num_chunks_str = formData.get('max_num_chunks') as string;
		const min_chunk_size_str = formData.get('min_chunk_size') as string;

		// Parse and validate
		const max_num_chunks = max_num_chunks_str ? parseInt(max_num_chunks_str) : null;
		const min_chunk_size = min_chunk_size_str ? parseInt(min_chunk_size_str) : null;

		if (max_num_chunks !== null && max_num_chunks < 1) {
			return fail(400, { error: 'Maximum chunks must be at least 1' });
		}

		if (min_chunk_size !== null && min_chunk_size < 500) {
			return fail(400, { error: 'Minimum chunk size must be at least 500 characters' });
		}

		// Update database
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				max_num_chunks,
				min_chunk_size,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating long-form settings:', updateError);
			return fail(500, { error: `Failed to update long-form settings: ${updateError.message}` });
		}

		return { success: true };
	}
};
