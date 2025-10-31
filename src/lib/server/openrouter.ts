/**
 * OpenRouter API Client
 * Fetches model pricing data from OpenRouter API with caching
 */

import { OPENROUTER_API_KEY } from '$env/static/private';
import type { OpenRouterApiResponse, OpenRouterModel, ModelPricingDisplay } from '$lib/types/openrouter';
import { cache } from './cache';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/models';
const CACHE_KEY = 'openrouter_models';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch models from OpenRouter API with caching
 * @param forceRefresh - Skip cache and fetch fresh data
 * @returns Array of OpenRouter models
 */
export async function fetchOpenRouterModels(forceRefresh = false): Promise<OpenRouterModel[]> {
	// Check cache first unless force refresh
	if (!forceRefresh) {
		const cached = cache.get<OpenRouterModel[]>(CACHE_KEY, CACHE_DURATION_MS);
		if (cached) {
			console.log('[OpenRouter] Returning cached data');
			return cached;
		}
	}

	console.log('[OpenRouter] Fetching fresh data from API');

	try {
		// Build headers - API key is optional for public /models endpoint
		const headers: Record<string, string> = {
			'HTTP-Referer': 'https://rvkcat.com', // Optional: your site URL
			'X-Title': 'RVKCAT Admin' // Optional: your app name
		};

		// Only add Authorization header if API key is configured
		if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
			headers['Authorization'] = `Bearer ${OPENROUTER_API_KEY}`;
		}

		const response = await fetch(OPENROUTER_API_URL, { headers });

		if (!response.ok) {
			throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
		}

		const json = await response.json() as OpenRouterApiResponse;
		const models = json.data;

		// Cache the results
		cache.set(CACHE_KEY, models);
		console.log(`[OpenRouter] Cached ${models.length} models`);

		return models;
	} catch (error) {
		console.error('[OpenRouter] Failed to fetch models:', error);

		// Return empty array on error (could also throw or return cached data if available)
		return [];
	}
}

/**
 * Transform OpenRouter model to display format
 * Converts string prices to numbers and extracts provider info
 */
export function transformModelForDisplay(model: OpenRouterModel): ModelPricingDisplay {
	// Extract provider from ID (e.g., "openai/gpt-4" -> "openai")
	const provider = model.id.split('/')[0] || 'unknown';

	return {
		id: model.id,
		name: model.name,
		contextLength: model.context_length,
		promptPrice: parseFloat(model.pricing.prompt) || 0,
		completionPrice: parseFloat(model.pricing.completion) || 0,
		provider,
		modality: model.architecture.modality
	};
}

/**
 * Get all models formatted for display
 * @param forceRefresh - Skip cache and fetch fresh data
 */
export async function getModelsForDisplay(forceRefresh = false): Promise<ModelPricingDisplay[]> {
	const models = await fetchOpenRouterModels(forceRefresh);
	return models.map(transformModelForDisplay);
}

/**
 * Clear the models cache
 */
export function clearModelsCache(): void {
	cache.clear(CACHE_KEY);
	console.log('[OpenRouter] Cache cleared');
}

/**
 * Get models for version creation dropdown
 * Returns all models from OpenRouter API, suitable for populating a select dropdown
 * @param forceRefresh - Skip cache and fetch fresh data
 */
export async function getModelsForDropdown(forceRefresh = false): Promise<ModelPricingDisplay[]> {
	const models = await getModelsForDisplay(forceRefresh);

	// Sort by provider and name for better UX in dropdown
	return models.sort((a, b) => {
		if (a.provider !== b.provider) {
			return a.provider.localeCompare(b.provider);
		}
		return a.name.localeCompare(b.name);
	});
}
