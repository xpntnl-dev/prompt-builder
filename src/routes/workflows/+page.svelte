<script lang="ts">
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';

	export let data: PageData;

	type ViewMode = 'cards' | 'list';
	const viewMode = writable<ViewMode>('list');

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Agent Workflows</h1>
			<p class="mt-2 text-gray-600">Manage n8n agentic workflow configurations</p>
		</div>
		<div class="flex items-center space-x-3">
			<!-- View Toggle -->
			<div class="flex bg-gray-100 rounded-lg p-1">
				<button
					on:click={() => viewMode.set('cards')}
					class="px-3 py-2 rounded transition-colors {$viewMode === 'cards'
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-gray-600 hover:text-gray-900'}"
					title="Card view"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
					</svg>
				</button>
				<button
					on:click={() => viewMode.set('list')}
					class="px-3 py-2 rounded transition-colors {$viewMode === 'list'
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-gray-600 hover:text-gray-900'}"
					title="List view"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</button>
			</div>

			<a
				href="/workflows/new"
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				New Workflow
			</a>
		</div>
	</div>

	<!-- Error Message -->
	{#if data.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">Error loading workflows: {data.error}</p>
		</div>
	{/if}

	<!-- Workflows List -->
	{#if data.workflows.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No workflows yet</h3>
			<p class="text-gray-600 mb-4">Get started by creating your first workflow</p>
			<a
				href="/workflows/new"
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				Create Workflow
			</a>
		</div>
	{:else if $viewMode === 'cards'}
		<!-- Card View -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.workflows as workflow}
				<div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
					<div class="flex justify-between items-start mb-4">
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-gray-900 mb-1">{workflow.name}</h3>
							{#if workflow.description}
								<p class="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
							{:else}
								<p class="text-sm text-gray-400 italic">No description</p>
							{/if}
						</div>
					</div>

					<div class="flex items-center justify-between text-xs text-gray-500 mb-4">
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
							{formatDate(workflow.created_at)}
						</div>
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
							</svg>
							{workflow.prompt_count || 0} prompt{workflow.prompt_count !== 1 ? 's' : ''}
						</div>
					</div>

					<div class="flex space-x-2">
						<a
							href="/workflows/{workflow.id}"
							class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center text-sm font-medium"
						>
							View Prompts
						</a>
						<a
							href="/workflows/{workflow.id}/edit"
							class="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-center text-sm font-medium"
						>
							Edit
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- List View -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Workflow
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Prompts
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Created
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.workflows as workflow}
						<tr class="hover:bg-gray-50 transition-colors">
							<td class="px-6 py-4">
								<div class="flex flex-col">
									<a href="/workflows/{workflow.id}" class="text-sm font-medium text-gray-900 hover:text-blue-600">
										{workflow.name}
									</a>
									{#if workflow.description}
										<p class="text-sm text-gray-500 mt-1 line-clamp-1">{workflow.description}</p>
									{:else}
										<p class="text-sm text-gray-400 italic mt-1">No description</p>
									{/if}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center text-sm text-gray-500">
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
									</svg>
									{workflow.prompt_count || 0}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{formatDate(workflow.created_at)}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<div class="flex justify-end space-x-2">
									<a
										href="/workflows/{workflow.id}"
										class="text-gray-600 hover:text-gray-900"
										title="View Prompts"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
										</svg>
									</a>
									<a
										href="/workflows/{workflow.id}/edit"
										class="text-blue-600 hover:text-blue-900"
										title="Edit"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
										</svg>
									</a>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Stats Summary -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm text-blue-800 font-semibold">Total Workflows: {data.workflows.length}</p>
			</div>
			<a href="/" class="text-sm text-blue-600 hover:text-blue-800">← Back to Dashboard</a>
		</div>
	</div>
</div>
