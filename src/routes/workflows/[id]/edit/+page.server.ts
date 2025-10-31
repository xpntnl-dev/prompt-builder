import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const { data: workflow, error: loadError } = await supabase
		.from('workflows')
		.select('*')
		.eq('id', params.id)
		.single();

	if (loadError || !workflow) {
		throw error(404, 'Workflow not found');
	}

	return {
		workflow: workflow as Workflow
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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

		// Update workflow
		const { error: updateError } = await supabase
			.from('workflows')
			.update({
				name: name.trim(),
				description: description.trim() || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Error updating workflow:', updateError);
			return fail(500, {
				error: `Failed to update workflow: ${updateError.message}`,
				name,
				description
			});
		}

		// Redirect to workflows list
		throw redirect(303, '/workflows');
	},

	delete: async ({ params }) => {
		// Check if workflow has prompts
		const { count } = await supabase
			.from('prompts')
			.select('*', { count: 'exact', head: true })
			.eq('workflow_id', params.id);

		if (count && count > 0) {
			return fail(400, {
				error: `Cannot delete workflow with ${count} prompt(s). Delete all prompts first.`
			});
		}

		// Delete workflow
		const { error: deleteError } = await supabase
			.from('workflows')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Error deleting workflow:', deleteError);
			return fail(500, {
				error: `Failed to delete workflow: ${deleteError.message}`
			});
		}

		// Redirect to workflows list
		throw redirect(303, '/workflows');
	}
};
