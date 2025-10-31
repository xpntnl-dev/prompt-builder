import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow, Prompt, PromptVersion } from '$lib/types';

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

	return {
		workflow: workflow as Workflow,
		prompt: prompt as Prompt,
		version: version as PromptVersion
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const sectionName = formData.get('sectionName') as string;
		const content = formData.get('content') as string;

		// Validation
		if (!sectionName || sectionName.trim().length === 0) {
			return fail(400, { error: 'Section name is required', sectionName, content });
		}

		if (!content || content.trim().length === 0) {
			return fail(400, { error: 'Content is required', sectionName, content });
		}

		// Get max section_order for this version
		const { data: maxOrderData } = await supabase
			.from('prompt_sections')
			.select('section_order')
			.eq('version_id', params.versionId)
			.order('section_order', { ascending: false })
			.limit(1);

		const nextOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].section_order + 1 : 1;

		// Create section
		const { error: createError } = await supabase.from('prompt_sections').insert({
			version_id: params.versionId,
			section_name: sectionName.trim(),
			content: content.trim(),
			section_order: nextOrder
		});

		if (createError) {
			console.error('Error creating section:', createError);
			return fail(500, {
				error: `Failed to create section: ${createError.message}`,
				sectionName,
				content
			});
		}

		// Redirect back to sections list
		throw redirect(
			303,
			`/workflows/${params.id}/prompts/${params.promptId}/versions/${params.versionId}`
		);
	}
};
