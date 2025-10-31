<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import type { SortConfig, ModelPricingDisplay } from '$lib/types/openrouter';

	// Props from server load function
	let { data }: { data: PageData } = $props();

	// Reactive state using Svelte 5 runes
	let searchQuery = $state('');
	let selectedProvider = $state<string>('all');
	let sortConfig = $state<SortConfig>({ column: 'name', direction: 'asc' });
	let isRefreshing = $state(false);
	let currentPage = $state(1);
	let itemsPerPage = $state(25);
	let pinnedModelIds = $state<Set<string>>(new Set());

	// LocalStorage key for pinned models
	const STORAGE_KEY = 'rvkcat_pinned_models';

	/**
	 * Load pinned models from localStorage on mount
	 */
	$effect(() => {
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

	/**
	 * Save pinned models to localStorage whenever they change
	 */
	$effect(() => {
		if (browser && pinnedModelIds.size >= 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(pinnedModelIds)));
		}
	});

	/**
	 * Toggle pin status for a model
	 */
	function togglePin(modelId: string) {
		const newPinned = new Set(pinnedModelIds);
		if (newPinned.has(modelId)) {
			newPinned.delete(modelId);
		} else {
			newPinned.add(modelId);
		}
		pinnedModelIds = newPinned;
	}

	/**
	 * Check if a model is pinned
	 */
	function isPinned(modelId: string): boolean {
		return pinnedModelIds.has(modelId);
	}

	/**
	 * Reset to first page when search query changes
	 */
	$effect(() => {
		if (searchQuery) {
			currentPage = 1;
		}
	});

	/**
	 * Get unique providers from models
	 */
	const providers = $derived(() => {
		const providerSet = new Set(data.models.map((m) => m.provider));
		return Array.from(providerSet).sort();
	});

	/**
	 * Get pinned models with sorting applied
	 */
	const pinnedModels = $derived(() => {
		const pinned = data.models.filter((model) => pinnedModelIds.has(model.id));
		const { column, direction } = sortConfig;

		// Apply same sorting as main table
		pinned.sort((a, b) => {
			let aVal: string | number;
			let bVal: string | number;

			switch (column) {
				case 'name':
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
					break;
				case 'promptPrice':
					aVal = a.promptPrice;
					bVal = b.promptPrice;
					break;
				case 'completionPrice':
					aVal = a.completionPrice;
					bVal = b.completionPrice;
					break;
				case 'contextLength':
					aVal = a.contextLength;
					bVal = b.contextLength;
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return direction === 'asc' ? -1 : 1;
			if (aVal > bVal) return direction === 'asc' ? 1 : -1;
			return 0;
		});

		return pinned;
	});

	/**
	 * Filtered models based on search query and provider
	 */
	const filteredModels = $derived(() => {
		let filtered = data.models;

		// Filter by provider
		if (selectedProvider !== 'all') {
			filtered = filtered.filter((model) => model.provider === selectedProvider);
		}

		// Filter by search query (instant - no debounce)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(model) =>
					model.name.toLowerCase().includes(query) ||
					model.id.toLowerCase().includes(query) ||
					model.provider.toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	/**
	 * Sorted models based on current sort configuration
	 */
	const sortedModels = $derived(() => {
		const models = [...filteredModels()];
		const { column, direction } = sortConfig;

		models.sort((a, b) => {
			let aVal: string | number;
			let bVal: string | number;

			switch (column) {
				case 'name':
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
					break;
				case 'promptPrice':
					aVal = a.promptPrice;
					bVal = b.promptPrice;
					break;
				case 'completionPrice':
					aVal = a.completionPrice;
					bVal = b.completionPrice;
					break;
				case 'contextLength':
					aVal = a.contextLength;
					bVal = b.contextLength;
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return direction === 'asc' ? -1 : 1;
			if (aVal > bVal) return direction === 'asc' ? 1 : -1;
			return 0;
		});

		return models;
	});

	/**
	 * Paginated models
	 */
	const paginatedModels = $derived(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return sortedModels().slice(start, end);
	});

	/**
	 * Total pages
	 */
	const totalPages = $derived(Math.ceil(sortedModels().length / itemsPerPage));

	/**
	 * Page numbers to display in pagination
	 */
	const pageNumbers = $derived(() => {
		const pages: number[] = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show first, last, and pages around current
			const startPage = Math.max(1, currentPage - 2);
			const endPage = Math.min(totalPages, currentPage + 2);

			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}
		}

		return pages;
	});

	/**
	 * Toggle sort column/direction
	 */
	function toggleSort(column: SortConfig['column']) {
		if (sortConfig.column === column) {
			sortConfig = {
				column,
				direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
			};
		} else {
			sortConfig = { column, direction: 'asc' };
		}
	}

	/**
	 * Get sort indicator icon
	 */
	function getSortIcon(column: SortConfig['column']): string {
		if (sortConfig.column !== column) return '↕';
		return sortConfig.direction === 'asc' ? '↑' : '↓';
	}

	/**
	 * Format price for display (convert to dollars per million tokens)
	 */
	function formatPrice(price: number): string {
		if (price === 0) return '$0';
		const pricePerMillion = price * 1_000_000;
		if (pricePerMillion < 0.01) return `$${pricePerMillion.toExponential(2)}`;
		return `$${pricePerMillion.toFixed(2)}`;
	}

	/**
	 * Format context length with commas
	 */
	function formatContextLength(length: number): string {
		return length.toLocaleString();
	}

	/**
	 * Change items per page
	 */
	function changeItemsPerPage(newValue: number) {
		itemsPerPage = newValue;
		currentPage = 1; // Reset to first page
	}

	/**
	 * Go to specific page
	 */
	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	/**
	 * Reset all filters
	 */
	function resetFilters() {
		searchQuery = '';
		selectedProvider = 'all';
		currentPage = 1;
	}

	/**
	 * Copy model ID to clipboard
	 */
	let copiedModelId = $state<string | null>(null);

	async function copyModelId(modelId: string) {
		if (!browser) return;

		try {
			await navigator.clipboard.writeText(modelId);
			copiedModelId = modelId;

			// Reset after 2 seconds
			setTimeout(() => {
				copiedModelId = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy model ID:', err);
		}
	}

	/**
	 * Get OpenRouter model URL
	 */
	function getModelUrl(modelId: string): string {
		return `https://openrouter.ai/${modelId}`;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">LLM Model Pricing</h1>
		<p class="text-gray-600">
			Compare prices for {data.models.length} models from OpenRouter
			{#if pinnedModelIds.size > 0}
				<span class="text-blue-600">• {pinnedModelIds.size} pinned</span>
			{/if}
		</p>
		<p class="text-sm text-gray-500 mt-1">
			Last updated: {new Date(data.lastFetched).toLocaleString()}
		</p>
	</div>

	<!-- Controls -->
	<div class="mb-6 space-y-4">
		<!-- Search and Filters Row -->
		<div class="flex flex-col md:flex-row gap-4">
			<!-- Search Input -->
			<div class="flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Filter models by name, ID, or provider..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Provider Filter -->
			<div class="w-full md:w-48">
				<select
					bind:value={selectedProvider}
					onchange={() => (currentPage = 1)}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
				>
					<option value="all">All Providers ({data.models.length})</option>
					{#each providers() as provider}
						{@const count = data.models.filter((m) => m.provider === provider).length}
						<option value={provider}>{provider} ({count})</option>
					{/each}
				</select>
			</div>

			<!-- Refresh Button -->
			<form method="POST" action="?/refresh" use:enhance={() => {
				isRefreshing = true;
				return async ({ update }) => {
					await update();
					isRefreshing = false;
				};
			}}>
				<button
					type="submit"
					disabled={isRefreshing}
					class="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
				>
					{isRefreshing ? 'Refreshing...' : 'Refresh'}
				</button>
			</form>
		</div>

		<!-- Active Filters and Reset -->
		{#if selectedProvider !== 'all' || searchQuery}
			<div class="flex items-center gap-2 text-sm">
				<span class="text-gray-600">Active filters:</span>
				{#if selectedProvider !== 'all'}
					<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded">Provider: {selectedProvider}</span>
				{/if}
				{#if searchQuery}
					<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded">Search: "{searchQuery}"</span>
				{/if}
				<button
					onclick={resetFilters}
					class="px-2 py-1 text-blue-600 hover:text-blue-800 underline"
				>
					Clear all
				</button>
			</div>
		{/if}
	</div>

	<!-- Pinned Models Section -->
	{#if pinnedModels().length > 0}
		<div class="mb-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
				<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
				Pinned Models ({pinnedModels().length})
			</h2>
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<tbody class="divide-y divide-yellow-200">
							{#each pinnedModels() as model (model.id)}
								<tr class="hover:bg-yellow-100 transition-colors">
									<td class="px-6 py-3">
										<div class="font-medium text-gray-900">{model.name}</div>
										<div class="text-sm text-gray-500 flex items-center gap-2">
											<span>{model.id}</span>
											<!-- Copy ID Button -->
											<button
												onclick={() => copyModelId(model.id)}
												class="text-gray-400 hover:text-gray-600 transition-colors"
												title="Copy model ID"
											>
												{#if copiedModelId === model.id}
													<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
													</svg>
												{:else}
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
													</svg>
												{/if}
											</button>
											<!-- External Link Button -->
											<a
												href={getModelUrl(model.id)}
												target="_blank"
												rel="noopener noreferrer"
												class="text-gray-400 hover:text-blue-600 transition-colors"
												title="View on OpenRouter"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
												</svg>
											</a>
										</div>
									</td>
									<td class="px-6 py-3 text-gray-700 text-sm">
										<span class="text-gray-500">Prompt:</span> {formatPrice(model.promptPrice)}
									</td>
									<td class="px-6 py-3 text-gray-700 text-sm">
										<span class="text-gray-500">Completion:</span> {formatPrice(model.completionPrice)}
									</td>
									<td class="px-6 py-3 text-gray-700 text-sm">
										<span class="text-gray-500">Context:</span> {formatContextLength(model.contextLength)}
									</td>
									<td class="px-6 py-3 text-right">
										<button
											onclick={() => togglePin(model.id)}
											class="text-yellow-600 hover:text-yellow-800 transition-colors"
											title="Unpin model"
										>
											<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Results Count and Items Per Page -->
	<div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
		<div class="text-sm text-gray-600">
			Showing {paginatedModels().length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, sortedModels().length)} of {sortedModels().length} models
			{#if sortedModels().length !== data.models.length}
				(filtered from {data.models.length} total)
			{/if}
		</div>

		<!-- Items Per Page Selector -->
		<div class="flex items-center gap-2 text-sm">
			<span class="text-gray-600">Show:</span>
			{#each [25, 50, 100] as perPage}
				<button
					onclick={() => changeItemsPerPage(perPage)}
					class="px-3 py-1 rounded {itemsPerPage === perPage
						? 'bg-blue-600 text-white'
						: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
				>
					{perPage}
				</button>
			{/each}
		</div>
	</div>

	<!-- Table -->
	<div class="bg-white shadow-md rounded-lg overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-6 py-3 text-left">
							<button
								onclick={() => toggleSort('name')}
								class="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
							>
								Model Name
								<span class="text-gray-400">{getSortIcon('name')}</span>
							</button>
						</th>
						<th class="px-6 py-3 text-left">
							<button
								onclick={() => toggleSort('promptPrice')}
								class="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
							>
								Prompt
								<span class="text-gray-400">{getSortIcon('promptPrice')}</span>
							</button>
						</th>
						<th class="px-6 py-3 text-left">
							<button
								onclick={() => toggleSort('completionPrice')}
								class="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
							>
								Completion
								<span class="text-gray-400">{getSortIcon('completionPrice')}</span>
							</button>
						</th>
						<th class="px-6 py-3 text-left">
							<button
								onclick={() => toggleSort('contextLength')}
								class="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
							>
								Context Length
								<span class="text-gray-400">{getSortIcon('contextLength')}</span>
							</button>
						</th>
						<th class="px-6 py-3 text-center w-20">
							<span class="font-semibold text-gray-700">Pin</span>
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each paginatedModels() as model (model.id)}
						<tr class="hover:bg-gray-50 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-start gap-2">
									<div class="flex-1">
										<div class="font-medium text-gray-900">{model.name}</div>
										<div class="text-sm text-gray-500 flex items-center gap-2">
											<span>{model.id}</span>
											<!-- Copy ID Button -->
											<button
												onclick={() => copyModelId(model.id)}
												class="text-gray-400 hover:text-gray-600 transition-colors relative"
												title="Copy model ID"
											>
												{#if copiedModelId === model.id}
													<!-- Checkmark icon for copied state -->
													<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
													</svg>
												{:else}
													<!-- Copy icon -->
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
													</svg>
												{/if}
											</button>
											<!-- External Link Button -->
											<a
												href={getModelUrl(model.id)}
												target="_blank"
												rel="noopener noreferrer"
												class="text-gray-400 hover:text-blue-600 transition-colors"
												title="View on OpenRouter"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
												</svg>
											</a>
										</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 text-gray-700">
								{formatPrice(model.promptPrice)}
							</td>
							<td class="px-6 py-4 text-gray-700">
								{formatPrice(model.completionPrice)}
							</td>
							<td class="px-6 py-4 text-gray-700">
								{formatContextLength(model.contextLength)}
							</td>
							<td class="px-6 py-4 text-center">
								<button
									onclick={() => togglePin(model.id)}
									class="transition-colors {isPinned(model.id)
										? 'text-yellow-500 hover:text-yellow-600'
										: 'text-gray-300 hover:text-gray-400'}"
									title={isPinned(model.id) ? 'Unpin model' : 'Pin model'}
								>
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-8 text-center text-gray-500">
								{#if searchQuery || selectedProvider !== 'all'}
									No models found matching your filters. <button onclick={resetFilters} class="text-blue-600 hover:underline">Clear filters</button>
								{:else}
									No models available
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
			<!-- Previous Button -->
			<button
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
				class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
			>
				← Previous
			</button>

			<!-- Page Numbers -->
			<div class="flex gap-2">
				{#if pageNumbers()[0] > 1}
					<button
						onclick={() => goToPage(1)}
						class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
					>
						1
					</button>
					{#if pageNumbers()[0] > 2}
						<span class="px-2 py-1">...</span>
					{/if}
				{/if}

				{#each pageNumbers() as page}
					<button
						onclick={() => goToPage(page)}
						class="px-3 py-1 rounded {currentPage === page
							? 'bg-blue-600 text-white'
							: 'border border-gray-300 hover:bg-gray-50'}"
					>
						{page}
					</button>
				{/each}

				{#if pageNumbers()[pageNumbers().length - 1] < totalPages}
					{#if pageNumbers()[pageNumbers().length - 1] < totalPages - 1}
						<span class="px-2 py-1">...</span>
					{/if}
					<button
						onclick={() => goToPage(totalPages)}
						class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
					>
						{totalPages}
					</button>
				{/if}
			</div>

			<!-- Next Button -->
			<button
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
				class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
			>
				Next →
			</button>
		</div>
	{/if}

	<!-- Info Footer -->
	<div class="mt-6 text-sm text-gray-600">
		<p>
			<strong>Note:</strong> Prices shown are per million tokens. Data is cached for 15 minutes. Pinned models are saved in your browser.
		</p>
	</div>
</div>

<style>
	/* Ensure table headers are clickable */
	th button {
		width: 100%;
		text-align: left;
	}
</style>
