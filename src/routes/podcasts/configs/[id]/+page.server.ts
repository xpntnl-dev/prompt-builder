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
	}
};
