import { supabase } from '$lib/server/supabase';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow, Prompt, PromptVersion, AvailableModel } from '$lib/types';

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

	// Load versions for this prompt
	const { data: versions, error: versionsError } = await supabase
		.from('prompt_versions')
		.select('*')
		.eq('prompt_id', params.promptId)
		.order('version_number', { ascending: false });

	if (versionsError) {
		console.error('Error loading versions:', versionsError);
	}

	// Load section counts for each version
	const versionsWithCounts = await Promise.all(
		(versions || []).map(async (version) => {
			const { count } = await supabase
				.from('prompt_sections')
				.select('*', { count: 'exact', head: true })
				.eq('version_id', version.id);

			return { ...version, section_count: count || 0 };
		})
	);

	// Load available models for the form
	const { data: models, error: modelsError } = await supabase
		.from('available_models')
		.select('*')
		.eq('is_active', true)
		.order('provider', { ascending: true })
		.order('model_name', { ascending: true });

	if (modelsError) {
		console.error('Error loading models:', modelsError);
	}

	return {
		workflow: workflow as Workflow,
		prompt: prompt as Prompt,
		versions: versionsWithCounts as (PromptVersion & { section_count: number })[],
		models: (models || []) as AvailableModel[]
	};
};

export const actions: Actions = {
	togglePublish: async ({ request, params }) => {
		const formData = await request.formData();
		const versionId = formData.get('versionId') as string;
		const currentPublished = formData.get('isPublished') === 'true';

		if (!versionId) {
			return fail(400, { error: 'Version ID is required' });
		}

		// If publishing this version, unpublish all other versions for this prompt
		if (!currentPublished) {
			await supabase
				.from('prompt_versions')
				.update({ is_published: false })
				.eq('prompt_id', params.promptId);
		}

		// Toggle the version's published state
		const { error: updateError } = await supabase
			.from('prompt_versions')
			.update({
				is_published: !currentPublished,
				updated_at: new Date().toISOString()
			})
			.eq('id', versionId);

		if (updateError) {
			console.error('Error toggling version published state:', updateError);
			return fail(500, { error: `Failed to update version: ${updateError.message}` });
		}

		return { success: true };
	}
};
