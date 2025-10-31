import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';
import type { Podcast } from '$lib/types';

export const load: PageServerLoad = async () => {
	// Get all podcasts with config count
	const { data: podcasts, error } = await supabase
		.from('podcasts')
		.select(`
			*,
			podcast_configs(count)
		`)
		.order('podcast_name', { ascending: true });

	if (error) {
		console.error('Error loading podcasts:', error);
		return {
			podcasts: [],
			error: error.message
		};
	}

	// Transform the data to include config count
	const podcastsWithCount = (podcasts || []).map((p: any) => ({
		...p,
		config_count: p.podcast_configs?.[0]?.count || 0
	}));

	return {
		podcasts: podcastsWithCount as (Podcast & { config_count: number })[]
	};
};
