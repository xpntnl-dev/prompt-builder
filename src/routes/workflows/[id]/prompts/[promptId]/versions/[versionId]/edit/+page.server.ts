import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
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

	// Load version
	const { data: version, error: versionError } = await supabase
		.from('prompt_versions')
		.select('*')
		.eq('id', params.versionId)
		.eq('prompt_id', params.promptId)
		.single();

	if (versionError || !version) {
		throw error(404, 'Version not found');
	}

	// Load available models
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
		version: version as PromptVersion,
		models: (models || []) as AvailableModel[]
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const versionTag = formData.get('version_tag') as string;
		const modelId = formData.get('model_id') as string;
		const isPublished = formData.get('is_published') === 'on';

		// Validation
		if (!versionTag || versionTag.trim().length === 0) {
			return fail(400, {
				error: 'Version tag is required',
				versionTag,
				modelId,
				isPublished
			});
		}

		if (!modelId) {
			return fail(400, {
				error: 'Model selection is required',
				versionTag,
				modelId,
				isPublished
			});
		}

		// Get model details
		const { data: model, error: modelError } = await supabase
			.from('available_models')
			.select('*')
			.eq('id', modelId)
			.single();

		if (modelError || !model) {
			return fail(400, {
				error: 'Invalid model selected',
				versionTag,
				modelId,
				isPublished
			});
		}

		// Get current version state
		const { data: currentVersion } = await supabase
			.from('prompt_versions')
			.select('is_published')
			.eq('id', params.versionId)
			.single();

		// If changing from unpublished to published, unpublish all other versions
		if (isPublished && currentVersion && !currentVersion.is_published) {
			await supabase
				.from('prompt_versions')
				.update({ is_published: false })
				.eq('prompt_id', params.promptId);
		}

		// Update version
		const { error: updateError } = await supabase
			.from('prompt_versions')
			.update({
				version_tag: versionTag.trim(),
				model_provider: model.provider,
				model_name: model.model_name,
				is_published: isPublished,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.versionId);

		if (updateError) {
			console.error('Error updating version:', updateError);
			return fail(500, {
				error: `Failed to update version: ${updateError.message}`,
				versionTag,
				modelId,
				isPublished
			});
		}

		// Redirect to versions list
		throw redirect(303, `/workflows/${params.id}/prompts/${params.promptId}`);
	},

	delete: async ({ params }) => {
		// Check if version has sections
		const { count } = await supabase
			.from('prompt_sections')
			.select('*', { count: 'exact', head: true })
			.eq('version_id', params.versionId);

		if (count && count > 0) {
			return fail(400, {
				error: `Cannot delete version with ${count} section(s). Delete all sections first.`
			});
		}

		// Delete version
		const { error: deleteError } = await supabase
			.from('prompt_versions')
			.delete()
			.eq('id', params.versionId);

		if (deleteError) {
			console.error('Error deleting version:', deleteError);
			return fail(500, {
				error: `Failed to delete version: ${deleteError.message}`
			});
		}

		// Redirect to versions list
		throw redirect(303, `/workflows/${params.id}/prompts/${params.promptId}`);
	}
};
