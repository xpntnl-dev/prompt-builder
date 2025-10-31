# Prompt Builder

A powerful SvelteKit application for managing LLM prompts with workflow organization, version control, and section-based composition.

## Features

- 📋 **Workflow Management** - Organize prompts into logical workflows
- 📝 **Prompt Versioning** - Track changes with full version history
- 🧩 **Section-Based Composition** - Build prompts from reusable sections with variant support
- 🔄 **Drag-and-Drop Reordering** - Intuitive section organization
- 🎨 **Markdown Support** - Rich text formatting for prompt content
- 🤖 **LLM Model Configuration** - Manage available models and pricing
- 🔌 **Supabase Integration** - Persistent storage with PostgreSQL
- 🎯 **TypeScript** - Full type safety throughout

## Tech Stack

- **Framework:** SvelteKit with Svelte 5.0
- **Styling:** TailwindCSS with Typography plugin
- **Database:** Supabase (PostgreSQL)
- **Language:** TypeScript
- **Build Tool:** Vite

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompt-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here

   # Optional - for OpenRouter model pricing
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Run database migrations**

   Execute the SQL in `migrations/` against your Supabase project:
   - `001_add_section_variants.sql` - Adds section variants support

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

6. **Test database connection**

   Visit [http://localhost:5173/test](http://localhost:5173/test) to verify Supabase connectivity

## Database Schema

The application uses these Supabase tables:

- `workflows` - Top-level workflow definitions
- `prompts` - Prompt configurations within workflows
- `prompt_versions` - Version history for prompts
- `prompt_sections` - Individual sections with content variants
- `available_models` - LLM model configurations

See [migrations/](./migrations/) for detailed schema definitions.

## Project Structure

```
prompt-builder/
├── src/
│   ├── lib/
│   │   ├── server/          # Server-side utilities
│   │   │   ├── supabase.ts  # Supabase client
│   │   │   ├── openrouter.ts # OpenRouter API client
│   │   │   └── cache.ts     # Response caching
│   │   └── types/           # TypeScript type definitions
│   ├── routes/              # SvelteKit routes
│   │   ├── workflows/       # Workflow CRUD
│   │   ├── prompts/         # Prompt management
│   │   ├── editor/          # Prompt editor
│   │   ├── llm-models/      # Model configuration
│   │   └── test/            # DB connection test
│   └── app.css              # Global styles
├── static/                  # Static assets
├── migrations/              # Database migrations
└── .claude/                 # Claude Code configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript checks
- `npm run check:watch` - Watch mode for type checking

## Development with Claude Code

This project includes the Claude Code template with:

- **9 Specialized Agents** - For research and planning
  - `codebase-analyser` - Understand existing code
  - `code-quality-advisor` - Best practices research
  - `implementation-planner` - Step-by-step implementation plans
  - `strategic-technology-advisor` - Architecture guidance
  - And more...

- **Context Management** - Track all project activities in `.claude/docs/tasks/context.md`

- **Documentation Dashboard** - Browse project docs and agent reports
  ```bash
  cd docusaurus-site
  npm install
  npm run dev
  ```

See [CLAUDE.md](./CLAUDE.md) for detailed Claude Code usage instructions.

## API Integrations

### Supabase

The app uses Supabase service role key for direct database access (bypasses RLS). Configure in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

### OpenRouter (Optional)

For LLM model pricing data. The `/models` endpoint works without authentication, but you can add an API key for higher rate limits:

```env
OPENROUTER_API_KEY=your_api_key
```

## Contributing

This is a standalone extraction from the RVKCAT monorepo. The application is self-contained with no external dependencies.

## License

Private - All Rights Reserved

## Support

For issues or questions, please create an issue in the repository.

---

**Migrated from:** rvkcat/adminui/prompt-builder
**Migration Date:** October 31, 2025
**Original Project:** Revok Europa System v2
