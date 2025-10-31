// Database types for prompt builder schema

export interface Workflow {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface Prompt {
	id: string;
	workflow_id: string;
	name: string;
	description: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface PromptVersion {
	id: string;
	prompt_id: string;
	version_number: number;
	version_tag: string;
	model_provider: string;
	model_name: string;
	is_published: boolean;
	created_at: string;
	updated_at: string;
}

export interface PromptSection {
	id: string;
	version_id: string;
	section_name: string;
	section_order: number;
	content: string;
	variant_number: number; // 1-5, indicates which variant this is
	is_active_variant: boolean; // true if this is the currently active variant
	created_at: string;
	updated_at: string;
}

export interface AvailableModel {
	id: string;
	provider: string;
	model_name: string;
	display_name: string;
	description: string | null;
	is_active: boolean;
	created_at: string;
}

// Assembled prompt metadata (from get_system_prompt_with_metadata function)
export interface AssembledPrompt {
	workflow_name: string;
	prompt_name: string;
	version_tag: string;
	version_number: number;
	model_provider: string;
	model_name: string;
	is_published: boolean;
	prompt_content: string;
	section_count: number;
	created_at: string;
}
