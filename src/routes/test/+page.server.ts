import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const results = {
		connection: false,
		tables: {} as Record<string, { exists: boolean; count: number; error?: string }>,
		error: null as string | null
	};

	try {
		// Test basic connection
		const { error: connectionError } = await supabase.from('workflows').select('count', { count: 'exact', head: true });

		if (connectionError) {
			results.error = `Connection failed: ${connectionError.message}`;
			return results;
		}

		results.connection = true;

		// Test each table
		const tables = ['workflows', 'prompts', 'prompt_versions', 'prompt_sections', 'available_models'];

		for (const table of tables) {
			try {
				const { count, error } = await supabase
					.from(table)
					.select('*', { count: 'exact', head: true });

				if (error) {
					results.tables[table] = { exists: false, count: 0, error: error.message };
				} else {
					results.tables[table] = { exists: true, count: count || 0 };
				}
			} catch (err) {
				results.tables[table] = {
					exists: false,
					count: 0,
					error: err instanceof Error ? err.message : 'Unknown error'
				};
			}
		}

	} catch (err) {
		results.error = err instanceof Error ? err.message : 'Unknown error';
	}

	return results;
};
