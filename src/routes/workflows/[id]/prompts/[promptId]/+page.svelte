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
	<!-- Breadcrumb -->
	<div class="flex items-center space-x-2 text-sm text-gray-500">
		<a href="/workflows" class="hover:text-gray-700">Workflows</a>
		<span>→</span>
		<a href="/workflows/{data.workflow.id}" class="hover:text-gray-700">{data.workflow.name}</a>
		<span>→</span>
		<span class="text-gray-900 font-medium">{data.prompt.name}</span>
	</div>

	<!-- Header -->
	<div class="flex justify-between items-start">
		<div class="flex-1">
			<h1 class="text-3xl font-bold text-gray-900">{data.prompt.name}</h1>
			{#if data.prompt.description}
				<p class="mt-2 text-gray-600">{data.prompt.description}</p>
			{/if}
			<div class="mt-2 flex items-center space-x-2">
				{#if data.prompt.is_active}
					<span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
						ACTIVE
					</span>
				{:else}
					<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
						INACTIVE
					</span>
				{/if}
			</div>
		</div>
		<div class="flex space-x-2">
			<a
				href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/edit"
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
			>
				Edit Prompt
			</a>
			<a
				href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/new"
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
			>
				<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				New Version
			</a>
		</div>
	</div>

	<!-- Action Result -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<p class="text-green-800 text-sm">Version updated successfully</p>
		</div>
	{:else if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Versions List -->
	{#if data.versions.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
			</svg>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No versions yet</h3>
			<p class="text-gray-600 mb-4">Create your first version for this prompt</p>
			<a
				href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/new"
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				Create Version
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.versions as version}
				<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
					<div class="flex justify-between items-start mb-4">
						<div class="flex-1">
							<div class="flex items-center space-x-3 mb-2">
								<h3 class="text-lg font-semibold text-gray-900">
									{version.version_tag} <span class="text-gray-500 text-sm">v{version.version_number}</span>
								</h3>
								{#if version.is_published}
									<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
										PUBLISHED
									</span>
								{:else}
									<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
										DRAFT
									</span>
								{/if}
							</div>
							<div class="flex items-center space-x-4 text-sm text-gray-600">
								<div class="flex items-center">
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
									</svg>
									{version.model_provider}/{version.model_name}
								</div>
								<div class="flex items-center">
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
									</svg>
									{version.section_count} {version.section_count === 1 ? 'section' : 'sections'}
								</div>
								<div class="flex items-center">
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
									{formatDate(version.created_at)}
								</div>
							</div>
						</div>
					</div>

					<div class="flex items-center justify-between pt-4 border-t">
						<div class="text-xs text-gray-500">
							Last updated: {formatDate(version.updated_at)}
						</div>

						<div class="flex space-x-2">
							<form method="POST" action="?/togglePublish" use:enhance>
								<input type="hidden" name="versionId" value={version.id} />
								<input type="hidden" name="isPublished" value={version.is_published} />
								<button
									type="submit"
									class="px-3 py-1.5 {version.is_published
										? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										: 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded transition-colors text-xs font-medium"
								>
									{version.is_published ? 'Unpublish' : 'Publish'}
								</button>
							</form>
							<a
								href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/{version.id}"
								class="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs font-medium"
							>
								Manage Sections
							</a>
							<a
								href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/{version.id}/edit"
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
				<span class="font-semibold">Total Versions: {data.versions.length}</span>
				{#if data.versions.length > 0}
					<span class="mx-2">•</span>
					<span>Published: {data.versions.filter((v) => v.is_published).length}</span>
				{/if}
			</div>
			<a href="/workflows/{data.workflow.id}" class="text-sm text-blue-600 hover:text-blue-800">
				← Back to Prompts
			</a>
		</div>
	</div>
</div>
