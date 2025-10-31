import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Podcast, PodcastConfig } from '$lib/types';

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

	return {
		config: config as PodcastConfig,
		podcast: podcast as Podcast | null
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		// Extract basic fields
		const config_name = formData.get('config_name') as string;
		const config_type = formData.get('config_type') as string;
		const description = formData.get('description') as string;

		// Extract LLM fields
		const llm_provider = formData.get('llm_provider') as string;
		const llm_model = formData.get('llm_model') as string;
		const llm_creativity = formData.get('llm_creativity') as string;

		// Extract conversation fields
		const roles_person1 = formData.get('roles_person1') as string;
		const roles_person2 = formData.get('roles_person2') as string;
		const conversation_style_raw = formData.get('conversation_style') as string;
		const dialogue_structure_raw = formData.get('dialogue_structure') as string;

		// Extract branding fields
		const podcast_name = formData.get('podcast_name') as string;
		const podcast_tagline = formData.get('podcast_tagline') as string;
		const output_language = formData.get('output_language') as string;

		// Extract engagement fields
		const engagement_techniques_raw = formData.get('engagement_techniques') as string;
		const user_instructions = formData.get('user_instructions') as string;

		// Extract TTS fields
		const tts_provider = formData.get('tts_provider') as string;
		const voice_person1 = formData.get('voice_person1') as string;
		const voice_person2 = formData.get('voice_person2') as string;
		const tts_model = formData.get('tts_model') as string;
		const audio_format = formData.get('audio_format') as string;
		const ending_message = formData.get('ending_message') as string;

		// Extract long-form fields
		const max_num_chunks = formData.get('max_num_chunks') as string;
		const min_chunk_size = formData.get('min_chunk_size') as string;

		// Extract metadata fields
		const is_active = formData.get('is_active') === 'on';
		const is_default = formData.get('is_default') === 'on';

		// Validation
		if (!config_name || config_name.trim().length === 0) {
			return fail(400, {
				error: 'Configuration name is required'
			});
		}

		if (!config_type) {
			return fail(400, {
				error: 'Configuration type is required'
			});
		}

		// Parse JSONB arrays
		let conversation_style = null;
		let dialogue_structure = null;
		let engagement_techniques = null;

		try {
			if (conversation_style_raw && conversation_style_raw.trim()) {
				conversation_style = conversation_style_raw
					.split(',')
					.map(s => s.trim())
					.filter(s => s.length > 0);
			}

			if (dialogue_structure_raw && dialogue_structure_raw.trim()) {
				dialogue_structure = dialogue_structure_raw
					.split(',')
					.map(s => s.trim())
					.filter(s => s.length > 0);
			}

			if (engagement_techniques_raw && engagement_techniques_raw.trim()) {
				engagement_techniques = engagement_techniques_raw
					.split(',')
					.map(s => s.trim())
					.filter(s => s.length > 0);
			}
		} catch (e) {
			return fail(400, {
				error: 'Invalid format for array fields. Use comma-separated values.'
			});
		}

		// Build update object
		const updateData: any = {
			config_name: config_name.trim(),
			config_type,
			description: description?.trim() || null,

			// LLM
			llm_provider: llm_provider || null,
			llm_model: llm_model || null,
			llm_creativity: llm_creativity ? parseFloat(llm_creativity) : null,

			// Conversation
			roles_person1: roles_person1?.trim() || null,
			roles_person2: roles_person2?.trim() || null,
			conversation_style,
			dialogue_structure,

			// Branding
			podcast_name: podcast_name?.trim() || null,
			podcast_tagline: podcast_tagline?.trim() || null,
			output_language: output_language || 'English',

			// Engagement
			engagement_techniques,
			user_instructions: user_instructions?.trim() || null,

			// TTS
			tts_provider: tts_provider || 'openai',
			voice_person1: voice_person1 || null,
			voice_person2: voice_person2 || null,
			tts_model: tts_model || null,
			audio_format: audio_format || 'mp3',
			ending_message: ending_message || 'Bye Bye!',

			// Long-form
			max_num_chunks: max_num_chunks ? parseInt(max_num_chunks) : 8,
			min_chunk_size: min_chunk_size ? parseInt(min_chunk_size) : 600,

			// Metadata
			is_active,
			is_default,
			updated_at: new Date().toISOString()
		};

		// Update config
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update(updateData)
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating podcast config:', updateError);
			return fail(500, {
				error: `Failed to update configuration: ${updateError.message}`
			});
		}

		// Redirect to config detail page
		throw redirect(303, `/podcasts/configs/${params.id}`);
	}
};
