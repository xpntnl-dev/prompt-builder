import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	// Load workflow to display context
	const { data: workflow, error: workflowError } = await supabase
		.from('workflows')
		.select('*')
		.eq('id', params.id)
		.single();

	if (workflowError || !workflow) {
		throw error(404, 'Workflow not found');
	}

	return {
		workflow: workflow as Workflow
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const isActive = formData.get('is_active') === 'on';

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, {
				error: 'Prompt name is required',
				name,
				description,
				isActive
			});
		}

		if (name.trim().length < 3) {
			return fail(400, {
				error: 'Prompt name must be at least 3 characters',
				name,
				description,
				isActive
			});
		}

		// If setting this prompt as active, deactivate all other prompts in the workflow
		if (isActive) {
			await supabase.from('prompts').update({ is_active: false }).eq('workflow_id', params.id);
		}

		// Create prompt
		const { data, error: createError } = await supabase
			.from('prompts')
			.insert({
				workflow_id: params.id,
				name: name.trim(),
				description: description.trim() || null,
				is_active: isActive
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating prompt:', createError);
			return fail(500, {
				error: `Failed to create prompt: ${createError.message}`,
				name,
				description,
				isActive
			});
		}

		// Redirect to workflow detail page
		throw redirect(303, `/workflows/${params.id}`);
	}
};
