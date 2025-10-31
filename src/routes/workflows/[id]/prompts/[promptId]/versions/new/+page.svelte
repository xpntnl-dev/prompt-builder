<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import type { ModelPricingDisplay } from '$lib/types/openrouter';

	export let data: PageData;
	export let form: ActionData;

	// LocalStorage key for pinned models (matches LLM Models page)
	const STORAGE_KEY = 'rvkcat_pinned_models';

	let pinnedModelIds: Set<string> = new Set();

	// Load pinned models from localStorage
	onMount(() => {
		if (browser) {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as string[];
					pinnedModelIds = new Set(parsed);
				} catch (e) {
					console.error('Failed to parse pinned models from localStorage', e);
				}
			}
		}
	});

	// Group models by provider
	function groupModelsByProvider(models: ModelPricingDisplay[]) {
		const groups = new Map<string, ModelPricingDisplay[]>();
		for (const model of models) {
			if (!groups.has(model.provider)) {
				groups.set(model.provider, []);
			}
			groups.get(model.provider)!.push(model);
		}
		return groups;
	}

	// Get pinned models
	$: pinnedModels = data.models.filter(m => pinnedModelIds.has(m.id));

	// Get unpinned models
	$: unpinnedModels = data.models.filter(m => !pinnedModelIds.has(m.id));

	// Group pinned models by provider
	$: pinnedGroups = groupModelsByProvider(pinnedModels);

	// Group unpinned models by provider
	$: unpinnedGroups = groupModelsByProvider(unpinnedModels);
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Breadcrumb -->
	<div class="flex items-center space-x-2 text-sm text-gray-500">
		<a href="/workflows" class="hover:text-gray-700">Workflows</a>
		<span>→</span>
		<a href="/workflows/{data.workflow.id}" class="hover:text-gray-700">{data.workflow.name}</a>
		<span>→</span>
		<a href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}" class="hover:text-gray-700">
			{data.prompt.name}
		</a>
		<span>→</span>
		<span class="text-gray-900 font-medium">New Version</span>
	</div>

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Version</h1>
		<p class="mt-2 text-gray-600">
			Version {data.nextVersionNumber} for {data.prompt.name}
		</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<form method="POST" use:enhance>
			<div class="space-y-6">
				<!-- Version Tag -->
				<div>
					<label for="version_tag" class="block text-sm font-medium text-gray-700 mb-2">
						Version Tag <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="version_tag"
						name="version_tag"
						value={form?.versionTag || `v${data.nextVersionNumber}.0`}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., v1.0, v1.1-beta"
					/>
					<p class="mt-1 text-xs text-gray-500">
						A human-readable tag for this version (e.g., v1.0, v2.0-beta)
					</p>
				</div>

				<!-- Model Selection -->
				<div>
					<label for="model_id" class="block text-sm font-medium text-gray-700 mb-2">
						AI Model <span class="text-red-500">*</span>
					</label>
					<select
						id="model_id"
						name="model_id"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Select a model...</option>

						<!-- Only show pinned models -->
						{#if pinnedModels.length > 0}
							{#each Array.from(pinnedGroups.entries()).sort((a, b) => a[0].localeCompare(b[0])) as [provider, models]}
								<optgroup label="{provider} ({models.length})">
									{#each models.sort((a, b) => a.name.localeCompare(b.name)) as model}
										<option value={model.id} selected={form?.modelId === model.id}>
											{model.name}
										</option>
									{/each}
								</optgroup>
							{/each}
						{:else}
							<option disabled>No pinned models - visit LLM Models page to pin models</option>
						{/if}
					</select>
					<p class="mt-1 text-xs text-gray-500">
						{#if pinnedModels.length > 0}
							Showing {pinnedModels.length} pinned model{pinnedModels.length === 1 ? '' : 's'}.
							<a href="/llm-models" class="text-blue-600 hover:underline">Manage pinned models</a>
						{:else}
							<span class="text-orange-600">⚠️ No models pinned. </span>
							<a href="/llm-models" class="text-blue-600 hover:underline">Visit LLM Models page to pin models</a>
						{/if}
					</p>
				</div>

				<!-- Published Status -->
				<div class="flex items-start">
					<div class="flex items-center h-5">
						<input
							id="is_published"
							name="is_published"
							type="checkbox"
							checked={form?.isPublished || false}
							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
					</div>
					<div class="ml-3">
						<label for="is_published" class="text-sm font-medium text-gray-700">
							Publish immediately
						</label>
						<p class="text-xs text-gray-500">
							Only one version can be published at a time. This will be used by n8n.
						</p>
					</div>
				</div>

				<!-- Error Message -->
				{#if form?.error}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<p class="text-red-800 text-sm">{form.error}</p>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex justify-between items-center pt-4 border-t">
					<a
						href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}"
						class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
					>
						← Cancel
					</a>
					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Create Version
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Help Text -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<h3 class="text-sm font-semibold text-blue-900 mb-2">Next Steps</h3>
		<p class="text-sm text-blue-800">
			After creating the version, you'll be able to add and organize prompt sections in the order you want.
		</p>
	</div>

	<!-- Pinned Models Info -->
	{#if pinnedModels.length > 0}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
			<h3 class="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
				<svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
				Pinned Models ({pinnedModels.length})
			</h3>
			<div class="grid grid-cols-1 gap-2 text-xs text-gray-700">
				{#each pinnedModels.slice(0, 10) as model}
					<div class="flex items-center">
						<svg class="w-3 h-3 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="font-medium">{model.name}</span>
						<span class="text-gray-500 ml-1">({model.provider})</span>
					</div>
				{/each}
				{#if pinnedModels.length > 10}
					<div class="text-gray-500 italic">
						...and {pinnedModels.length - 10} more
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
			<h3 class="text-sm font-semibold text-orange-900 mb-2">⚠️ No Models Pinned</h3>
			<p class="text-sm text-orange-800 mb-2">
				You need to pin at least one model before you can create a version.
			</p>
			<a
				href="/llm-models"
				class="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
			>
				Go to LLM Models Page →
			</a>
		</div>
	{/if}
</div>
