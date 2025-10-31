import { supabase } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const podcast_name = formData.get('podcast_name') as string;
		const podcast_tagline = formData.get('podcast_tagline') as string;
		const description = formData.get('description') as string;
		const default_output_language = formData.get('default_output_language') as string;
		const brand_color = formData.get('brand_color') as string;
		const is_active = formData.get('is_active') === 'on';

		// Validation
		if (!podcast_name || podcast_name.trim().length === 0) {
			return fail(400, {
				error: 'Podcast name is required'
			});
		}

		// Insert podcast
		const { data, error } = await supabase
			.from('podcasts')
			.insert({
				podcast_name: podcast_name.trim(),
				podcast_tagline: podcast_tagline?.trim() || null,
				description: description?.trim() || null,
				default_output_language: default_output_language || 'English',
				brand_color: brand_color || null,
				is_active
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating podcast:', error);
			return fail(500, {
				error: `Failed to create podcast: ${error.message}`
			});
		}

		// Redirect to podcast detail page
		throw redirect(303, `/podcasts/${data.id}`);
	}
};
