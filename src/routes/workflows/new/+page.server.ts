import { supabase } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, {
				error: 'Workflow name is required',
				name,
				description
			});
		}

		if (name.trim().length < 3) {
			return fail(400, {
				error: 'Workflow name must be at least 3 characters',
				name,
				description
			});
		}

		// Create workflow
		const { data, error } = await supabase
			.from('workflows')
			.insert({
				name: name.trim(),
				description: description.trim() || null
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating workflow:', error);
			return fail(500, {
				error: `Failed to create workflow: ${error.message}`,
				name,
				description
			});
		}

		// Redirect to workflows list
		throw redirect(303, '/workflows');
	}
};
