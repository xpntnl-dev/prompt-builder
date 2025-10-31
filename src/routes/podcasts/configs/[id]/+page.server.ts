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

	updateModel: async ({ request, params }) => {
		const formData = await request.formData();
		const model_id = formData.get('model_id') as string;

		// Get model details if model_id provided
		let llm_provider: string | null = null;
		let llm_model: string | null = null;

		if (model_id) {
			const { data: model, error: modelError } = await supabase
				.from('available_models')
				.select('provider, model_name')
				.eq('id', model_id)
				.single();

			if (!modelError && model) {
				llm_provider = model.provider;
				llm_model = model.model_name;
			}
		}

		// Update config
		const { error: updateError } = await supabase
			.from('podcast_configs')
			.update({
				llm_provider,
				llm_model,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating model:', updateError);
			return fail(500, { error: `Failed to update model: ${updateError.message}` });
		}

		return { success: true };
	}
};
