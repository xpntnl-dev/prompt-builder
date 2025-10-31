<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	function handleRefresh() {
		window.location.reload();
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Database Connection Test</h1>
		<p class="mt-2 text-gray-600">Testing Supabase connection and schema validation</p>
	</div>

	<!-- Connection Status -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Connection Status</h2>
		<div class="flex items-center">
			{#if data.connection}
				<div class="flex items-center text-green-600">
					<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
					<span class="font-semibold">Connected to Supabase</span>
				</div>
			{:else}
				<div class="flex items-center text-red-600">
					<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
					<span class="font-semibold">Connection Failed</span>
				</div>
			{/if}
		</div>
		{#if data.error}
			<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded">
				<p class="text-red-800 text-sm">{data.error}</p>
			</div>
		{/if}
	</div>

	<!-- Tables Status -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Database Tables</h2>
		<div class="space-y-3">
			{#each Object.entries(data.tables) as [tableName, tableInfo]}
				<div class="flex items-center justify-between p-3 bg-gray-50 rounded">
					<div class="flex items-center">
						{#if tableInfo.exists}
							<svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						{/if}
						<span class="font-mono text-sm font-medium text-gray-900">{tableName}</span>
					</div>
					<div class="flex items-center space-x-4">
						{#if tableInfo.exists}
							<span class="text-sm text-gray-600">
								<span class="font-semibold">{tableInfo.count}</span> rows
							</span>
						{:else if tableInfo.error}
							<span class="text-xs text-red-600">{tableInfo.error}</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Summary -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-blue-900 mb-2">Phase 1: Foundation & Setup</h3>
		<p class="text-blue-800 text-sm">
			{#if data.connection && Object.values(data.tables).every(t => t.exists)}
				✅ All systems operational. Ready to proceed with Phase 2.
			{:else if data.connection}
				⚠️ Connection successful but some tables are missing. Please run the SQL migration scripts.
			{:else}
				❌ Connection failed. Please check your environment variables and Supabase credentials.
			{/if}
		</p>
	</div>

	<div class="flex justify-between items-center">
		<a href="/" class="text-blue-600 hover:text-blue-800">← Back to Dashboard</a>
		<button
			onclick={handleRefresh}
			class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
		>
			Refresh Test
		</button>
	</div>
</div>
