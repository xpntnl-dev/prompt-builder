<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
			<a href="/podcasts" class="hover:text-gray-700">Podcasts</a>
			<span>→</span>
			<span class="text-gray-900 font-medium">New Podcast</span>
		</div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Podcast</h1>
		<p class="mt-2 text-gray-600">Set up a new podcast show</p>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{form.error}
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" use:enhance>
		<div class="bg-white rounded-lg shadow p-6 space-y-6">
			<!-- Podcast Name -->
			<div>
				<label for="podcast_name" class="block text-sm font-medium text-gray-700 mb-1">
					Podcast Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="podcast_name"
					name="podcast_name"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
					placeholder="My Awesome Podcast"
				/>
				<p class="mt-1 text-xs text-gray-500">
					The main name of your podcast show
				</p>
			</div>

			<!-- Tagline -->
			<div>
				<label for="podcast_tagline" class="block text-sm font-medium text-gray-700 mb-1">
					Tagline
				</label>
				<input
					type="text"
					id="podcast_tagline"
					name="podcast_tagline"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
					placeholder="Exploring tech and innovation"
				/>
				<p class="mt-1 text-xs text-gray-500">
					A short, catchy description of your podcast
				</p>
			</div>

			<!-- Description -->
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
					Description
				</label>
				<textarea
					id="description"
					name="description"
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
					placeholder="A detailed description of what this podcast is about..."
				/>
				<p class="mt-1 text-xs text-gray-500">
					Full description of your podcast's theme and content
				</p>
			</div>

			<!-- Output Language -->
			<div>
				<label for="default_output_language" class="block text-sm font-medium text-gray-700 mb-1">
					Default Language
				</label>
				<input
					type="text"
					id="default_output_language"
					name="default_output_language"
					value="English"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Brand Color -->
			<div>
				<label for="brand_color" class="block text-sm font-medium text-gray-700 mb-1">
					Brand Color
				</label>
				<div class="flex items-center space-x-3">
					<input
						type="color"
						id="brand_color"
						name="brand_color"
						value="#3B82F6"
						class="h-10 w-20 border border-gray-300 rounded cursor-pointer"
					/>
					<span class="text-sm text-gray-600">Choose a color for your podcast's branding</span>
				</div>
			</div>

			<!-- Active Checkbox -->
			<div class="flex items-center">
				<input
					type="checkbox"
					id="is_active"
					name="is_active"
					checked
					class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
				/>
				<label for="is_active" class="ml-2 block text-sm text-gray-700">
					Active (podcast is available for use)
				</label>
			</div>

			<!-- Submit Buttons -->
			<div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
				<a
					href="/podcasts"
					class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
				>
					Cancel
				</a>
				<button
					type="submit"
					class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Create Podcast
				</button>
			</div>
		</div>
	</form>
</div>
