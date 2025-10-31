<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Workflow</h1>
		<p class="mt-2 text-gray-600">Add a new n8n agentic workflow configuration</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<form method="POST" use:enhance>
			<div class="space-y-6">
				<!-- Workflow Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Workflow Name <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={form?.name || ''}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., RVKCAT Content Agent"
					/>
					<p class="mt-1 text-xs text-gray-500">
						A descriptive name for this workflow (minimum 3 characters)
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
						placeholder="Brief description of what this workflow does..."
					></textarea>
					<p class="mt-1 text-xs text-gray-500">
						Optional description to help identify the workflow's purpose
					</p>
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
						href="/workflows"
						class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
					>
						← Cancel
					</a>
					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Create Workflow
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Help Text -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<h3 class="text-sm font-semibold text-blue-900 mb-2">Next Steps</h3>
		<p class="text-sm text-blue-800">
			After creating the workflow, you'll be able to add prompts, configure versions, and manage prompt sections.
		</p>
	</div>
</div>
