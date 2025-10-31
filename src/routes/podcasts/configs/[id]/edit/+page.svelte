<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// Helper functions for arrays
	function arrayToString(arr: string[] | null): string {
		return arr ? arr.join(', ') : '';
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
			<a href="/podcasts" class="hover:text-gray-700">Podcasts</a>
			<span>→</span>
			{#if data.podcast}
				<a href="/podcasts/{data.podcast.id}" class="hover:text-gray-700">{data.podcast.podcast_name}</a>
				<span>→</span>
			{/if}
			<a href="/podcasts/configs/{data.config.id}" class="hover:text-gray-700">{data.config.config_name}</a>
			<span>→</span>
			<span class="text-gray-900 font-medium">Edit</span>
		</div>
		<h1 class="text-3xl font-bold text-gray-900">Edit Podcast Configuration</h1>
		<p class="mt-2 text-gray-600">
			{#if data.podcast}
				<span class="font-medium">{data.podcast.podcast_name}</span> →
			{/if}
			{data.config.config_name}
		</p>
	</div>

	<!-- Form -->
	<form method="POST" use:enhance>
		<div class="space-y-6">

			<!-- Section 1: Basic Information -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">1. Basic Information</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="config_name" class="block text-sm font-medium text-gray-700 mb-2">
								Configuration Name <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="config_name"
								name="config_name"
								value={data.config.config_name}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="config_type" class="block text-sm font-medium text-gray-700 mb-2">
								Configuration Type <span class="text-red-500">*</span>
							</label>
							<select
								id="config_type"
								name="config_type"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="tech_startup" selected={data.config.config_type === 'tech_startup'}>Tech Startup</option>
								<option value="music_creative" selected={data.config.config_type === 'music_creative'}>Music Creative</option>
								<option value="educational" selected={data.config.config_type === 'educational'}>Educational</option>
								<option value="storytelling" selected={data.config.config_type === 'storytelling'}>Storytelling</option>
								<option value="debate" selected={data.config.config_type === 'debate'}>Debate</option>
								<option value="custom" selected={data.config.config_type === 'custom'}>Custom</option>
							</select>
						</div>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Description
						</label>
						<textarea
							id="description"
							name="description"
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						>{data.config.description || ''}</textarea>
					</div>
				</div>
			</div>

			<!-- Section 2: Conversation Style -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">2. Conversation Style</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="roles_person1" class="block text-sm font-medium text-gray-700 mb-2">
								Speaker 1 Role
							</label>
							<input
								type="text"
								id="roles_person1"
								name="roles_person1"
								value={data.config.roles_person1 || ''}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="roles_person2" class="block text-sm font-medium text-gray-700 mb-2">
								Speaker 2 Role
							</label>
							<input
								type="text"
								id="roles_person2"
								name="roles_person2"
								value={data.config.roles_person2 || ''}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label for="conversation_style" class="block text-sm font-medium text-gray-700 mb-2">
							Conversation Styles
						</label>
						<input
							type="text"
							id="conversation_style"
							name="conversation_style"
							value={arrayToString(data.config.conversation_style)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
						<p class="mt-1 text-xs text-gray-500">Comma-separated styles</p>
					</div>

					<div>
						<label for="dialogue_structure" class="block text-sm font-medium text-gray-700 mb-2">
							Dialogue Structure
						</label>
						<input
							type="text"
							id="dialogue_structure"
							name="dialogue_structure"
							value={arrayToString(data.config.dialogue_structure)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
						<p class="mt-1 text-xs text-gray-500">Comma-separated section names</p>
					</div>
				</div>
			</div>

			<!-- Section 3: Branding -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">3. Branding</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="podcast_name" class="block text-sm font-medium text-gray-700 mb-2">
								Podcast Name
							</label>
							<input
								type="text"
								id="podcast_name"
								name="podcast_name"
								value={data.config.podcast_name || ''}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="output_language" class="block text-sm font-medium text-gray-700 mb-2">
								Output Language
							</label>
							<input
								type="text"
								id="output_language"
								name="output_language"
								value={data.config.output_language}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label for="podcast_tagline" class="block text-sm font-medium text-gray-700 mb-2">
							Podcast Tagline
						</label>
						<input
							type="text"
							id="podcast_tagline"
							name="podcast_tagline"
							value={data.config.podcast_tagline || ''}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
			</div>

			<!-- Section 4: Engagement -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">4. Engagement</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="engagement_techniques" class="block text-sm font-medium text-gray-700 mb-2">
								Engagement Techniques
							</label>
							<input
								type="text"
								id="engagement_techniques"
								name="engagement_techniques"
								value={arrayToString(data.config.engagement_techniques)}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="llm_creativity" class="block text-sm font-medium text-gray-700 mb-2">
								Creativity Level
							</label>
							<input
								type="number"
								id="llm_creativity"
								name="llm_creativity"
								value={data.config.llm_creativity !== null ? data.config.llm_creativity : 0.7}
								min="0"
								max="1"
								step="0.1"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label for="user_instructions" class="block text-sm font-medium text-gray-700 mb-2">
							Custom Instructions
						</label>
						<textarea
							id="user_instructions"
							name="user_instructions"
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						>{data.config.user_instructions || ''}</textarea>
					</div>
				</div>
			</div>

			<!-- Section 5: Voice Selection -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">5. Voice Selection</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label for="tts_provider" class="block text-sm font-medium text-gray-700 mb-2">
								TTS Provider
							</label>
							<select
								id="tts_provider"
								name="tts_provider"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="openai" selected={data.config.tts_provider === 'openai'}>OpenAI</option>
								<option value="elevenlabs" selected={data.config.tts_provider === 'elevenlabs'}>ElevenLabs</option>
								<option value="edge" selected={data.config.tts_provider === 'edge'}>Edge TTS</option>
								<option value="gemini" selected={data.config.tts_provider === 'gemini'}>Google Gemini</option>
							</select>
						</div>

						<div>
							<label for="voice_person1" class="block text-sm font-medium text-gray-700 mb-2">
								Speaker 1 Voice
							</label>
							<select
								id="voice_person1"
								name="voice_person1"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Default</option>
								<option value="alloy" selected={data.config.voice_person1 === 'alloy'}>alloy (neutral)</option>
								<option value="echo" selected={data.config.voice_person1 === 'echo'}>echo (warm)</option>
								<option value="fable" selected={data.config.voice_person1 === 'fable'}>fable (expressive)</option>
								<option value="onyx" selected={data.config.voice_person1 === 'onyx'}>onyx (deep)</option>
								<option value="nova" selected={data.config.voice_person1 === 'nova'}>nova (friendly)</option>
								<option value="shimmer" selected={data.config.voice_person1 === 'shimmer'}>shimmer (bright)</option>
							</select>
						</div>

						<div>
							<label for="voice_person2" class="block text-sm font-medium text-gray-700 mb-2">
								Speaker 2 Voice
							</label>
							<select
								id="voice_person2"
								name="voice_person2"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Default</option>
								<option value="alloy" selected={data.config.voice_person2 === 'alloy'}>alloy (neutral)</option>
								<option value="echo" selected={data.config.voice_person2 === 'echo'}>echo (warm)</option>
								<option value="fable" selected={data.config.voice_person2 === 'fable'}>fable (expressive)</option>
								<option value="onyx" selected={data.config.voice_person2 === 'onyx'}>onyx (deep)</option>
								<option value="nova" selected={data.config.voice_person2 === 'nova'}>nova (friendly)</option>
								<option value="shimmer" selected={data.config.voice_person2 === 'shimmer'}>shimmer (bright)</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label for="tts_model" class="block text-sm font-medium text-gray-700 mb-2">
								TTS Model
							</label>
							<input
								type="text"
								id="tts_model"
								name="tts_model"
								value={data.config.tts_model || ''}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="audio_format" class="block text-sm font-medium text-gray-700 mb-2">
								Audio Format
							</label>
							<select
								id="audio_format"
								name="audio_format"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="mp3" selected={data.config.audio_format === 'mp3'}>MP3</option>
								<option value="wav" selected={data.config.audio_format === 'wav'}>WAV</option>
								<option value="ogg" selected={data.config.audio_format === 'ogg'}>OGG</option>
							</select>
						</div>

						<div>
							<label for="ending_message" class="block text-sm font-medium text-gray-700 mb-2">
								Ending Message
							</label>
							<input
								type="text"
								id="ending_message"
								name="ending_message"
								value={data.config.ending_message}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Section 6: Long-Form Settings -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">6. Long-Form Settings</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="max_num_chunks" class="block text-sm font-medium text-gray-700 mb-2">
								Maximum Chunks
							</label>
							<input
								type="number"
								id="max_num_chunks"
								name="max_num_chunks"
								value={data.config.max_num_chunks}
								min="1"
								max="20"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="min_chunk_size" class="block text-sm font-medium text-gray-700 mb-2">
								Minimum Chunk Size
							</label>
							<input
								type="number"
								id="min_chunk_size"
								name="min_chunk_size"
								value={data.config.min_chunk_size}
								min="100"
								max="2000"
								step="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Section 7: Advanced -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">7. Advanced Settings</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="llm_provider" class="block text-sm font-medium text-gray-700 mb-2">
								LLM Provider
							</label>
							<select
								id="llm_provider"
								name="llm_provider"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="" selected={!data.config.llm_provider}>Use Default</option>
								<option value="openrouter" selected={data.config.llm_provider === 'openrouter'}>OpenRouter</option>
								<option value="anthropic" selected={data.config.llm_provider === 'anthropic'}>Anthropic</option>
								<option value="openai" selected={data.config.llm_provider === 'openai'}>OpenAI</option>
							</select>
						</div>

						<div>
							<label for="llm_model" class="block text-sm font-medium text-gray-700 mb-2">
								LLM Model
							</label>
							<input
								type="text"
								id="llm_model"
								name="llm_model"
								value={data.config.llm_model || ''}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div class="flex items-center space-x-6">
						<div class="flex items-center">
							<input
								type="checkbox"
								id="is_active"
								name="is_active"
								checked={data.config.is_active}
								class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label for="is_active" class="ml-2 text-sm text-gray-700">
								Active
							</label>
						</div>

						<div class="flex items-center">
							<input
								type="checkbox"
								id="is_default"
								name="is_default"
								checked={data.config.is_default}
								class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label for="is_default" class="ml-2 text-sm text-gray-700">
								Set as default for this config type
							</label>
						</div>
					</div>
				</div>
			</div>

			<!-- Error Message -->
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-red-800 text-sm">{form.error}</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex justify-between items-center">
					<a
						href="/podcasts/configs/{data.config.id}"
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
		</div>
	</form>
</div>
