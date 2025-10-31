<script lang="ts">
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';

	export let data: PageData;

	type ViewMode = 'card' | 'list';
	const viewMode = writable<ViewMode>('list');

	// Stats
	$: totalPodcasts = data.podcasts?.length || 0;
	$: activePodcasts = data.podcasts?.filter((p) => p.is_active).length || 0;
	$: totalConfigs = data.podcasts?.reduce((sum, p) => sum + (p.config_count || 0), 0) || 0;

	// Brand color helper
	function getBrandColorClass(color: string | null): string {
		if (!color) return 'bg-gray-500';
		// Just return the color as inline style will be used
		return '';
	}
</script>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Podcasts</h1>
			<p class="mt-2 text-sm text-gray-600">
				Manage your podcast shows and their configurations
			</p>
		</div>
		<a
			href="/podcasts/new"
			class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
		>
			<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v16m8-8H4"
				/>
			</svg>
			New Podcast
		</a>
	</div>

	<!-- Stats Summary -->
	<div class="bg-white shadow rounded-lg p-4">
		<div class="grid grid-cols-3 gap-4 text-center">
			<div>
				<div class="text-2xl font-bold text-gray-900">{totalPodcasts}</div>
				<div class="text-sm text-gray-600">Total Podcasts</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-green-600">{activePodcasts}</div>
				<div class="text-sm text-gray-600">Active</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-blue-600">{totalConfigs}</div>
				<div class="text-sm text-gray-600">Total Configs</div>
			</div>
		</div>
	</div>

	<!-- View Toggle -->
	<div class="flex items-center justify-end space-x-2">
		<button
			on:click={() => viewMode.set('card')}
			class="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md {$viewMode ===
			'card'
				? 'border-blue-500 text-blue-700 bg-blue-50'
				: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
				/>
			</svg>
		</button>
		<button
			on:click={() => viewMode.set('list')}
			class="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md {$viewMode ===
			'list'
				? 'border-blue-500 text-blue-700 bg-blue-50'
				: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>
	</div>

	{#if data.podcasts && data.podcasts.length > 0}
		<!-- Card View -->
		{#if $viewMode === 'card'}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.podcasts as podcast}
					<a
						href="/podcasts/{podcast.id}"
						class="block bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
					>
						<div class="p-6">
							<!-- Header with brand color -->
							<div class="flex items-start justify-between mb-4">
								<div class="flex items-center space-x-3">
									<div
										class="w-3 h-3 rounded-full flex-shrink-0"
										style="background-color: {podcast.brand_color || '#6B7280'}"
									/>
									<h3 class="text-lg font-semibold text-gray-900 line-clamp-1">
										{podcast.podcast_name}
									</h3>
								</div>
								{#if !podcast.is_active}
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
									>
										Inactive
									</span>
								{/if}
							</div>

							{#if podcast.podcast_tagline}
								<p class="text-sm text-gray-600 mb-4 line-clamp-2">{podcast.podcast_tagline}</p>
							{/if}

							{#if podcast.description}
								<p class="text-sm text-gray-500 mb-4 line-clamp-3">{podcast.description}</p>
							{/if}

							<!-- Stats -->
							<div class="flex items-center justify-between pt-4 border-t border-gray-200">
								<div class="flex items-center space-x-4 text-sm text-gray-600">
									<div class="flex items-center">
										<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										<span>{podcast.config_count} {podcast.config_count === 1 ? 'config' : 'configs'}</span>
									</div>
								</div>
								<div class="text-xs text-gray-400">
									{new Date(podcast.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- List View -->
		{#if $viewMode === 'list'}
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Podcast
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Tagline
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Configs
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Status
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Created
							</th>
							<th scope="col" class="relative px-6 py-3">
								<span class="sr-only">Actions</span>
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.podcasts as podcast}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div
											class="w-3 h-3 rounded-full flex-shrink-0 mr-3"
											style="background-color: {podcast.brand_color || '#6B7280'}"
										/>
										<div class="text-sm font-medium text-gray-900">{podcast.podcast_name}</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-600 line-clamp-1">
										{podcast.podcast_tagline || '—'}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{podcast.config_count}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if podcast.is_active}
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
										>
											Active
										</span>
									{:else}
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
										>
											Inactive
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(podcast.created_at).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<a
										href="/podcasts/{podcast.id}"
										class="text-blue-600 hover:text-blue-900 mr-4"
									>
										View
									</a>
									<a
										href="/podcasts/{podcast.id}/edit"
										class="text-gray-600 hover:text-gray-900"
									>
										Edit
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{:else}
		<!-- Empty State -->
		<div class="bg-white shadow rounded-lg p-12 text-center">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No podcasts</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by creating a new podcast show.</p>
			<div class="mt-6">
				<a
					href="/podcasts/new"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Podcast
				</a>
			</div>
		</div>
	{/if}
</div>
