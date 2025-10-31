<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Breadcrumb -->
	<div class="flex items-center space-x-2 text-sm text-gray-500">
		<a href="/workflows" class="hover:text-gray-700">Workflows</a>
		<span>→</span>
		<a href="/workflows/{data.workflow.id}" class="hover:text-gray-700">{data.workflow.name}</a>
		<span>→</span>
		<span class="text-gray-900 font-medium">New Prompt</span>
	</div>

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Prompt</h1>
		<p class="mt-2 text-gray-600">Add a new prompt for {data.workflow.name}</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<form method="POST" use:enhance>
			<div class="space-y-6">
				<!-- Prompt Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Prompt Name <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={form?.name || ''}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., Main System Prompt"
					/>
					<p class="mt-1 text-xs text-gray-500">
						A descriptive name for this prompt (minimum 3 characters)
					</p>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						id="description"
						name="description"
						rows="4"
						value={form?.description || ''}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Brief description of this prompt's purpose..."
					></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional description to help identify this prompt</p>
				</div>

				<!-- Active Status -->
				<div class="flex items-start">
					<div class="flex items-center h-5">
						<input
							id="is_active"
							name="is_active"
							type="checkbox"
							checked={form?.isActive || false}
							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
					</div>
					<div class="ml-3">
						<label for="is_active" class="text-sm font-medium text-gray-700">
							Set as active prompt
						</label>
						<p class="text-xs text-gray-500">
							Only one prompt can be active per workflow. This will be used by n8n.
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
						href="/workflows/{data.workflow.id}"
						class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
					>
						← Cancel
					</a>
					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Create Prompt
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Help Text -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<h3 class="text-sm font-semibold text-blue-900 mb-2">Next Steps</h3>
		<p class="text-sm text-blue-800">
			After creating the prompt, you'll be able to create versions, add sections, and configure the model.
		</p>
	</div>
</div>
