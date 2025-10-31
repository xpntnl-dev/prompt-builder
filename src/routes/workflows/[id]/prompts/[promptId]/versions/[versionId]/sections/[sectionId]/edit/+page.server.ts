import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Workflow, Prompt, PromptVersion, PromptSection } from '$lib/types';

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

	// Load section
	const { data: section, error: sectionError } = await supabase
		.from('prompt_sections')
		.select('*')
		.eq('id', params.sectionId)
		.eq('version_id', params.versionId)
		.single();

	if (sectionError || !section) {
		throw error(404, 'Section not found');
	}

	return {
		workflow: workflow as Workflow,
		prompt: prompt as Prompt,
		version: version as PromptVersion,
		section: section as PromptSection
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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

		// Update section
		const { error: updateError } = await supabase
			.from('prompt_sections')
			.update({
				section_name: sectionName.trim(),
				content: content.trim()
			})
			.eq('id', params.sectionId);

		if (updateError) {
			console.error('Error updating section:', updateError);
			return fail(500, {
				error: `Failed to update section: ${updateError.message}`,
				sectionName,
				content
			});
		}

		// Redirect to sections list
		throw redirect(
			303,
			`/workflows/${params.id}/prompts/${params.promptId}/versions/${params.versionId}`
		);
	},

	delete: async ({ params }) => {
		// Delete section
		const { error: deleteError } = await supabase
			.from('prompt_sections')
			.delete()
			.eq('id', params.sectionId);

		if (deleteError) {
			console.error('Error deleting section:', deleteError);
			return fail(500, {
				error: `Failed to delete section: ${deleteError.message}`
			});
		}

		// Redirect to sections list
		throw redirect(
			303,
			`/workflows/${params.id}/prompts/${params.promptId}/versions/${params.versionId}`
		);
	}
};
