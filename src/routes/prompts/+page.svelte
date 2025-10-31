<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
			<h1 class="text-3xl font-bold text-gray-900">All Prompts</h1>
			<p class="text-gray-600 mt-1">Browse all prompts across all workflows</p>
		</div>
	</div>

	<!-- Prompts Grid -->
	{#if data.prompts.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No prompts yet</h3>
			<p class="text-gray-600 mb-4">Create your first prompt in a workflow</p>
			<a
				href="/workflows"
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				Go to Workflows
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.prompts as prompt}
				<div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
					<div class="flex items-start justify-between mb-3">
						<h3 class="text-lg font-semibold text-gray-900 flex-1">{prompt.name}</h3>
					</div>

					{#if prompt.description}
						<p class="text-gray-600 text-sm mb-4 line-clamp-2">{prompt.description}</p>
					{:else}
						<p class="text-gray-400 text-sm mb-4 italic">No description</p>
					{/if}

					<!-- Workflow Badge -->
					<div class="mb-4">
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
							<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
							</svg>
							{prompt.workflows?.name || 'Unknown Workflow'}
						</span>
					</div>

					<!-- Metadata -->
					<div class="text-xs text-gray-500 mb-4">
						<div class="flex items-center">
							<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							Updated: {formatDate(prompt.updated_at)}
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex space-x-2">
						<a
							href="/editor/{prompt.id}"
							class="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Edit
						</a>
						<a
							href="/workflows/{prompt.workflow_id}/prompts/{prompt.id}"
							class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</a>
					</div>
				</div>
			{/each}
		</div>

		<!-- Summary -->
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="text-sm text-blue-800">
				<span class="font-semibold">Total Prompts: {data.prompts.length}</span>
			</div>
		</div>
	{/if}
</div>
