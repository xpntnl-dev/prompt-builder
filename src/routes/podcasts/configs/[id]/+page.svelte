<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import type { ModelPricingDisplay } from '$lib/types/openrouter';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showDeleteConfirm = $state(false);
	let selectedModelId = $state<string>('');
	let editingBasic = $state(false);
	let editingBranding = $state(false);
	let editingLLMAndTTS = $state(false);
	let editingConversation = $state(false);
	let editingEngagement = $state(false);
	let editingLongform = $state(false);

	// Helper function to convert array to comma-separated string
	function arrayToString(arr: string[] | null): string {
		return arr ? arr.join(', ') : '';
	}

	// LocalStorage key for pinned models (matches LLM Models page)
	const STORAGE_KEY = 'rvkcat_pinned_models';
	let pinnedModelIds: Set<string> = new Set();

	// Load pinned models from localStorage
	onMount(() => {
		if (browser) {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as string[];
					pinnedModelIds = new Set(parsed);
				} catch (e) {
					console.error('Failed to parse pinned models from localStorage', e);
				}
			}
		}
	});

	// Get pinned models
	const pinnedModels = $derived(data.models.filter(m => pinnedModelIds.has(m.id)));

	// Group models by provider
	function groupModelsByProvider(models: ModelPricingDisplay[]) {
		const groups = new Map<string, ModelPricingDisplay[]>();
		for (const model of models) {
			if (!groups.has(model.provider)) {
				groups.set(model.provider, []);
			}
			groups.get(model.provider)!.push(model);
		}
		return groups;
	}

	const pinnedGroups = $derived(groupModelsByProvider(pinnedModels));

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
				<a href="/podcasts" class="hover:text-gray-700">Podcasts</a>
				<span>→</span>
				{#if data.podcast}
					<a href="/podcasts/{data.podcast.id}" class="hover:text-gray-700">{data.podcast.podcast_name}</a>
					<span>→</span>
				{/if}
				<span class="text-gray-900 font-medium">{data.config.config_name}</span>
			</div>
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold text-gray-900">{data.config.config_name}</h1>
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
			<button
				onclick={() => showDeleteConfirm = true}
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
						onclick={() => showDeleteConfirm = false}
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
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Basic Information</h2>
				{#if !editingBasic}
					<button
						onclick={() => editingBasic = true}
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			{#if editingBasic}
				<!-- EDIT MODE -->
				<form
					method="POST"
					action="?/updateBasic"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								editingBasic = false;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="config_name" class="block text-sm font-medium text-gray-700 mb-1">
								Config Name <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="config_name"
								name="config_name"
								value={data.config.config_name}
								required
								maxlength="255"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="config_type" class="block text-sm font-medium text-gray-700 mb-1">
								Config Type <span class="text-red-500">*</span>
							</label>
							<select
								id="config_type"
								name="config_type"
								value={data.config.config_type}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="tech_startup">Tech Startup</option>
								<option value="music_creative">Music Creative</option>
								<option value="educational">Educational</option>
								<option value="storytelling">Storytelling</option>
								<option value="debate">Debate</option>
								<option value="custom">Custom</option>
							</select>
						</div>

						<div>
							<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								id="description"
								name="description"
								value={data.config.description || ''}
								rows="3"
								maxlength="1000"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							></textarea>
							<p class="text-xs text-gray-500 mt-1">Optional. Max 1000 characters.</p>
						</div>
					</div>

					<div class="flex gap-2 mt-4">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => editingBasic = false}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<!-- VIEW MODE -->
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
						<label class="text-sm font-medium text-gray-500">Description</label>
						<p class="text-gray-900">{data.config.description || 'Not specified'}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Branding & Language Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Branding & Language</h2>
				{#if !editingBranding}
					<button
						onclick={() => editingBranding = true}
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			{#if editingBranding}
				<!-- EDIT MODE -->
				<form
					method="POST"
					action="?/updateBranding"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								editingBranding = false;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="podcast_name" class="block text-sm font-medium text-gray-700 mb-1">
								Podcast Name <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="podcast_name"
								name="podcast_name"
								value={data.config.podcast_name}
								required
								maxlength="255"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="podcast_tagline" class="block text-sm font-medium text-gray-700 mb-1">
								Podcast Tagline
							</label>
							<input
								type="text"
								id="podcast_tagline"
								name="podcast_tagline"
								value={data.config.podcast_tagline || ''}
								maxlength="500"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Optional. Max 500 characters.</p>
						</div>

						<div>
							<label for="output_language" class="block text-sm font-medium text-gray-700 mb-1">
								Output Language <span class="text-red-500">*</span>
							</label>
							<select
								id="output_language"
								name="output_language"
								value={data.config.output_language}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="English">English</option>
								<option value="Spanish">Spanish</option>
								<option value="French">French</option>
								<option value="German">German</option>
								<option value="Italian">Italian</option>
								<option value="Portuguese">Portuguese</option>
								<option value="Chinese">Chinese</option>
								<option value="Japanese">Japanese</option>
								<option value="Korean">Korean</option>
								<option value="Arabic">Arabic</option>
								<option value="Hindi">Hindi</option>
								<option value="Russian">Russian</option>
							</select>
						</div>

						<div>
							<label for="ending_message" class="block text-sm font-medium text-gray-700 mb-1">
								Ending Message <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="ending_message"
								name="ending_message"
								value={data.config.ending_message}
								required
								maxlength="500"
								placeholder="e.g., Thanks for listening!"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					<div class="flex gap-2 mt-4">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => editingBranding = false}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<!-- VIEW MODE -->
				<div class="space-y-3">
					<div>
						<label class="text-sm font-medium text-gray-500">Podcast Name</label>
						<p class="text-gray-900">{data.config.podcast_name}</p>
					</div>
					<div>
						<label class="text-sm font-medium text-gray-500">Podcast Tagline</label>
						<p class="text-gray-900">{data.config.podcast_tagline || 'Not specified'}</p>
					</div>
					<div>
						<label class="text-sm font-medium text-gray-500">Output Language</label>
						<p class="text-gray-900">{data.config.output_language}</p>
					</div>
					<div>
						<label class="text-sm font-medium text-gray-500">Ending Message</label>
						<p class="text-gray-900">{data.config.ending_message}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- LLM & TTS Configuration Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">LLM & TTS Configuration</h2>
				{#if !editingLLMAndTTS}
					<button
						onclick={() => {
							editingLLMAndTTS = true;
							// Initialize model selection
							const fullModelId = data.config.llm_provider && data.config.llm_model
								? `${data.config.llm_provider}/${data.config.llm_model}`
								: '';
							selectedModelId = data.models.find((m) => m.id === fullModelId)?.id || '';
						}}
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			{#if editingLLMAndTTS}
				<!-- EDIT MODE -->
				<form
					method="POST"
					action="?/updateLLMAndTTS"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								editingLLMAndTTS = false;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<!-- LLM Settings Header -->
						<div class="border-b border-gray-200 pb-2">
							<h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Language Model</h3>
						</div>

						<!-- Model Selection -->
						<div>
							<label for="model_id" class="block text-sm font-medium text-gray-700 mb-1">
								LLM Model
							</label>
							<select
								id="model_id"
								name="model_id"
								bind:value={selectedModelId}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Default</option>
								{#if pinnedModels.length > 0}
									{#each Array.from(pinnedGroups.entries()).sort((a, b) => a[0].localeCompare(b[0])) as [provider, models]}
										<optgroup label="{provider} ({models.length})">
											{#each models.sort((a, b) => a.name.localeCompare(b.name)) as model}
												<option value={model.id}>
													{model.name}
												</option>
											{/each}
										</optgroup>
									{/each}
								{:else}
									<option disabled>No pinned models - visit LLM Models page</option>
								{/if}
							</select>
							<p class="text-xs text-gray-500 mt-1">
								{#if pinnedModels.length > 0}
									Showing {pinnedModels.length} pinned model{pinnedModels.length === 1 ? '' : 's'}.
									<a href="/llm-models" class="text-blue-600 hover:underline">Manage models</a>
								{:else}
									<a href="/llm-models" class="text-blue-600 hover:underline">Pin models in LLM Models page</a>
								{/if}
							</p>
						</div>

						<!-- Creativity Level -->
						<div>
							<label for="llm_creativity" class="block text-sm font-medium text-gray-700 mb-1">
								Creativity Level
							</label>
							<input
								type="range"
								id="llm_creativity"
								name="llm_creativity"
								min="0"
								max="1"
								step="0.1"
								value={data.config.llm_creativity ?? 0.7}
								class="w-full"
								oninput={(e) => {
									const val = parseFloat(e.currentTarget.value);
									const label = e.currentTarget.nextElementSibling;
									if (label) {
										const levelText = val < 0.3 ? 'Conservative' : val < 0.7 ? 'Balanced' : 'Creative';
										label.textContent = `${val.toFixed(1)} / 1.0 (${levelText})`;
									}
								}}
							/>
							<p class="text-sm text-gray-600">
								{data.config.llm_creativity !== null ? `${data.config.llm_creativity.toFixed(1)} / 1.0 (${data.config.llm_creativity < 0.3 ? 'Conservative' : data.config.llm_creativity < 0.7 ? 'Balanced' : 'Creative'})` : '0.7 / 1.0 (Balanced)'}
							</p>
						</div>

						<!-- TTS Settings Header -->
						<div class="border-b border-gray-200 pb-2 pt-2">
							<h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Text-to-Speech</h3>
						</div>

						<!-- TTS Provider -->
						<div>
							<label for="tts_provider" class="block text-sm font-medium text-gray-700 mb-1">
								TTS Provider <span class="text-red-500">*</span>
							</label>
							<select
								id="tts_provider"
								name="tts_provider"
								value={data.config.tts_provider}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="openai">OpenAI</option>
								<option value="elevenlabs">ElevenLabs</option>
								<option value="google">Google</option>
								<option value="amazon">Amazon Polly</option>
								<option value="microsoft">Microsoft Azure</option>
							</select>
						</div>

						<!-- TTS Model -->
						<div>
							<label for="tts_model" class="block text-sm font-medium text-gray-700 mb-1">
								TTS Model
							</label>
							<input
								type="text"
								id="tts_model"
								name="tts_model"
								value={data.config.tts_model || ''}
								placeholder="e.g., tts-1, tts-1-hd"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Optional. Specific model for the provider</p>
						</div>

						<!-- Speaker Voices -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="voice_person1" class="block text-sm font-medium text-gray-700 mb-1">
									Speaker 1 Voice
								</label>
								<input
									type="text"
									id="voice_person1"
									name="voice_person1"
									value={data.config.voice_person1 || ''}
									placeholder="e.g., alloy, echo, shimmer"
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label for="voice_person2" class="block text-sm font-medium text-gray-700 mb-1">
									Speaker 2 Voice
								</label>
								<input
									type="text"
									id="voice_person2"
									name="voice_person2"
									value={data.config.voice_person2 || ''}
									placeholder="e.g., nova, onyx, fable"
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>

						<!-- Audio Format -->
						<div>
							<label for="audio_format" class="block text-sm font-medium text-gray-700 mb-1">
								Audio Format <span class="text-red-500">*</span>
							</label>
							<select
								id="audio_format"
								name="audio_format"
								value={data.config.audio_format}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="mp3">MP3</option>
								<option value="wav">WAV</option>
								<option value="flac">FLAC</option>
								<option value="aac">AAC</option>
							</select>
						</div>
					</div>

					<div class="flex gap-2 mt-4">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => editingLLMAndTTS = false}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<!-- VIEW MODE -->
				<div class="space-y-3">
					<!-- LLM Settings -->
					<div class="border-b border-gray-100 pb-3">
						<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Language Model</h3>
						<div class="space-y-2">
							<div>
								<label class="text-sm font-medium text-gray-500">Model</label>
								<p class="text-gray-900">
									{#if data.config.llm_provider && data.config.llm_model}
										{data.config.llm_provider}/{data.config.llm_model}
									{:else}
										Default
									{/if}
								</p>
							</div>
							<div>
								<label class="text-sm font-medium text-gray-500">Creativity Level</label>
								<p class="text-gray-900">
									{#if data.config.llm_creativity !== null}
										{data.config.llm_creativity.toFixed(1)} / 1.0
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

					<!-- TTS Settings -->
					<div class="pt-2">
						<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Text-to-Speech</h3>
						<div class="space-y-2">
							<div>
								<label class="text-sm font-medium text-gray-500">TTS Provider</label>
								<p class="text-gray-900">{data.config.tts_provider}</p>
							</div>
							<div>
								<label class="text-sm font-medium text-gray-500">TTS Model</label>
								<p class="text-gray-900">{data.config.tts_model || 'Default'}</p>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="text-sm font-medium text-gray-500">Speaker 1 Voice</label>
									<p class="text-gray-900">{data.config.voice_person1 || 'Default'}</p>
								</div>
								<div>
									<label class="text-sm font-medium text-gray-500">Speaker 2 Voice</label>
									<p class="text-gray-900">{data.config.voice_person2 || 'Default'}</p>
								</div>
							</div>
							<div>
								<label class="text-sm font-medium text-gray-500">Audio Format</label>
								<p class="text-gray-900 uppercase">{data.config.audio_format}</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Conversation Settings Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Conversation Settings</h2>
				{#if !editingConversation}
					<button
						onclick={() => editingConversation = true}
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			{#if editingConversation}
				<!-- EDIT MODE -->
				<form
					method="POST"
					action="?/updateConversation"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								editingConversation = false;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="roles_person1" class="block text-sm font-medium text-gray-700 mb-1">
								Speaker 1 Role
							</label>
							<input
								type="text"
								id="roles_person1"
								name="roles_person1"
								value={data.config.roles_person1 || ''}
								maxlength="255"
								placeholder="e.g., Host, Interviewer, Expert"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="roles_person2" class="block text-sm font-medium text-gray-700 mb-1">
								Speaker 2 Role
							</label>
							<input
								type="text"
								id="roles_person2"
								name="roles_person2"
								value={data.config.roles_person2 || ''}
								maxlength="255"
								placeholder="e.g., Guest, Co-host, Learner"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="conversation_style" class="block text-sm font-medium text-gray-700 mb-1">
								Conversation Style
							</label>
							<input
								type="text"
								id="conversation_style"
								name="conversation_style"
								value={arrayToString(data.config.conversation_style)}
								placeholder="e.g., casual, professional, humorous (comma-separated)"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Comma-separated style keywords</p>
						</div>

						<div>
							<label for="dialogue_structure" class="block text-sm font-medium text-gray-700 mb-1">
								Dialogue Structure
							</label>
							<input
								type="text"
								id="dialogue_structure"
								name="dialogue_structure"
								value={arrayToString(data.config.dialogue_structure)}
								placeholder="e.g., Introduction, Main Discussion, Q&A (comma-separated)"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Comma-separated section names in order</p>
						</div>
					</div>

					<div class="flex gap-2 mt-4">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => editingConversation = false}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<!-- VIEW MODE -->
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
					{:else}
						<div>
							<label class="text-sm font-medium text-gray-500">Conversation Style</label>
							<p class="text-gray-900">Not specified</p>
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
					{:else}
						<div>
							<label class="text-sm font-medium text-gray-500">Dialogue Structure</label>
							<p class="text-gray-900">Not specified</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>


		<!-- Engagement Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Engagement</h2>
				{#if !editingEngagement}
					<button
						onclick={() => editingEngagement = true}
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			{#if editingEngagement}
				<!-- EDIT MODE -->
				<form
					method="POST"
					action="?/updateEngagement"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								editingEngagement = false;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="engagement_techniques" class="block text-sm font-medium text-gray-700 mb-1">
								Engagement Techniques
							</label>
							<input
								type="text"
								id="engagement_techniques"
								name="engagement_techniques"
								value={arrayToString(data.config.engagement_techniques)}
								placeholder="e.g., questions, humor, examples, storytelling (comma-separated)"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Comma-separated engagement techniques</p>
						</div>

						<div>
							<label for="user_instructions" class="block text-sm font-medium text-gray-700 mb-1">
								Custom Instructions
							</label>
							<textarea
								id="user_instructions"
								name="user_instructions"
								value={data.config.user_instructions || ''}
								rows="4"
								maxlength="2000"
								placeholder="Any specific instructions or guidelines for the podcast generation..."
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							></textarea>
							<p class="text-xs text-gray-500 mt-1">Optional. Max 2000 characters.</p>
						</div>
					</div>

					<div class="flex gap-2 mt-4">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => editingEngagement = false}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<!-- VIEW MODE -->
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
					{:else}
						<div>
							<label class="text-sm font-medium text-gray-500">Engagement Techniques</label>
							<p class="text-gray-900">Not specified</p>
						</div>
					{/if}
					{#if data.config.user_instructions}
						<div>
							<label class="text-sm font-medium text-gray-500">Custom Instructions</label>
							<p class="text-gray-900 text-sm whitespace-pre-wrap">{data.config.user_instructions}</p>
						</div>
					{:else}
						<div>
							<label class="text-sm font-medium text-gray-500">Custom Instructions</label>
							<p class="text-gray-900">Not specified</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Long-form Settings Section -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Long-form Content Settings</h2>
				{#if !editingLongform}
					<button
						onclick={() => editingLongform = true}
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Edit
					</button>
				{/if}
			</div>

			{#if editingLongform}
				<!-- EDIT MODE -->
				<form
					method="POST"
					action="?/updateLongform"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								editingLongform = false;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="max_num_chunks" class="block text-sm font-medium text-gray-700 mb-1">
								Maximum Chunks
							</label>
							<input
								type="number"
								id="max_num_chunks"
								name="max_num_chunks"
								value={data.config.max_num_chunks}
								min="1"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Maximum number of chunks to split content into</p>
						</div>

						<div>
							<label for="min_chunk_size" class="block text-sm font-medium text-gray-700 mb-1">
								Minimum Chunk Size
							</label>
							<input
								type="number"
								id="min_chunk_size"
								name="min_chunk_size"
								value={data.config.min_chunk_size}
								min="500"
								step="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Minimum characters per chunk (minimum 500)</p>
						</div>
					</div>

					<div class="flex gap-2 mt-4">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => editingLongform = false}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<!-- VIEW MODE -->
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
			{/if}
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
