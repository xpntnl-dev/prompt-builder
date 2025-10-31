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

	// Load prompt
	const { data: prompt, error: promptError } = await supabase
		.from('prompts')
		.select('*')
		.eq('id', params.promptId)
		.eq('workflow_id', params.id)
		.single();

	if (promptError || !prompt) {
		throw error(404, 'Prompt not found');
	}

	return {
		workflow: workflow as Workflow,
		prompt: prompt as Prompt
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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

		// Get current prompt state
		const { data: currentPrompt } = await supabase
			.from('prompts')
			.select('is_active')
			.eq('id', params.promptId)
			.single();

		// If changing from inactive to active, deactivate all other prompts
		if (isActive && currentPrompt && !currentPrompt.is_active) {
			await supabase.from('prompts').update({ is_active: false }).eq('workflow_id', params.id);
		}

		// Update prompt
		const { error: updateError } = await supabase
			.from('prompts')
			.update({
				name: name.trim(),
				description: description.trim() || null,
				is_active: isActive,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.promptId);

		if (updateError) {
			console.error('Error updating prompt:', updateError);
			return fail(500, {
				error: `Failed to update prompt: ${updateError.message}`,
				name,
				description,
				isActive
			});
		}

		// Redirect to workflow detail page
		throw redirect(303, `/workflows/${params.id}`);
	},

	delete: async ({ params }) => {
		// Check if prompt has versions
		const { count } = await supabase
			.from('prompt_versions')
			.select('*', { count: 'exact', head: true })
			.eq('prompt_id', params.promptId);

		if (count && count > 0) {
			return fail(400, {
				error: `Cannot delete prompt with ${count} version(s). Delete all versions first.`
			});
		}

		// Delete prompt
		const { error: deleteError } = await supabase
			.from('prompts')
			.delete()
			.eq('id', params.promptId);

		if (deleteError) {
			console.error('Error deleting prompt:', deleteError);
			return fail(500, {
				error: `Failed to delete prompt: ${deleteError.message}`
			});
		}

		// Redirect to workflow detail page
		throw redirect(303, `/workflows/${params.id}`);
	}
};
