import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Podcast } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const { data: podcast, error: podcastError } = await supabase
		.from('podcasts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (podcastError || !podcast) {
		throw error(404, 'Podcast not found');
	}

	return {
		podcast: podcast as Podcast
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
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

		// Update podcast
		const { error: updateError } = await supabase
			.from('podcasts')
			.update({
				podcast_name: podcast_name.trim(),
				podcast_tagline: podcast_tagline?.trim() || null,
				description: description?.trim() || null,
				default_output_language: default_output_language || 'English',
				brand_color: brand_color || null,
				is_active,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating podcast:', updateError);
			return fail(500, {
				error: `Failed to update podcast: ${updateError.message}`
			});
		}

		// Redirect to podcast detail page
		throw redirect(303, `/podcasts/${params.id}`);
	}
};
