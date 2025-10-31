<script>
	// Dashboard landing page
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-2 text-gray-600">Multi-workflow prompt management system for n8n agents</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<!-- Test Connection Card -->
		<a href="/test" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
			<div class="flex items-center mb-4">
				<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Test Connection</h3>
			<p class="text-sm text-gray-600">Verify database connection and schema</p>
		</a>

		<!-- Workflows Card -->
		<a href="/workflows" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
			<div class="flex items-center mb-4">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Workflows</h3>
			<p class="text-sm text-gray-600">Manage workflow configurations</p>
		</a>

		<!-- Prompts Card -->
		<a href="/workflows" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
			<div class="flex items-center mb-4">
				<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Prompts</h3>
			<p class="text-sm text-gray-600">Manage prompts, versions, and sections</p>
		</a>
	</div>

	<!-- Phase Status -->
	<div class="bg-green-50 border border-green-200 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-green-900 mb-2">MVP Complete: Phase 5 - Section Management ✅</h3>
		<ul class="space-y-1 text-sm text-green-800">
			<li>✅ Phase 1: Foundation & Setup (SvelteKit, Supabase, TailwindCSS)</li>
			<li>✅ Phase 2: Workflow Management (CRUD with cascade validation)</li>
			<li>✅ Phase 3: Prompt Management (active/inactive toggle)</li>
			<li>✅ Phase 4: Version Management (publish/unpublish, model selection)</li>
			<li>✅ Phase 5: Section Management (drag-drop reordering, preview)</li>
		</ul>
		<p class="mt-4 text-sm text-green-800 font-semibold">
			Full 5-tier prompt builder ready for n8n integration! 🎉
		</p>
	</div>
</div>
