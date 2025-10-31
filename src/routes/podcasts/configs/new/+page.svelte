<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	// Get podcast_id from URL if present
	$: podcast_id = $page.url.searchParams.get('podcast_id');
	$: selectedPodcast = data.podcast;

	// Helper to get form value from previous submission
	function getFormValue(fieldName: string): string {
		return (form?.formData?.[fieldName] as string) || '';
	}
</script>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
			<a href="/podcasts" class="hover:text-gray-700">Podcasts</a>
			<span>→</span>
			{#if selectedPodcast}
				<a href="/podcasts/{selectedPodcast.id}" class="hover:text-gray-700">{selectedPodcast.podcast_name}</a>
				<span>→</span>
			{/if}
			<span class="text-gray-900 font-medium">New Configuration</span>
		</div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Podcast Configuration</h1>
		{#if selectedPodcast}
			<p class="mt-2 text-gray-600">For: <span class="font-medium">{selectedPodcast.podcast_name}</span></p>
		{:else}
			<p class="mt-2 text-gray-600">Select a podcast and configure all settings</p>
		{/if}
	</div>

	<!-- Form -->
	<form method="POST" use:enhance>
		<div class="bg-white rounded-lg shadow p-6">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

				<!-- LEFT COLUMN: Basic + Branding + Advanced -->
				<div class="space-y-6">
					<!-- Basic Info -->
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Basic Info</h3>
						<div class="space-y-3">
							<!-- Podcast Selection -->
							{#if selectedPodcast}
								<!-- Hidden field if podcast is pre-selected -->
								<input type="hidden" name="podcast_id" value={selectedPodcast.id} />
								<div class="p-3 bg-blue-50 border border-blue-200 rounded">
									<div class="text-xs font-medium text-blue-900">Podcast</div>
									<div class="text-sm text-blue-700">{selectedPodcast.podcast_name}</div>
								</div>
							{:else}
								<!-- Dropdown if no podcast pre-selected -->
								<div>
									<label for="podcast_id" class="block text-xs font-medium text-gray-700 mb-1">
										Podcast <span class="text-red-500">*</span>
									</label>
									<select
										id="podcast_id"
										name="podcast_id"
										required
										class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									>
										<option value="">Select a podcast...</option>
										{#each data.podcasts as podcast}
											<option value={podcast.id}>{podcast.podcast_name}</option>
										{/each}
									</select>
								</div>
							{/if}

							<div>
								<label for="config_name" class="block text-xs font-medium text-gray-700 mb-1">
									Config Name <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="config_name"
									name="config_name"
									value={getFormValue('config_name')}
									required
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="my-podcast-config"
								/>
							</div>

							<div>
								<label for="config_type" class="block text-xs font-medium text-gray-700 mb-1">
									Type <span class="text-red-500">*</span>
								</label>
								<select
									id="config_type"
									name="config_type"
									required
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								>
									<option value="">Select...</option>
									<option value="tech_startup">Tech Startup</option>
									<option value="music_creative">Music Creative</option>
									<option value="educational">Educational</option>
									<option value="storytelling">Storytelling</option>
									<option value="debate">Debate</option>
									<option value="custom">Custom</option>
								</select>
							</div>

							<div>
								<label for="description" class="block text-xs font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									id="description"
									name="description"
									rows="2"
									value={getFormValue('description')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="Brief description..."
								></textarea>
							</div>
						</div>
					</div>

					<!-- Branding -->
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Branding</h3>
						<div class="space-y-3">
							<div>
								<label for="podcast_name" class="block text-xs font-medium text-gray-700 mb-1">
									Podcast Name
								</label>
								<input
									type="text"
									id="podcast_name"
									name="podcast_name"
									value={getFormValue('podcast_name')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="XPNTNL Insider"
								/>
							</div>

							<div>
								<label for="podcast_tagline" class="block text-xs font-medium text-gray-700 mb-1">
									Tagline
								</label>
								<input
									type="text"
									id="podcast_tagline"
									name="podcast_tagline"
									value={getFormValue('podcast_tagline')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="Tech strategies for..."
								/>
							</div>

							<div>
								<label for="output_language" class="block text-xs font-medium text-gray-700 mb-1">
									Language
								</label>
								<input
									type="text"
									id="output_language"
									name="output_language"
									value={getFormValue('output_language') || 'English'}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								/>
							</div>
						</div>
					</div>

					<!-- Advanced -->
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Advanced</h3>
						<div class="space-y-3">
							<div>
								<label for="llm_provider" class="block text-xs font-medium text-gray-700 mb-1">
									LLM Provider
								</label>
								<select
									id="llm_provider"
									name="llm_provider"
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								>
									<option value="">Default</option>
									<option value="openrouter">OpenRouter</option>
									<option value="anthropic">Anthropic</option>
									<option value="openai">OpenAI</option>
								</select>
							</div>

							<div>
								<label for="llm_model" class="block text-xs font-medium text-gray-700 mb-1">
									LLM Model
								</label>
								<input
									type="text"
									id="llm_model"
									name="llm_model"
									value={getFormValue('llm_model')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="anthropic/claude-haiku-4.5"
								/>
							</div>

							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="max_num_chunks" class="block text-xs font-medium text-gray-700 mb-1">
										Max Chunks
									</label>
									<input
										type="number"
										id="max_num_chunks"
										name="max_num_chunks"
										value={getFormValue('max_num_chunks') || '8'}
										min="1"
										max="20"
										class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label for="min_chunk_size" class="block text-xs font-medium text-gray-700 mb-1">
										Min Size
									</label>
									<input
										type="number"
										id="min_chunk_size"
										name="min_chunk_size"
										value={getFormValue('min_chunk_size') || '600'}
										min="100"
										max="2000"
										step="100"
										class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									/>
								</div>
							</div>

							<div class="pt-2 space-y-2">
								<label class="flex items-center">
									<input
										type="checkbox"
										id="is_active"
										name="is_active"
										checked
										class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-700">Active</span>
								</label>

								<label class="flex items-center">
									<input
										type="checkbox"
										id="is_default"
										name="is_default"
										class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-700">Default for type</span>
								</label>
							</div>
						</div>
					</div>
				</div>

				<!-- MIDDLE COLUMN: Conversation + Engagement -->
				<div class="space-y-6">
					<!-- Conversation -->
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Conversation</h3>
						<div class="space-y-3">
							<div>
								<label for="roles_person1" class="block text-xs font-medium text-gray-700 mb-1">
									Speaker 1 Role
								</label>
								<input
									type="text"
									id="roles_person1"
									name="roles_person1"
									value={getFormValue('roles_person1')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="industry expert analyst"
								/>
							</div>

							<div>
								<label for="roles_person2" class="block text-xs font-medium text-gray-700 mb-1">
									Speaker 2 Role
								</label>
								<input
									type="text"
									id="roles_person2"
									name="roles_person2"
									value={getFormValue('roles_person2')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="founder interviewer"
								/>
							</div>

							<div>
								<label for="conversation_style" class="block text-xs font-medium text-gray-700 mb-1">
									Styles <span class="text-xs text-gray-500">(comma-separated)</span>
								</label>
								<input
									type="text"
									id="conversation_style"
									name="conversation_style"
									value={getFormValue('conversation_style')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="professional, technical, engaging"
								/>
							</div>

							<div>
								<label for="dialogue_structure" class="block text-xs font-medium text-gray-700 mb-1">
									Structure <span class="text-xs text-gray-500">(comma-separated)</span>
								</label>
								<textarea
									id="dialogue_structure"
									name="dialogue_structure"
									rows="2"
									value={getFormValue('dialogue_structure')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="Introduction, Main Content, Conclusion"
								></textarea>
							</div>
						</div>
					</div>

					<!-- Engagement -->
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Engagement</h3>
						<div class="space-y-3">
							<div>
								<label for="llm_creativity" class="block text-xs font-medium text-gray-700 mb-1">
									Creativity (0.0 - 1.0)
								</label>
								<input
									type="number"
									id="llm_creativity"
									name="llm_creativity"
									value={getFormValue('llm_creativity') || '0.7'}
									min="0"
									max="1"
									step="0.1"
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="engagement_techniques" class="block text-xs font-medium text-gray-700 mb-1">
									Techniques <span class="text-xs text-gray-500">(comma-separated)</span>
								</label>
								<textarea
									id="engagement_techniques"
									name="engagement_techniques"
									rows="2"
									value={getFormValue('engagement_techniques')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="data points, case studies"
								></textarea>
							</div>

							<div>
								<label for="user_instructions" class="block text-xs font-medium text-gray-700 mb-1">
									Custom Instructions
								</label>
								<textarea
									id="user_instructions"
									name="user_instructions"
									rows="4"
									value={getFormValue('user_instructions')}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
									placeholder="Additional instructions for the LLM..."
								></textarea>
							</div>
						</div>
					</div>
				</div>

				<!-- RIGHT COLUMN: Voices & TTS -->
				<div class="space-y-6">
					<!-- TTS Configuration -->
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Text-to-Speech</h3>
						<div class="space-y-3">
							<div>
								<label for="tts_provider" class="block text-xs font-medium text-gray-700 mb-1">
									Provider
								</label>
								<select
									id="tts_provider"
									name="tts_provider"
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								>
									<option value="openai" selected>OpenAI</option>
									<option value="elevenlabs">ElevenLabs</option>
									<option value="edge">Edge TTS</option>
									<option value="gemini">Google Gemini</option>
								</select>
							</div>

							<div>
								<label for="tts_model" class="block text-xs font-medium text-gray-700 mb-1">
									Model
								</label>
								<input
									type="text"
									id="tts_model"
									name="tts_model"
									value={getFormValue('tts_model') || 'tts-1-hd'}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="voice_person1" class="block text-xs font-medium text-gray-700 mb-1">
									Speaker 1 Voice
								</label>
								<select
									id="voice_person1"
									name="voice_person1"
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								>
									<option value="">Default</option>
									<option value="alloy">alloy (neutral)</option>
									<option value="echo">echo (warm)</option>
									<option value="fable">fable (expressive)</option>
									<option value="onyx">onyx (deep)</option>
									<option value="nova">nova (friendly)</option>
									<option value="shimmer">shimmer (bright)</option>
								</select>
							</div>

							<div>
								<label for="voice_person2" class="block text-xs font-medium text-gray-700 mb-1">
									Speaker 2 Voice
								</label>
								<select
									id="voice_person2"
									name="voice_person2"
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								>
									<option value="">Default</option>
									<option value="alloy">alloy (neutral)</option>
									<option value="echo">echo (warm)</option>
									<option value="fable">fable (expressive)</option>
									<option value="onyx">onyx (deep)</option>
									<option value="nova">nova (friendly)</option>
									<option value="shimmer">shimmer (bright)</option>
								</select>
							</div>

							<div>
								<label for="audio_format" class="block text-xs font-medium text-gray-700 mb-1">
									Audio Format
								</label>
								<select
									id="audio_format"
									name="audio_format"
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								>
									<option value="mp3" selected>MP3</option>
									<option value="wav">WAV</option>
									<option value="ogg">OGG</option>
								</select>
							</div>

							<div>
								<label for="ending_message" class="block text-xs font-medium text-gray-700 mb-1">
									Ending Message
								</label>
								<input
									type="text"
									id="ending_message"
									name="ending_message"
									value={getFormValue('ending_message') || 'Bye Bye!'}
									class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
								/>
							</div>
						</div>
					</div>

					<!-- Quick Tips -->
					<div class="bg-blue-50 rounded-lg p-3 text-xs">
						<h4 class="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
						<ul class="text-blue-800 space-y-1">
							<li>• Config name: lowercase-with-hyphens</li>
							<li>• Arrays: comma-separated values</li>
							<li>• Leave fields empty to use defaults</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Error Message -->
			{#if form?.error}
				<div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-red-800 text-sm">{form.error}</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="mt-6 flex justify-between items-center pt-6 border-t">
				<a
					href="/podcasts/configs"
					class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm"
				>
					← Cancel
				</a>
				<button
					type="submit"
					class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
				>
					Create Configuration
				</button>
			</div>
		</div>
	</form>
</div>
