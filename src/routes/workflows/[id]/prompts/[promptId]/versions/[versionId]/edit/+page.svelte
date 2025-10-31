<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showDeleteConfirm = false;

	// Find the currently selected model ID
	$: selectedModelId =
		data.models.find(
			(m) => m.provider === data.version.model_provider && m.model_name === data.version.model_name
		)?.id || '';
</script>

<div class="max-w-2xl mx-auto space-y-6">
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
		<span class="text-gray-900 font-medium">Edit {data.version.version_tag}</span>
	</div>

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Edit Version</h1>
		<p class="mt-2 text-gray-600">
			Version {data.version.version_number} - {data.version.version_tag}
		</p>
	</div>

	<!-- Edit Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<form method="POST" action="?/update" use:enhance>
			<div class="space-y-6">
				<!-- Version Tag -->
				<div>
					<label for="version_tag" class="block text-sm font-medium text-gray-700 mb-2">
						Version Tag <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="version_tag"
						name="version_tag"
						value={form?.versionTag || data.version.version_tag}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., v1.0, v1.1-beta"
					/>
					<p class="mt-1 text-xs text-gray-500">
						A human-readable tag for this version (e.g., v1.0, v2.0-beta)
					</p>
				</div>

				<!-- Model Selection -->
				<div>
					<label for="model_id" class="block text-sm font-medium text-gray-700 mb-2">
						AI Model <span class="text-red-500">*</span>
					</label>
					<select
						id="model_id"
						name="model_id"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Select a model...</option>
						{#each data.models as model}
							<option value={model.id} selected={form?.modelId === model.id || model.id === selectedModelId}>
								{model.display_name} ({model.provider}/{model.model_name})
							</option>
						{/each}
					</select>
					<p class="mt-1 text-xs text-gray-500">Choose the AI model for this version</p>
				</div>

				<!-- Published Status -->
				<div class="flex items-start">
					<div class="flex items-center h-5">
						<input
							id="is_published"
							name="is_published"
							type="checkbox"
							checked={form?.isPublished !== undefined ? form.isPublished : data.version.is_published}
							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
					</div>
					<div class="ml-3">
						<label for="is_published" class="text-sm font-medium text-gray-700"> Publish this version </label>
						<p class="text-xs text-gray-500">
							Only one version can be published at a time. This will be used by n8n.
						</p>
					</div>
				</div>

				<!-- Error Message -->
				{#if form?.error}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<p class="text-red-800 text-sm">{form.error}</p>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex justify-between items-center pt-4 border-t">
					<a
						href="/workflows/{data.workflow.id}/prompts/{data.prompt.id}"
						class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
					>
						← Cancel
					</a>
					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Save Changes
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Danger Zone -->
	<div class="bg-white rounded-lg shadow p-6 border-2 border-red-200">
		<h3 class="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
		<p class="text-sm text-gray-600 mb-4">
			Deleting a version is permanent and cannot be undone. All associated sections must be deleted first.
		</p>

		{#if !showDeleteConfirm}
			<button
				type="button"
				onclick={() => (showDeleteConfirm = true)}
				class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
			>
				Delete Version
			</button>
		{:else}
			<div class="bg-red-50 border border-red-300 rounded-lg p-4">
				<p class="text-sm text-red-800 font-semibold mb-3">Are you sure? This action cannot be undone.</p>
				<div class="flex space-x-2">
					<form method="POST" action="?/delete" use:enhance>
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
						>
							Yes, Delete Permanently
						</button>
					</form>
					<button
						type="button"
						onclick={() => (showDeleteConfirm = false)}
						class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Metadata -->
	<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
		<h3 class="text-sm font-semibold text-gray-700 mb-2">Version Information</h3>
		<dl class="space-y-1 text-xs text-gray-600">
			<div class="flex justify-between">
				<dt class="font-medium">ID:</dt>
				<dd class="font-mono">{data.version.id}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="font-medium">Version Number:</dt>
				<dd>{data.version.version_number}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="font-medium">Prompt:</dt>
				<dd>{data.prompt.name}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="font-medium">Created:</dt>
				<dd>{new Date(data.version.created_at).toLocaleString('en-GB')}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="font-medium">Updated:</dt>
				<dd>{new Date(data.version.updated_at).toLocaleString('en-GB')}</dd>
			</div>
		</dl>
	</div>
</div>
