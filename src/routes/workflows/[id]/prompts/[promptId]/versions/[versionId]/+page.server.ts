import { supabase } from '$lib/server/supabase';
import { error, fail } from '@sveltejs/kit';
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

	// Load ALL sections for this version (including all variants)
	// Ordered by section_order, then variant_number
	const { data: sections, error: sectionsError } = await supabase
		.from('prompt_sections')
		.select('*')
		.eq('version_id', params.versionId)
		.order('section_order', { ascending: true })
		.order('variant_number', { ascending: true });

	if (sectionsError) {
		console.error('Error loading sections:', sectionsError);
	}

	return {
		workflow: workflow as Workflow,
		prompt: prompt as Prompt,
		version: version as PromptVersion,
		sections: (sections || []) as PromptSection[]
	};
};

export const actions: Actions = {
	reorder: async ({ request, params }) => {
		const formData = await request.formData();
		const updatesString = formData.get('updates') as string;
		const updates = JSON.parse(updatesString);

		if (!Array.isArray(updates)) {
			return fail(400, { error: 'Invalid update data' });
		}

		// STEP 1: Set all sections to temporary placeholder orders (1000+)
		// This avoids unique constraint violations during reordering
		for (let i = 0; i < updates.length; i++) {
			const { error } = await supabase
				.from('prompt_sections')
				.update({ section_order: 1000 + i })
				.eq('id', updates[i].id);

			if (error) {
				console.error('Error setting temp order:', error);
				return fail(500, { error: `Failed to reorder: ${error.message}` });
			}
		}

		// STEP 2: Set final correct orders
		for (const update of updates) {
			const { error } = await supabase
				.from('prompt_sections')
				.update({ section_order: update.section_order })
				.eq('id', update.id);

			if (error) {
				console.error('Error setting final order:', error);
				return fail(500, { error: `Failed to reorder: ${error.message}` });
			}
		}

		return { success: true, action: 'reorder', message: 'Sections reordered successfully' };
	},

	updateSection: async ({ request, params }) => {
		const formData = await request.formData();
		const sectionId = formData.get('sectionId') as string;
		const sectionName = formData.get('sectionName') as string;
		const content = formData.get('content') as string;

		// Validation
		if (!sectionName || sectionName.trim().length === 0) {
			return fail(400, { error: 'Section name is required' });
		}

		if (!content || content.trim().length === 0) {
			return fail(400, { error: 'Content is required' });
		}

		// Update section
		const { error: updateError } = await supabase
			.from('prompt_sections')
			.update({
				section_name: sectionName.trim(),
				content: content.trim(),
				updated_at: new Date().toISOString()
			})
			.eq('id', sectionId);

		if (updateError) {
			console.error('Error updating section:', updateError);
			return fail(500, { error: `Failed to update section: ${updateError.message}` });
		}

		return { success: true, action: 'update', message: 'Section updated successfully' };
	},

	deleteSection: async ({ request, params }) => {
		const formData = await request.formData();
		const versionId = formData.get('versionId') as string;
		const sectionOrder = parseInt(formData.get('sectionOrder') as string);

		if (!versionId || isNaN(sectionOrder)) {
			return fail(400, { error: 'Version ID and section order are required' });
		}

		// Delete ALL variants for this section position
		const { error: deleteError } = await supabase
			.from('prompt_sections')
			.delete()
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder);

		if (deleteError) {
			console.error('Error deleting section:', deleteError);
			return fail(500, { error: `Failed to delete section: ${deleteError.message}` });
		}

		return { success: true, action: 'delete', message: 'Section and all variants deleted successfully' };
	},

	createVariant: async ({ request, params }) => {
		const formData = await request.formData();
		const versionId = formData.get('versionId') as string;
		const sectionOrder = parseInt(formData.get('sectionOrder') as string);

		if (!versionId || isNaN(sectionOrder)) {
			return fail(400, { error: 'Version ID and section order are required' });
		}

		// Get current active variant for this section
		const { data: activeVariant, error: activeError } = await supabase
			.from('prompt_sections')
			.select('*')
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder)
			.eq('is_active_variant', true)
			.single();

		if (activeError || !activeVariant) {
			return fail(404, { error: 'Active variant not found' });
		}

		// Check how many variants exist for this section
		const { data: existingVariants, error: countError } = await supabase
			.from('prompt_sections')
			.select('variant_number')
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder);

		if (countError) {
			return fail(500, { error: `Failed to count variants: ${countError.message}` });
		}

		// Check if we've hit the 5-variant limit
		if (existingVariants && existingVariants.length >= 5) {
			return fail(400, { error: 'Maximum 5 variants allowed per section' });
		}

		// Find the lowest available variant number (1-5) for reuse
		const usedNumbers = existingVariants?.map((v) => v.variant_number) || [];
		let nextVariantNumber = 1;
		for (let i = 1; i <= 5; i++) {
			if (!usedNumbers.includes(i)) {
				nextVariantNumber = i;
				break;
			}
		}

		// Create new variant (copy of active variant, but set as inactive)
		const { error: insertError } = await supabase.from('prompt_sections').insert({
			version_id: versionId,
			section_order: sectionOrder,
			section_name: activeVariant.section_name,
			content: activeVariant.content,
			variant_number: nextVariantNumber,
			is_active_variant: false
		});

		if (insertError) {
			console.error('Error creating variant:', insertError);
			return fail(500, { error: `Failed to create variant: ${insertError.message}` });
		}

		return {
			success: true,
			action: 'createVariant',
			message: `Variant ${nextVariantNumber} created successfully`
		};
	},

	switchVariant: async ({ request, params }) => {
		const formData = await request.formData();
		const versionId = formData.get('versionId') as string;
		const sectionOrder = parseInt(formData.get('sectionOrder') as string);
		const targetVariantNumber = parseInt(formData.get('targetVariantNumber') as string);

		if (!versionId || isNaN(sectionOrder) || isNaN(targetVariantNumber)) {
			return fail(400, { error: 'Version ID, section order, and variant number are required' });
		}

		// STEP 1: Deactivate all variants for this section
		const { error: deactivateError } = await supabase
			.from('prompt_sections')
			.update({ is_active_variant: false })
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder);

		if (deactivateError) {
			console.error('Error deactivating variants:', deactivateError);
			return fail(500, { error: `Failed to switch variant: ${deactivateError.message}` });
		}

		// STEP 2: Activate target variant
		const { error: activateError } = await supabase
			.from('prompt_sections')
			.update({ is_active_variant: true })
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder)
			.eq('variant_number', targetVariantNumber);

		if (activateError) {
			console.error('Error activating variant:', activateError);
			return fail(500, { error: `Failed to activate variant: ${activateError.message}` });
		}

		return {
			success: true,
			action: 'switchVariant',
			message: `Switched to variant ${targetVariantNumber}`
		};
	},

	deleteVariant: async ({ request, params }) => {
		const formData = await request.formData();
		const versionId = formData.get('versionId') as string;
		const sectionOrder = parseInt(formData.get('sectionOrder') as string);
		const variantNumber = parseInt(formData.get('variantNumber') as string);

		if (!versionId || isNaN(sectionOrder) || isNaN(variantNumber)) {
			return fail(400, { error: 'Version ID, section order, and variant number are required' });
		}

		// Check if this is the active variant
		const { data: targetVariant, error: checkError } = await supabase
			.from('prompt_sections')
			.select('is_active_variant')
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder)
			.eq('variant_number', variantNumber)
			.single();

		if (checkError || !targetVariant) {
			return fail(404, { error: 'Variant not found' });
		}

		if (targetVariant.is_active_variant) {
			return fail(400, { error: 'Cannot delete active variant. Switch to another variant first.' });
		}

		// Check how many variants exist
		const { data: variants, error: countError } = await supabase
			.from('prompt_sections')
			.select('id')
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder);

		if (countError) {
			return fail(500, { error: `Failed to count variants: ${countError.message}` });
		}

		if (variants && variants.length <= 1) {
			return fail(400, { error: 'Cannot delete the last variant' });
		}

		// Delete the variant
		const { error: deleteError } = await supabase
			.from('prompt_sections')
			.delete()
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder)
			.eq('variant_number', variantNumber);

		if (deleteError) {
			console.error('Error deleting variant:', deleteError);
			return fail(500, { error: `Failed to delete variant: ${deleteError.message}` });
		}

		return {
			success: true,
			action: 'deleteVariant',
			message: `Variant ${variantNumber} deleted successfully`
		};
	},

	duplicateVariant: async ({ request, params }) => {
		const formData = await request.formData();
		const versionId = formData.get('versionId') as string;
		const sectionOrder = parseInt(formData.get('sectionOrder') as string);
		const sourceVariantNumber = parseInt(formData.get('sourceVariantNumber') as string);

		if (!versionId || isNaN(sectionOrder) || isNaN(sourceVariantNumber)) {
			return fail(400, { error: 'Version ID, section order, and variant number are required' });
		}

		// Get source variant
		const { data: sourceVariant, error: sourceError } = await supabase
			.from('prompt_sections')
			.select('*')
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder)
			.eq('variant_number', sourceVariantNumber)
			.single();

		if (sourceError || !sourceVariant) {
			return fail(404, { error: 'Source variant not found' });
		}

		// Check variant count
		const { data: existingVariants, error: countError } = await supabase
			.from('prompt_sections')
			.select('variant_number')
			.eq('version_id', versionId)
			.eq('section_order', sectionOrder);

		if (countError) {
			return fail(500, { error: `Failed to count variants: ${countError.message}` });
		}

		if (existingVariants && existingVariants.length >= 5) {
			return fail(400, { error: 'Maximum 5 variants allowed per section' });
		}

		// Find lowest available variant number
		const usedNumbers = existingVariants?.map((v) => v.variant_number) || [];
		let nextVariantNumber = 1;
		for (let i = 1; i <= 5; i++) {
			if (!usedNumbers.includes(i)) {
				nextVariantNumber = i;
				break;
			}
		}

		// Duplicate the variant
		const { error: insertError } = await supabase.from('prompt_sections').insert({
			version_id: versionId,
			section_order: sectionOrder,
			section_name: sourceVariant.section_name,
			content: sourceVariant.content,
			variant_number: nextVariantNumber,
			is_active_variant: false
		});

		if (insertError) {
			console.error('Error duplicating variant:', insertError);
			return fail(500, { error: `Failed to duplicate variant: ${insertError.message}` });
		}

		return {
			success: true,
			action: 'duplicateVariant',
			message: `Variant duplicated as variant ${nextVariantNumber}`
		};
	}
};
