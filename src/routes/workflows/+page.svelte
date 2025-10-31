<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

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
	{:else}
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
