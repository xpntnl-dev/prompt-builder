<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-start">
		<div class="flex-1">
			<div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a href="/workflows" class="hover:text-gray-700">Workflows</a>
				<span>→</span>
				<span class="text-gray-900 font-medium">{data.workflow.name}</span>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">{data.workflow.name}</h1>
			{#if data.workflow.description}
				<p class="mt-2 text-gray-600">{data.workflow.description}</p>
			{/if}
		</div>
		<div class="flex space-x-2">
			<a
				href="/workflows/{data.workflow.id}/edit"
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
			>
				Edit Workflow
			</a>
			<a
				href="/workflows/{data.workflow.id}/prompts/new"
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
			>
				<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				New Prompt
			</a>
		</div>
	</div>

	<!-- Action Result -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<p class="text-green-800 text-sm">Prompt updated successfully</p>
		</div>
	{:else if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Prompts List -->
	{#if data.prompts.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No prompts yet</h3>
			<p class="text-gray-600 mb-4">Create your first prompt for this workflow</p>
			<a
				href="/workflows/{data.workflow.id}/prompts/new"
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				Create Prompt
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.prompts as prompt}
				<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
					<div class="flex justify-between items-start mb-4">
						<div class="flex-1">
							<div class="flex items-center space-x-3 mb-2">
								<h3 class="text-lg font-semibold text-gray-900">{prompt.name}</h3>
								{#if prompt.is_active}
									<span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
										ACTIVE
									</span>
								{:else}
									<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
										INACTIVE
									</span>
								{/if}
							</div>
							{#if prompt.description}
								<p class="text-sm text-gray-600">{prompt.description}</p>
							{:else}
								<p class="text-sm text-gray-400 italic">No description</p>
							{/if}
						</div>
					</div>

					<div class="flex items-center justify-between pt-4 border-t">
						<div class="flex items-center text-xs text-gray-500">
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
							{formatDate(prompt.created_at)}
						</div>

						<div class="flex space-x-2">
							<form method="POST" action="?/toggleActive" use:enhance>
								<input type="hidden" name="promptId" value={prompt.id} />
								<input type="hidden" name="isActive" value={prompt.is_active} />
								<button
									type="submit"
									class="px-3 py-1.5 {prompt.is_active
										? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										: 'bg-green-100 text-green-700 hover:bg-green-200'} rounded transition-colors text-xs font-medium"
								>
									{prompt.is_active ? 'Deactivate' : 'Activate'}
								</button>
							</form>
							<a
								href="/workflows/{data.workflow.id}/prompts/{prompt.id}"
								class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
							>
								View Versions
							</a>
							<a
								href="/workflows/{data.workflow.id}/prompts/{prompt.id}/edit"
								class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
							>
								Edit
							</a>
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
				<span class="font-semibold">Total Prompts: {data.prompts.length}</span>
				{#if data.prompts.length > 0}
					<span class="mx-2">•</span>
					<span>Active: {data.prompts.filter((p) => p.is_active).length}</span>
				{/if}
			</div>
			<a href="/workflows" class="text-sm text-blue-600 hover:text-blue-800">← Back to Workflows</a>
		</div>
	</div>
</div>
