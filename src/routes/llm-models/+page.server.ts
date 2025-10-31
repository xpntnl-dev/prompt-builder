/**
 * Server-side data loading for LLM Pricing page
 * Fetches model data from OpenRouter API with caching
 */

import type { PageServerLoad, Actions } from './$types';
import { getModelsForDisplay, clearModelsCache } from '$lib/server/openrouter';
import { error } from '@sveltejs/kit';

/**
 * Load function - fetches models on page load
 */
export const load: PageServerLoad = async () => {
	try {
		const models = await getModelsForDisplay();

		return {
			models,
			lastFetched: new Date().toISOString()
		};
	} catch (err) {
		console.error('[LLM Pricing] Failed to load models:', err);
		throw error(500, 'Failed to load model pricing data');
	}
};

/**
 * Form actions for manual refresh
 */
export const actions: Actions = {
	/**
	 * Refresh action - clears cache and refetches data
	 */
	refresh: async () => {
		try {
			clearModelsCache();
			const models = await getModelsForDisplay(true);

			return {
				success: true,
				models,
				lastFetched: new Date().toISOString()
			};
		} catch (err) {
			console.error('[LLM Pricing] Failed to refresh models:', err);
			return {
				success: false,
				error: 'Failed to refresh model data'
			};
		}
	}
};
