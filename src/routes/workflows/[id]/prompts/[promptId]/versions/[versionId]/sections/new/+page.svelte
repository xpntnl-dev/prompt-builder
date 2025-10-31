<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
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
		<span class="text-gray-900 font-medium">New Section</span>
	</div>

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Section</h1>
		<p class="mt-2 text-gray-600">
			Add a new section to {data.version.version_tag} v{data.version.version_number}
		</p>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" use:enhance class="bg-white rounded-lg shadow p-6 space-y-6">
		<div>
			<label for="sectionName" class="block text-sm font-medium text-gray-700 mb-2">
				Section Name *
			</label>
			<input
				type="text"
				id="sectionName"
				name="sectionName"
				value={form?.sectionName || ''}
				required
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="e.g., System Context, Instructions, Examples"
			/>
			<p class="mt-1 text-sm text-gray-500">A descriptive name for this section</p>
		</div>

		<div>
			<label for="content" class="block text-sm font-medium text-gray-700 mb-2">
				Content *
			</label>
			<textarea
				id="content"
				name="content"
				value={form?.content || ''}
				required
				rows="15"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
				placeholder="Enter the section content in markdown format..."
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				Markdown formatting supported. This will be part of the assembled prompt.
			</p>
		</div>

		<div class="flex justify-end space-x-3 pt-4 border-t">
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
				Create Section
			</button>
		</div>
	</form>
</div>
