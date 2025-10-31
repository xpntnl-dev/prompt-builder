<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showDeleteConfirm = false;

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
		<a href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}" class="hover:text-gray-700">
			{data.prompt.name}
		</a>
		<span>→</span>
		<a
			href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/{data.version.id}"
			class="hover:text-gray-700"
		>
			{data.version.version_tag}
		</a>
		<span>→</span>
		<span class="text-gray-900 font-medium">Edit Section</span>
	</div>

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Edit Section</h1>
		<p class="mt-2 text-gray-600">{data.section.section_name}</p>
	</div>

	<!-- Metadata -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div class="grid grid-cols-3 gap-4 text-sm">
			<div>
				<span class="text-blue-600 font-medium">Section ID:</span>
				<span class="text-blue-800 ml-2">{data.section.id}</span>
			</div>
			<div>
				<span class="text-blue-600 font-medium">Order:</span>
				<span class="text-blue-800 ml-2">#{data.section.section_order}</span>
			</div>
			<div>
				<span class="text-blue-600 font-medium">Created:</span>
				<span class="text-blue-800 ml-2">{formatDate(data.section.created_at)}</span>
			</div>
		</div>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" action="?/update" use:enhance class="bg-white rounded-lg shadow p-6 space-y-6">
		<div>
			<label for="sectionName" class="block text-sm font-medium text-gray-700 mb-2">
				Section Name *
			</label>
			<input
				type="text"
				id="sectionName"
				name="sectionName"
				value={form?.sectionName || data.section.section_name}
				required
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="e.g., System Context, Instructions, Examples"
			/>
		</div>

		<div>
			<label for="content" class="block text-sm font-medium text-gray-700 mb-2">
				Content *
			</label>
			<textarea
				id="content"
				name="content"
				required
				rows="15"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
				placeholder="Enter the section content in markdown format..."
			>{form?.content || data.section.content}</textarea>
			<p class="mt-1 text-sm text-gray-500">
				Markdown formatting supported. This will be part of the assembled prompt.
			</p>
		</div>

		<div class="flex justify-between pt-4 border-t">
			<button
				type="button"
				onclick={() => (showDeleteConfirm = true)}
				class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
			>
				Delete Section
			</button>
			<div class="flex space-x-3">
				<a
					href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}/versions/{data.version.id}"
					class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					Cancel
				</a>
				<button
					type="submit"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Update Section
				</button>
			</div>
		</div>
	</form>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		onclick={() => (showDeleteConfirm = false)}
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 class="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
			<p class="text-gray-600 mb-6">
				Are you sure you want to delete the section "<strong>{data.section.section_name}</strong>"?
				This action cannot be undone.
			</p>
			<div class="flex justify-end space-x-3">
				<button
					onclick={() => (showDeleteConfirm = false)}
					class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					Cancel
				</button>
				<form method="POST" action="?/delete" use:enhance>
					<button
						type="submit"
						class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
					>
						Delete Section
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
