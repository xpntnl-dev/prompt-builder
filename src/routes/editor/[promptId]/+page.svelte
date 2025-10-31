<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import type { PromptSection } from '$lib/types';
	import type { ModelPricingDisplay } from '$lib/types/openrouter';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showPreview = $state(false);
	let editingSection = $state<string | null>(null);
	let editContent = $state<{ [key: string]: string }>({});
	let editName = $state<{ [key: string]: string }>({});
	let deletingSection = $state<number | null>(null); // Now stores section_order
	let deletingVariant = $state<{ sectionOrder: number; variantNumber: number } | null>(null);
	let showVariantDropdown = $state<number | null>(null); // section_order of dropdown to show
	let changingModel = $state(false);
	let selectedModelId = $state<string>('');

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
			// Set initial selected model
			selectedModelId = `${data.version.model_provider}/${data.version.model_name}`;
		}
	});

	// Get pinned models
	const pinnedModels = $derived(data.models.filter(m => pinnedModelIds.has(m.id)));

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

	const pinnedGroups = $derived(groupModelsByProvider(pinnedModels));

	// Group sections by section_order
	// Each group contains all variants for that section position
	type SectionGroup = {
		sectionOrder: number;
		variants: PromptSection[];
		activeVariant: PromptSection;
	};

	let sectionGroups = $state<SectionGroup[]>([]);

	// Watch for data changes and rebuild groups
	$effect(() => {
		const groups = new Map<number, PromptSection[]>();

		// Group sections by section_order
		for (const section of data.sections) {
			if (!groups.has(section.section_order)) {
				groups.set(section.section_order, []);
			}
			groups.get(section.section_order)!.push(section);
		}

		// Convert to array and sort by section_order
		sectionGroups = Array.from(groups.entries())
			.map(([sectionOrder, variants]) => {
				const activeVariant = variants.find(v => v.is_active_variant) || variants[0];
				return {
					sectionOrder,
					variants: variants.sort((a, b) => a.variant_number - b.variant_number),
					activeVariant
				};
			})
			.sort((a, b) => a.sectionOrder - b.sectionOrder);
	});

	async function moveUp(index: number) {
		if (index === 0) return;

		// Swap section groups
		const newGroups = [...sectionGroups];
		[newGroups[index - 1], newGroups[index]] = [newGroups[index], newGroups[index - 1]];
		sectionGroups = newGroups;

		// Save to database
		await saveOrder();
	}

	async function moveDown(index: number) {
		if (index === sectionGroups.length - 1) return;

		// Swap section groups
		const newGroups = [...sectionGroups];
		[newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]];
		sectionGroups = newGroups;

		// Save to database
		await saveOrder();
	}

	async function saveOrder() {
		// Flatten all variants from all groups and update section_order
		const allVariants = sectionGroups.flatMap((group, index) =>
			group.variants.map(variant => ({
				id: variant.id,
				section_order: index + 1
			}))
		);

		const formData = new FormData();
		formData.append('updates', JSON.stringify(allVariants));

		try {
			const response = await fetch('?/reorder', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				console.error('Failed to reorder sections');
				await invalidateAll();
			}
		} catch (error) {
			console.error('Failed to reorder sections:', error);
			await invalidateAll();
		}
	}

	function startEdit(section: any) {
		editingSection = section.id;
		editContent[section.id] = section.content;
		editName[section.id] = section.section_name;
	}

	function cancelEdit() {
		editingSection = null;
	}

	function handleSaveEnhance() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				editingSection = null;
			}
			await update();
		};
	}

	function startDeleteSection(sectionOrder: number, variantCount: number) {
		deletingSection = sectionOrder;
	}

	function cancelDeleteSection() {
		deletingSection = null;
	}

	function handleDeleteSectionEnhance() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				deletingSection = null;
			}
			await update();
		};
	}

	function startDeleteVariant(sectionOrder: number, variantNumber: number) {
		deletingVariant = { sectionOrder, variantNumber };
	}

	function cancelDeleteVariant() {
		deletingVariant = null;
	}

	function handleDeleteVariantEnhance() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				deletingVariant = null;
				showVariantDropdown = null;
			}
			await update();
		};
	}

	async function switchToVariant(sectionOrder: number, targetVariantNumber: number) {
		const formData = new FormData();
		formData.append('versionId', data.version.id);
		formData.append('sectionOrder', sectionOrder.toString());
		formData.append('targetVariantNumber', targetVariantNumber.toString());

		try {
			const response = await fetch('?/switchVariant', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				await invalidateAll();
				showVariantDropdown = null;
			}
		} catch (error) {
			console.error('Failed to switch variant:', error);
		}
	}

	function toggleVariantDropdown(sectionOrder: number) {
		showVariantDropdown = showVariantDropdown === sectionOrder ? null : sectionOrder;
	}

	function getAssembledPrompt(): string {
		return sectionGroups
			.map((group) => `## ${group.activeVariant.section_name}\n\n${group.activeVariant.content}`)
			.join('\n\n---\n\n');
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(getAssembledPrompt());
		alert('Prompt copied to clipboard!');
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Handle version change
	function handleVersionChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newVersionId = select.value;
		window.location.href = `/editor/${data.prompt.id}?version=${newVersionId}`;
	}
