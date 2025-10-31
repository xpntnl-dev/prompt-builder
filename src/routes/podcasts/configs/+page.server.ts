import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';
import type { PodcastConfig } from '$lib/types';

export const load: PageServerLoad = async () => {
	const { data: configs, error } = await supabase
		.from('podcast_configs')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error loading podcast configs:', error);
		return {
			configs: [] as PodcastConfig[],
			error: error.message
		};
	}

	return {
		configs: (configs || []) as PodcastConfig[],
		error: null
	};
};
