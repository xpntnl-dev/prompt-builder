<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';

	function isActive(path: string): boolean {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	// Track which sections are expanded
	const agentsExpanded = writable(true);
</script>

<div class="min-h-screen bg-gray-50 flex">
	<!-- Left Sidebar -->
	<aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
		<!-- Logo/Header -->
		<div class="p-6 border-b border-gray-200">
			<h1 class="text-xl font-bold text-gray-900">EUROPA 🤖</h1>
			<p class="text-sm text-gray-500">LLM AGENT COMMAND HQ</p>
		</div>

		<!-- Navigation Links -->
		<nav class="flex-1 p-4 space-y-1">
			<a
				href="/"
				class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors {isActive('/') && !isActive('/workflows') && !isActive('/test')
					? 'bg-blue-50 text-blue-700'
					: 'text-gray-700 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
				</svg>
				Dashboard
			</a>

			<!-- Agents Section -->
			<div>
				<a
					href="/workflows"
					class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors {isActive('/workflows') || isActive('/prompts')
						? 'bg-blue-50 text-blue-700'
						: 'text-gray-700 hover:bg-gray-100'}"
				>
					<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
					</svg>
					<span class="flex-1">Agents</span>
					<button
						on:click|preventDefault|stopPropagation={() => agentsExpanded.update(v => !v)}
						class="p-1 hover:bg-gray-200 rounded"
					>
						<svg class="w-4 h-4 transition-transform {$agentsExpanded ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</button>
				</a>

				{#if $agentsExpanded}
					<div class="ml-4 mt-1 space-y-1">
						<a
							href="/prompts"
							class="flex items-center px-4 py-2 text-sm rounded-lg transition-colors {isActive('/prompts')
								? 'bg-blue-50 text-blue-700'
								: 'text-gray-600 hover:bg-gray-100'}"
						>
							<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
							</svg>
							Prompts
						</a>
					</div>
				{/if}
			</div>

			<!-- Podcasts Section -->
			<div>
				<a
					href="/podcasts"
					class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors {isActive('/podcasts')
						? 'bg-blue-50 text-blue-700'
						: 'text-gray-700 hover:bg-gray-100'}"
				>
					<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
					</svg>
					<span class="flex-1 text-left">Podcasts</span>
				</a>
			</div>

			<a
				href="/llm-models"
				class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors {isActive('/llm-models')
					? 'bg-blue-50 text-blue-700'
					: 'text-gray-700 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				LLM Models
			</a>

			<a
				href="/test"
				class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors {isActive('/test')
					? 'bg-blue-50 text-blue-700'
					: 'text-gray-700 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
				</svg>
				Test Connection
			</a>
		</nav>
	</aside>

	<!-- Main Content Area -->
	<div class="flex-1 flex flex-col min-w-0">
		<main class="flex-1 p-8 overflow-auto">
			<slot />
		</main>
	</div>
</div>