</script>

<div class="space-y-6">
	<!-- Breadcrumb -->
	<div class="flex items-center space-x-2 text-sm text-gray-500">
		<a href="/prompts" class="hover:text-gray-700">Prompts</a>
		<span>→</span>
		<span class="text-gray-900 font-medium">{data.prompt.name}</span>
	</div>

	<!-- Header with Version Selector -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<div class="flex justify-between items-start">
			<div class="flex-1">
				<div class="flex items-center space-x-3 mb-3">
					<h1 class="text-3xl font-bold text-gray-900">
						{data.prompt.name}
					</h1>
					<span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded">
						{data.workflow.name}
					</span>
				</div>

				<!-- Version Selector -->
				<div class="flex items-center space-x-4">
					<label for="version-select" class="text-sm font-medium text-gray-700">
						Version:
					</label>
					<select
						id="version-select"
						value={data.version.id}
						onchange={handleVersionChange}
						class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						{#each data.versions as version}
							<option value={version.id}>
								{version.version_tag} (v{version.version_number})
								{#if version.is_active}
									- Active
								{/if}
								{#if version.is_published}
									- Published
								{/if}
							</option>
						{/each}
					</select>

					{#if data.version.is_published}
						<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
							PUBLISHED
						</span>
					{:else if data.version.is_active}
						<span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
							ACTIVE
						</span>
					{:else}
						<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
							DRAFT
						</span>
					{/if}
				</div>

				<!-- Model Selector -->
				<div class="mt-3">
					{#if changingModel}
						<form
							method="POST"
							action="?/updateModel"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										changingModel = false;
									}
									await update();
								};
							}}
						>
							<input type="hidden" name="versionId" value={data.version.id} />
							<div class="flex items-center gap-2">
								<div class="flex-1">
									<select
										name="modelId"
										bind:value={selectedModelId}
										required
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
									>
										<option value="">Select a model...</option>

										<!-- Only show pinned models -->
										{#if pinnedModels.length > 0}
											{#each Array.from(pinnedGroups.entries()).sort((a, b) => a[0].localeCompare(b[0])) as [provider, models]}
												<optgroup label="{provider} ({models.length})">
													{#each models.sort((a, b) => a.name.localeCompare(b.name)) as model}
														<option value={model.id}>
															{model.name}
														</option>
													{/each}
												</optgroup>
											{/each}
										{:else}
											<option disabled>No pinned models - visit LLM Models page</option>
										{/if}
									</select>
								</div>
								<button
									type="submit"
									class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
								>
									Save
								</button>
								<button
									type="button"
									onclick={() => {
										changingModel = false;
										selectedModelId = `${data.version.model_provider}/${data.version.model_name}`;
									}}
									class="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
								>
									Cancel
								</button>
							</div>
							<p class="text-xs text-gray-500 mt-1">
								{#if pinnedModels.length > 0}
									Showing {pinnedModels.length} pinned model{pinnedModels.length === 1 ? '' : 's'}.
									<a href="/llm-models" class="text-blue-600 hover:underline">Manage models</a>
								{:else}
									<a href="/llm-models" class="text-blue-600 hover:underline">Pin models in LLM Models page</a>
								{/if}
							</p>
						</form>
					{:else}
						<div class="flex items-center gap-2">
							<div class="text-gray-600 text-sm">
								Model: <span class="font-medium">{data.version.model_provider}/{data.version.model_name}</span>
							</div>
							<button
								onclick={() => (changingModel = true)}
								class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
								title="Change model"
							>
								Change
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex space-x-2">
				{#if data.sections.length > 0}
					<button
						onclick={() => (showPreview = true)}
						class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
					>
						Preview Prompt
					</button>
				{/if}
				<a
					href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/{data.version.id}/sections/new"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
				>
					<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
					Add Section
				</a>
			</div>
		</div>
	</div>

	<!-- Action Result -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<p class="text-green-800 text-sm">{form.message || 'Action completed successfully'}</p>
		</div>
	{:else if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Sections List -->
	{#if data.sections.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No sections yet</h3>
			<p class="text-gray-600 mb-4">Create your first section for this version</p>
			<a
				href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/{data.version.id}/sections/new"
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				Create Section
			</a>
		</div>
	{:else}
		<div class="space-y-3">
			{#each sectionGroups as group, index (group.sectionOrder)}
				{@const section = group.activeVariant}
				<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
					<div class="flex items-start">
						<!-- Up/Down buttons -->
						<div class="flex-shrink-0 mr-4 flex flex-col space-y-1">
							<button
								onclick={() => moveUp(index)}
								disabled={index === 0}
								class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								title="Move up"
							>
								<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
								</svg>
							</button>
							<button
								onclick={() => moveDown(index)}
								disabled={index === sectionGroups.length - 1}
								class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								title="Move down"
							>
								<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
							</button>
						</div>
						<div class="flex-1 min-w-0">
							<!-- Header -->
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center space-x-2 flex-1 min-w-0">
									<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex-shrink-0">
										#{index + 1}
									</span>
									{#if editingSection === section.id}
										<input
											type="text"
											bind:value={editName[section.id]}
											class="flex-1 text-lg font-semibold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent min-w-0"
											placeholder="Section name"
										/>
									{:else}
										<h3 class="text-lg font-semibold text-gray-900">{section.section_name}</h3>
									{/if}

									<!-- Variant Badge (only show if multiple variants exist) -->
									{#if group.variants.length > 1}
										<span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded flex-shrink-0">
											Variant {section.variant_number}/{group.variants.length}
										</span>
									{/if}
								</div>

								{#if editingSection === section.id}
									<!-- Editing Mode Buttons -->
									<div class="flex items-center space-x-2">
										<button
											onclick={cancelEdit}
											class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
										>
											Cancel
										</button>
										<form method="POST" action="?/updateSection" use:enhance={handleSaveEnhance}>
											<input type="hidden" name="sectionId" value={section.id} />
											<input type="hidden" name="sectionName" value={editName[section.id]} />
											<input type="hidden" name="content" value={editContent[section.id]} />
											<button
												type="submit"
												class="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
											>
												Save
											</button>
										</form>
									</div>
								{:else}
									<!-- View Mode Buttons -->
									<div class="flex items-center space-x-2">
										<!-- Variant Controls (only if multiple variants) -->
										{#if group.variants.length > 1}
											<div class="relative">
												<button
													onclick={() => toggleVariantDropdown(group.sectionOrder)}
													class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs font-medium flex items-center space-x-1"
												>
													<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01"></path>
													</svg>
													<span>Variants</span>
												</button>

												{#if showVariantDropdown === group.sectionOrder}
													<div class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
														<div class="py-1">
															{#each group.variants as variant}
																<button
																	onclick={() => switchToVariant(group.sectionOrder, variant.variant_number)}
																	class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
																	class:bg-purple-50={variant.is_active_variant}
																	class:font-semibold={variant.is_active_variant}
																>
																	<span>Variant {variant.variant_number}</span>
																	{#if variant.is_active_variant}
																		<svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
																			<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
																		</svg>
																	{:else}
																		<button
																			onclick={(e) => { e.stopPropagation(); startDeleteVariant(group.sectionOrder, variant.variant_number); }}
																			class="text-red-600 hover:text-red-800"
																			title="Delete variant"
																		>
																			<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
																			</svg>
																		</button>
																	{/if}
																</button>
															{/each}

															<div class="border-t border-gray-200 mt-1 pt-1">
																<form method="POST" action="?/duplicateVariant" use:enhance>
																	<input type="hidden" name="versionId" value={data.version.id} />
																	<input type="hidden" name="sectionOrder" value={group.sectionOrder} />
																	<input type="hidden" name="sourceVariantNumber" value={section.variant_number} />
																	<button
																		type="submit"
																		class="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
																	>
																		+ Duplicate Variant
																	</button>
																</form>
															</div>
														</div>
													</div>
												{/if}
											</div>
										{/if}

										<!-- Create Variant Button -->
										<form method="POST" action="?/createVariant" use:enhance>
											<input type="hidden" name="versionId" value={data.version.id} />
											<input type="hidden" name="sectionOrder" value={group.sectionOrder} />
											<button
												type="submit"
												disabled={group.variants.length >= 5}
												class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs font-medium flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
												title={group.variants.length >= 5 ? 'Maximum 5 variants allowed' : 'Create new variant'}
											>
												+ Variant
											</button>
										</form>

										<button
											onclick={() => startEdit(section)}
											class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium flex-shrink-0"
										>
											Edit
										</button>
										<button
											onclick={() => startDeleteSection(group.sectionOrder, group.variants.length)}
											class="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium flex-shrink-0"
										>
											Delete
										</button>
									</div>
								{/if}
							</div>

							<!-- Content -->
							{#if editingSection === section.id}
								<textarea
									bind:value={editContent[section.id]}
									rows="10"
									class="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
									placeholder="Section content in markdown..."
								></textarea>
							{:else}
								<div
									class="mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
									onclick={() => startEdit(section)}
								>
									<pre class="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">{section.content}</pre>
								</div>
							{/if}

							<!-- Footer -->
							<div class="text-xs text-gray-500 border-t pt-2">
								Created: {formatDate(section.created_at)}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Summary -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div class="flex items-center justify-between">
			<div class="text-sm text-blue-800">
				<span class="font-semibold">Total Sections: {data.sections.length}</span>
			</div>
			<a
				href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}"
				class="text-sm text-blue-600 hover:text-blue-800"
			>
				← Back to Versions
			</a>
		</div>
	</div>
</div>

<!-- Preview Modal -->
{#if showPreview}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		onclick={() => (showPreview = false)}
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="p-6 border-b flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-900">Assembled Prompt Preview</h2>
				<button onclick={() => (showPreview = false)} class="text-gray-500 hover:text-gray-700">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			<div class="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
				<pre class="bg-gray-50 p-6 rounded-lg text-sm whitespace-pre-wrap font-mono border border-gray-200">{getAssembledPrompt()}</pre>
			</div>
			<div class="p-6 border-t flex justify-end space-x-3">
				<button
					onclick={() => (showPreview = false)}
					class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					Close
				</button>
				<button
					onclick={copyToClipboard}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Copy to Clipboard
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Section Confirmation Modal -->
{#if deletingSection !== null}
	{@const group = sectionGroups.find(g => g.sectionOrder === deletingSection)}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		onclick={cancelDeleteSection}
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-md w-full"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="p-6">
				<div class="flex items-center mb-4">
					<div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-semibold text-gray-900">Delete Section</h3>
						<p class="text-sm text-gray-500">This action cannot be undone</p>
					</div>
				</div>

				{#if group}
					<p class="text-sm text-gray-700 mb-2">
						Are you sure you want to delete the section <strong>"{group.activeVariant.section_name}"</strong>?
					</p>
					{#if group.variants.length > 1}
						<p class="text-sm text-red-600 font-medium mb-4">
							⚠️ This will delete all {group.variants.length} variants of this section.
						</p>
					{/if}
				{/if}

				<div class="flex justify-end space-x-3">
					<button
						onclick={cancelDeleteSection}
						class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
					>
						Cancel
					</button>
					<form method="POST" action="?/deleteSection" use:enhance={handleDeleteSectionEnhance}>
						<input type="hidden" name="versionId" value={data.version.id} />
						<input type="hidden" name="sectionOrder" value={deletingSection} />
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
						>
							Delete Section
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Variant Confirmation Modal -->
{#if deletingVariant}
	{@const group = sectionGroups.find(g => g.sectionOrder === deletingVariant.sectionOrder)}
	{@const variant = group?.variants.find(v => v.variant_number === deletingVariant.variantNumber)}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		onclick={cancelDeleteVariant}
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-md w-full"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="p-6">
				<div class="flex items-center mb-4">
					<div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-semibold text-gray-900">Delete Variant</h3>
						<p class="text-sm text-gray-500">This action cannot be undone</p>
					</div>
				</div>

				{#if variant}
					<p class="text-sm text-gray-700 mb-4">
						Are you sure you want to delete <strong>Variant {variant.variant_number}</strong> of section <strong>"{variant.section_name}"</strong>?
					</p>
				{/if}

				<div class="flex justify-end space-x-3">
					<button
						onclick={cancelDeleteVariant}
						class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
					>
						Cancel
					</button>
					<form method="POST" action="?/deleteVariant" use:enhance={handleDeleteVariantEnhance}>
						<input type="hidden" name="versionId" value={data.version.id} />
						<input type="hidden" name="sectionOrder" value={deletingVariant.sectionOrder} />
						<input type="hidden" name="variantNumber" value={deletingVariant.variantNumber} />
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
						>
							Delete Variant
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}
