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

	function getConfigTypeBadgeColor(type: string): string {
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

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-start">
		<div class="flex-1">
			<div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a href="/podcasts/configs" class="hover:text-gray-700">Podcast Configs</a>
				<span>→</span>
				<span class="text-gray-900 font-medium">{data.config.config_name}</span>
			</div>
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold text-gray-900">{data.config.podcast_name || data.config.config_name}</h1>
				{#if data.config.is_default}
					<span class="px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-lg">DEFAULT</span>
				{/if}
				<span class="px-3 py-1 text-sm font-medium rounded-lg {data.config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
					{data.config.is_active ? 'Active' : 'Inactive'}
				</span>
			</div>
			{#if data.config.podcast_tagline}
				<p class="mt-2 text-lg text-gray-600 italic">{data.config.podcast_tagline}</p>
			{/if}
			{#if data.config.description}
				<p class="mt-2 text-gray-600">{data.config.description}</p>
			{/if}
		</div>
		<div class="flex space-x-2">
			<form method="POST" action="?/toggleActive" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
				>
					{data.config.is_active ? 'Deactivate' : 'Activate'}
				</button>
			</form>
			<a
				href="/podcasts/configs/{data.config.id}/edit"
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
			>
				Edit Configuration
			</a>
			<button
				on:click={() => showDeleteConfirm = true}
				class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
			>
				Delete
			</button>
		</div>
	</div>

	<!-- Action Result -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<p class="text-green-800 text-sm">Configuration updated successfully</p>
		</div>
	{:else if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-800 text-sm">{form.error}</p>
		</div>
	{/if}

	<!-- Delete Confirmation Modal -->
	{#if showDeleteConfirm}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Configuration?</h3>
				<p class="text-gray-600 mb-4">
					Are you sure you want to delete "{data.config.config_name}"? This action cannot be undone.
				</p>
				<div class="flex space-x-2 justify-end">
					<button
						on:click={() => showDeleteConfirm = false}
						class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					>
						Cancel
					</button>
					<form method="POST" action="?/delete" use:enhance>
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
						>
							Delete
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}

	<!-- Configuration Details Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Basic Info Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
			<div class="space-y-3">
				<div>
					<label class="text-sm font-medium text-gray-500">Config Name</label>
					<p class="text-gray-900">{data.config.config_name}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Config Type</label>
					<div class="mt-1">
						<span class="inline-block px-2 py-1 text-xs font-medium rounded {getConfigTypeBadgeColor(data.config.config_type)}">
							{data.config.config_type.replace('_', ' ').toUpperCase()}
						</span>
					</div>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Output Language</label>
					<p class="text-gray-900">{data.config.output_language}</p>
				</div>
			</div>
		</div>

		<!-- LLM Configuration Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">LLM Configuration</h2>
			<div class="space-y-3">
				<div>
					<label class="text-sm font-medium text-gray-500">Provider</label>
					<p class="text-gray-900">{data.config.llm_provider || 'Default'}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Model</label>
					<p class="text-gray-900">{data.config.llm_model || 'Default'}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Creativity Level</label>
					<p class="text-gray-900">
						{#if data.config.llm_creativity !== null}
							{data.config.llm_creativity} / 1.0
							<span class="text-sm text-gray-500">
								({data.config.llm_creativity < 0.3 ? 'Conservative' : data.config.llm_creativity < 0.7 ? 'Balanced' : 'Creative'})
							</span>
						{:else}
							Default
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Conversation Settings Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Conversation Settings</h2>
			<div class="space-y-3">
				<div>
					<label class="text-sm font-medium text-gray-500">Speaker 1 Role</label>
					<p class="text-gray-900">{data.config.roles_person1 || 'Not specified'}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Speaker 2 Role</label>
					<p class="text-gray-900">{data.config.roles_person2 || 'Not specified'}</p>
				</div>
				{#if data.config.conversation_style && data.config.conversation_style.length > 0}
					<div>
						<label class="text-sm font-medium text-gray-500">Conversation Style</label>
						<div class="flex flex-wrap gap-2 mt-1">
							{#each data.config.conversation_style as style}
								<span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">{style}</span>
							{/each}
						</div>
					</div>
				{/if}
				{#if data.config.dialogue_structure && data.config.dialogue_structure.length > 0}
					<div>
						<label class="text-sm font-medium text-gray-500">Dialogue Structure</label>
						<ol class="list-decimal list-inside text-sm text-gray-900 mt-1 space-y-1">
							{#each data.config.dialogue_structure as section}
								<li>{section}</li>
							{/each}
						</ol>
					</div>
				{/if}
			</div>
		</div>

		<!-- TTS Configuration Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Text-to-Speech Configuration</h2>
			<div class="space-y-3">
				<div>
					<label class="text-sm font-medium text-gray-500">TTS Provider</label>
					<p class="text-gray-900">{data.config.tts_provider}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">TTS Model</label>
					<p class="text-gray-900">{data.config.tts_model || 'Default'}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Speaker 1 Voice</label>
					<p class="text-gray-900">{data.config.voice_person1 || 'Default'}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Speaker 2 Voice</label>
					<p class="text-gray-900">{data.config.voice_person2 || 'Default'}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Audio Format</label>
					<p class="text-gray-900 uppercase">{data.config.audio_format}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Ending Message</label>
					<p class="text-gray-900">{data.config.ending_message}</p>
				</div>
			</div>
		</div>

		<!-- Engagement Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Engagement</h2>
			<div class="space-y-3">
				{#if data.config.engagement_techniques && data.config.engagement_techniques.length > 0}
					<div>
						<label class="text-sm font-medium text-gray-500">Engagement Techniques</label>
						<div class="flex flex-wrap gap-2 mt-1">
							{#each data.config.engagement_techniques as technique}
								<span class="px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">{technique}</span>
							{/each}
						</div>
					</div>
				{/if}
				{#if data.config.user_instructions}
					<div>
						<label class="text-sm font-medium text-gray-500">Custom Instructions</label>
						<p class="text-gray-900 text-sm whitespace-pre-wrap">{data.config.user_instructions}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Long-form Settings Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Long-form Content Settings</h2>
			<div class="space-y-3">
				<div>
					<label class="text-sm font-medium text-gray-500">Maximum Chunks</label>
					<p class="text-gray-900">{data.config.max_num_chunks}</p>
				</div>
				<div>
					<label class="text-sm font-medium text-gray-500">Minimum Chunk Size</label>
					<p class="text-gray-900">{data.config.min_chunk_size} characters</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Metadata Section -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label class="text-sm font-medium text-gray-500">Created</label>
				<p class="text-gray-900 text-sm">{formatDate(data.config.created_at)}</p>
			</div>
			<div>
				<label class="text-sm font-medium text-gray-500">Last Updated</label>
				<p class="text-gray-900 text-sm">{formatDate(data.config.updated_at)}</p>
			</div>
			<div>
				<label class="text-sm font-medium text-gray-500">Configuration ID</label>
				<p class="text-gray-900 text-sm font-mono">{data.config.id}</p>
			</div>
		</div>
	</div>

	<!-- Back Link -->
	<div class="flex justify-between items-center">
		<a href="/podcasts/configs" class="text-blue-600 hover:text-blue-800">
			← Back to Configurations
		</a>
		<a href="/" class="text-sm text-gray-600 hover:text-gray-800">
			← Back to Dashboard
		</a>
	</div>
</div>
