<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;

	let showDeleteModal = false;
	let showToggleForm = false;

	// Config type color mapping
	function getConfigTypeColor(type: string): string {
		const colors: Record<string, string> = {
			tech_startup: 'bg-blue-100 text-blue-800',
			music_creative: 'bg-purple-100 text-purple-800',
			educational: 'bg-green-100 text-green-800',
			storytelling: 'bg-orange-100 text-orange-800',
			debate: 'bg-red-100 text-red-800',
			custom: 'bg-gray-100 text-gray-800'
		};
		return colors[type] || colors.custom;
	}
</script>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Breadcrumb -->
	<nav class="flex" aria-label="Breadcrumb">
		<ol class="flex items-center space-x-2 text-sm text-gray-500">
			<li>
				<a href="/podcasts" class="hover:text-gray-700">Podcasts</a>
			</li>
			<li>
				<span class="mx-2">/</span>
			</li>
			<li class="text-gray-900 font-medium">{data.podcast.podcast_name}</li>
		</ol>
	</nav>

	<!-- Header -->
	<div class="bg-white shadow rounded-lg p-6">
		<div class="flex items-start justify-between">
			<div class="flex items-start space-x-4 flex-1">
				<div
					class="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center"
					style="background-color: {data.podcast.brand_color || '#6B7280'}"
				>
					<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
						/>
					</svg>
				</div>
				<div class="flex-1">
					<div class="flex items-center space-x-3">
						<h1 class="text-3xl font-bold text-gray-900">{data.podcast.podcast_name}</h1>
						{#if !data.podcast.is_active}
							<span
								class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
							>
								Inactive
							</span>
						{/if}
					</div>
					{#if data.podcast.podcast_tagline}
						<p class="mt-2 text-lg text-gray-600">{data.podcast.podcast_tagline}</p>
					{/if}
					{#if data.podcast.description}
						<p class="mt-3 text-sm text-gray-500">{data.podcast.description}</p>
					{/if}
					<div class="mt-4 flex items-center space-x-6 text-sm text-gray-500">
						<div>
							<span class="font-medium">Language:</span>
							{data.podcast.default_output_language}
						</div>
						<div>
							<span class="font-medium">Created:</span>
							{new Date(data.podcast.created_at).toLocaleDateString()}
						</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center space-x-3 ml-6">
				{#if data.podcast.is_active}
					<button
						on:click={() => (showToggleForm = true)}
						class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
					>
						Deactivate
					</button>
				{:else}
					<button
						on:click={() => (showToggleForm = true)}
						class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-gray-50"
					>
						Activate
					</button>
				{/if}
				<a
					href="/podcasts/{data.podcast.id}/edit"
					class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
				>
					Edit
				</a>
				<button
					on:click={() => (showDeleteModal = true)}
					class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
				>
					Delete
				</button>
			</div>
		</div>
	</div>

	<!-- Configurations Section -->
	<div class="bg-white shadow rounded-lg">
		<div class="p-6 border-b border-gray-200">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">Configurations</h2>
					<p class="mt-1 text-sm text-gray-600">
						{data.configs.length}
						{data.configs.length === 1 ? 'configuration' : 'configurations'} for this podcast
					</p>
				</div>
				<a
					href="/podcasts/configs/new?podcast_id={data.podcast.id}"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Config
				</a>
			</div>
		</div>

		{#if data.configs.length > 0}
			<div class="divide-y divide-gray-200">
				{#each data.configs as config}
					<a
						href="/podcasts/configs/{config.id}"
						class="block p-6 hover:bg-gray-50 transition-colors"
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center space-x-3 mb-2">
									<h3 class="text-lg font-medium text-gray-900">{config.config_name}</h3>
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getConfigTypeColor(config.config_type)}">
										{config.config_type}
									</span>
									{#if config.is_default}
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
										>
											DEFAULT
										</span>
									{/if}
									{#if !config.is_active}
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
										>
											Inactive
										</span>
									{/if}
								</div>

								{#if config.description}
									<p class="text-sm text-gray-600 mb-3">{config.description}</p>
								{/if}

								<div class="grid grid-cols-4 gap-4 text-sm">
									<div>
										<span class="text-gray-500">Voices:</span>
										<span class="ml-1 font-medium text-gray-900">
											{config.voice_person1 || '—'} / {config.voice_person2 || '—'}
										</span>
									</div>
									<div>
										<span class="text-gray-500">Creativity:</span>
										<span class="ml-1 font-medium text-gray-900">
											{config.llm_creativity !== null ? config.llm_creativity.toFixed(1) : '—'}
										</span>
									</div>
									<div>
										<span class="text-gray-500">TTS:</span>
										<span class="ml-1 font-medium text-gray-900">
											{config.tts_provider}
										</span>
									</div>
									<div>
										<span class="text-gray-500">Created:</span>
										<span class="ml-1 text-gray-900">
											{new Date(config.created_at).toLocaleDateString()}
										</span>
									</div>
								</div>

								{#if config.conversation_style && config.conversation_style.length > 0}
									<div class="mt-3 flex flex-wrap gap-2">
										{#each config.conversation_style as style}
											<span
												class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
											>
												{style}
											</span>
										{/each}
									</div>
								{/if}
							</div>

							<svg
								class="ml-4 h-5 w-5 text-gray-400 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="p-12 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No configurations</h3>
				<p class="mt-1 text-sm text-gray-500">
					Get started by creating a configuration for this podcast.
				</p>
			</div>
		{/if}
	</div>
</div>

<!-- Toggle Active Form (Hidden) -->
{#if showToggleForm}
	<form method="POST" action="?/toggleActive" use:enhance on:submit={() => (showToggleForm = false)}>
		<input type="hidden" name="is_active" value={!data.podcast.is_active} />
		<button type="submit" class="hidden">Submit</button>
	</form>
	<script>
		document.querySelector('form[action="?/toggleActive"] button')?.click();
	</script>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog">
		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block">
			<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
			<span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
			<div
				class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
			>
				<div class="sm:flex sm:items-start">
					<div
						class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
					>
						<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 class="text-lg leading-6 font-medium text-gray-900">Delete Podcast</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500">
								Are you sure you want to delete "{data.podcast.podcast_name}"? This will also delete
								all {data.configs.length}
								{data.configs.length === 1 ? 'configuration' : 'configurations'} associated with this
								podcast. This action cannot be undone.
							</p>
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<form method="POST" action="?/delete" use:enhance class="inline">
						<button
							type="submit"
							class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
						>
							Delete
						</button>
					</form>
					<button
						on:click={() => (showDeleteModal = false)}
						type="button"
						class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
