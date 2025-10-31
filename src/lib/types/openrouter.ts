/**
 * OpenRouter API Types
 * Based on https://openrouter.ai/api/v1/models response structure
 */

export interface OpenRouterModel {
	id: string;
	name: string;
	created: number;
	description?: string;
	context_length: number;
	architecture: {
		modality: string;
		tokenizer: string;
		instruct_type?: string | null;
	};
	pricing: {
		prompt: string; // Price per token in USD (as string)
		completion: string; // Price per token in USD (as string)
		request?: string; // Price per request in USD (as string)
		image?: string; // Price per image in USD (as string)
	};
	top_provider?: {
		context_length: number;
		max_completion_tokens?: number;
		is_moderated: boolean;
	};
	per_request_limits?: {
		prompt_tokens?: string;
		completion_tokens?: string;
	} | null;
}

export interface OpenRouterApiResponse {
	data: OpenRouterModel[];
}

/**
 * Computed types for UI display
 */
export interface ModelPricingDisplay {
	id: string;
	name: string;
	contextLength: number;
	promptPrice: number; // Converted to number for sorting
	completionPrice: number; // Converted to number for sorting
	provider: string; // Extracted from ID (e.g., "openai/gpt-4")
	modality: string;
}

/**
 * Sort configuration
 */
export type SortColumn = 'name' | 'promptPrice' | 'completionPrice' | 'contextLength';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
	column: SortColumn;
	direction: SortDirection;
}
