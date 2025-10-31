import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow, Prompt } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	// Load workflow
	const { data: workflow, error: workflowError } = await supabase
		.from('workflows')
		.select('*')
		.eq('id', params.id)
		.single();

	if (workflowError || !workflow) {
		throw error(404, 'Workflow not found');
	}

	// Load prompts for this workflow
	const { data: prompts, error: promptsError } = await supabase
		.from('prompts')
		.select('*')
		.eq('workflow_id', params.id)
		.order('created_at', { ascending: false });

	if (promptsError) {
		console.error('Error loading prompts:', promptsError);
	}

	return {
		workflow: workflow as Workflow,
		prompts: (prompts || []) as Prompt[]
	};
};

export const actions: Actions = {
	toggleActive: async ({ request, params }) => {
		const formData = await request.formData();
		const promptId = formData.get('promptId') as string;
		const currentActive = formData.get('isActive') === 'true';

		if (!promptId) {
			return fail(400, { error: 'Prompt ID is required' });
		}

		// If setting this prompt to active, deactivate all other prompts in the workflow
		if (!currentActive) {
			await supabase
				.from('prompts')
				.update({ is_active: false })
				.eq('workflow_id', params.id);
		}

		// Toggle the prompt's active state
		const { error: updateError } = await supabase
			.from('prompts')
			.update({
				is_active: !currentActive,
				updated_at: new Date().toISOString()
			})
			.eq('id', promptId);

		if (updateError) {
			console.error('Error toggling prompt active state:', updateError);
			return fail(500, { error: `Failed to update prompt: ${updateError.message}` });
		}

		return { success: true };
	}
};
