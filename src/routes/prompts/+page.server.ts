import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const load: PageServerLoad = async () => {
	// Fetch all prompts with their associated workflow information
	const { data: prompts, error } = await supabase
		.from('prompts')
		.select(
			`
			id,
			name,
			description,
			created_at,
			updated_at,
			workflow_id,
			workflows (
				id,
				name
			)
		`
		)
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('Error loading prompts:', error);
		return { prompts: [] };
	}

	return { prompts: prompts || [] };
};
