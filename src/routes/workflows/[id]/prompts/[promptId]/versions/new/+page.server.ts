import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow, Prompt } from '$lib/types';
import type { ModelPricingDisplay } from '$lib/types/openrouter';
import { getModelsForDropdown } from '$lib/server/openrouter';

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

	// Get next version number
	const { data: versions } = await supabase
		.from('prompt_versions')
		.select('version_number')
		.eq('prompt_id', params.promptId)
		.order('version_number', { ascending: false })
		.limit(1);

	const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

	// Load available models from OpenRouter API
	// This matches the LLM Models page and includes all available models
	let models: ModelPricingDisplay[] = [];
	try {
		models = await getModelsForDropdown();
		console.log(`[New Version] Loaded ${models.length} models from OpenRouter`);
	} catch (err) {
		console.error('[New Version] Failed to load models from OpenRouter:', err);
		// Fallback: try loading from database
		const { data: dbModels, error: modelsError } = await supabase
			.from('available_models')
			.select('*')
			.eq('is_active', true)
			.order('provider', { ascending: true })
			.order('model_name', { ascending: true });

		if (!modelsError && dbModels) {
			// Transform database models to match ModelPricingDisplay format
			models = dbModels.map(m => ({
				id: `${m.provider}/${m.model_name}`,
				name: m.model_name,
				provider: m.provider,
				contextLength: 0,
				promptPrice: 0,
				completionPrice: 0,
				modality: 'text'
			}));
			console.log(`[New Version] Loaded ${models.length} models from database fallback`);
		}
	}

	return {
		workflow: workflow as Workflow,
		prompt: prompt as Prompt,
		nextVersionNumber,
		models
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
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

		// Parse model ID (format: "provider/model_name")
		const modelParts = modelId.split('/');
		if (modelParts.length < 2) {
			return fail(400, {
				error: 'Invalid model ID format',
				versionTag,
				modelId,
				isPublished
			});
		}

		const modelProvider = modelParts[0];
		const modelName = modelParts.slice(1).join('/'); // Handle model names with slashes

		// Get next version number
		const { data: versions } = await supabase
			.from('prompt_versions')
			.select('version_number')
			.eq('prompt_id', params.promptId)
			.order('version_number', { ascending: false })
			.limit(1);

		const versionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

		// If publishing this version, unpublish all other versions
		if (isPublished) {
			await supabase
				.from('prompt_versions')
				.update({ is_published: false })
				.eq('prompt_id', params.promptId);
		}

		// Create version
		const { data: newVersion, error: createError } = await supabase
			.from('prompt_versions')
			.insert({
				prompt_id: params.promptId,
				version_number: versionNumber,
				version_tag: versionTag.trim(),
				model_provider: modelProvider,
				model_name: modelName,
				is_published: isPublished
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating version:', createError);
			return fail(500, {
				error: `Failed to create version: ${createError.message}`,
				versionTag,
				modelId,
				isPublished
			});
		}

		// Redirect to versions list
		throw redirect(303, `/workflows/${params.id}/prompts/${params.promptId}`);
	}
};
