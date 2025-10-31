import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';
import type { Workflow } from '$lib/types';

export const load: PageServerLoad = async () => {
	const { data: workflows, error } = await supabase
		.from('workflows')
		.select('*, prompts(count)')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error loading workflows:', error);
		return {
			workflows: [] as Workflow[],
			error: error.message
		};
	}

	// Transform the data to include prompt count
	const workflowsWithCounts = workflows?.map((w: any) => ({
		...w,
		prompt_count: w.prompts?.[0]?.count || 0
	})) || [];

	return {
		workflows: workflowsWithCounts as Workflow[],
		error: null
	};
};
