import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Podcast, PodcastConfig } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	// Get podcast details
	const { data: podcast, error: podcastError } = await supabase
		.from('podcasts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (podcastError || !podcast) {
		throw error(404, 'Podcast not found');
	}

	// Get all configs for this podcast
	const { data: configs, error: configsError } = await supabase
		.from('podcast_configs')
		.select('*')
		.eq('podcast_id', params.id)
		.order('config_name', { ascending: true });

	if (configsError) {
		console.error('Error loading configs:', configsError);
	}

	return {
		podcast: podcast as Podcast,
		configs: (configs || []) as PodcastConfig[]
	};
};

export const actions: Actions = {
	toggleActive: async ({ params, request }) => {
		const formData = await request.formData();
		const is_active = formData.get('is_active') === 'true';

		const { error: updateError } = await supabase
			.from('podcasts')
			.update({ is_active, updated_at: new Date().toISOString() })
			.eq('id', params.id);

		if (updateError) {
			return fail(500, { error: updateError.message });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		// This will CASCADE delete all configs
		const { error: deleteError } = await supabase.from('podcasts').delete().eq('id', params.id);

		if (deleteError) {
			return fail(500, { error: deleteError.message });
		}

		throw redirect(303, '/podcasts');
	}
};
