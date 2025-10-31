---
id: schema
title: Database Schema
sidebar_label: Schema
sidebar_position: 1
---

# Database Schema

## Overview

This template includes two specialized database schema reader agents that provide read-only analysis of your database structure.

## PostgreSQL Schema Reader

### Purpose

The `postgres-schema-reader` agent analyzes your PostgreSQL database and generates comprehensive schema documentation.

### When to Use

- **Schema Documentation:** Generate up-to-date database documentation
- **Understanding Structure:** Learn about existing tables and relationships
- **Query Optimization:** Identify indexes and constraints for efficient queries
- **Migration Planning:** Understand current schema before changes
- **Onboarding:** Help new developers understand the database

### How to Use

Invoke the agent in Claude Code:

```
@postgres-schema-reader

Please analyze the database schema and document all tables, columns, relationships, and constraints.
```

### Configuration

Update `.claude/agents/postgres-schema-reader.md` with your database connection details:

```markdown
**Database Connection:**
- Host: <your_host>
- Port: <your_port>
- Database: <database_name>
- User: <read_only_user>
```

### Output

The agent creates a detailed report at:
`.claude/docs/tasks/postgres-schema-reader/schema-analysis_[timestamp].md`

**Report includes:**
- Complete table list with descriptions
- Column definitions (name, type, constraints)
- Primary and foreign keys
- Indexes and their purposes
- Relationships between tables
- Triggers and stored procedures (if any)
- Constraints and validation rules

### Example Report Structure

```markdown
# PostgreSQL Schema Analysis

## Database Summary
- Database: your_db_name
- Total Tables: 12
- Total Views: 3
- Analysis Date: 03Oct2025_1430

## Tables

### users
**Purpose:** Store user account information

**Columns:**
- `id` (UUID, PRIMARY KEY) - Unique user identifier
- `email` (VARCHAR(255), UNIQUE, NOT NULL) - User email
- `created_at` (TIMESTAMP, DEFAULT NOW()) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time

**Indexes:**
- `users_pkey` on (id)
- `users_email_key` on (email)

**Foreign Keys:**
- None

**Referenced By:**
- `posts.user_id` → `users.id`
- `comments.user_id` → `users.id`

### posts
...
```

## Supabase Schema Reader

### Purpose

The `supabase-schema-reader` agent analyzes your Supabase production database with special attention to Supabase-specific features like RLS policies.

### When to Use

- **RLS Policy Review:** Understand Row Level Security configurations
- **Schema Documentation:** Document Supabase tables and relationships
- **Security Audit:** Review access control policies
- **Migration Planning:** Prepare for schema changes
- **API Design:** Understand data structure for API endpoints

### How to Use

Invoke the agent in Claude Code:

```
@supabase-schema-reader

Please analyze the Supabase schema including RLS policies and document all tables.
```

### Configuration

Update `.claude/agents/supabase-schema-reader.md` with your Supabase project details:

```markdown
**Supabase Project:**
- Project ID: <your_project_id>
- Region: <your_region>
- Database: <database_name>
```

### Output

The agent creates a detailed report at:
`.claude/docs/tasks/supabase-schema-reader/supabase-schema-analysis_[timestamp].md`

**Report includes:**
- All schema information from PostgreSQL analysis
- **RLS Policies** for each table
- **Triggers** and their purposes
- **Functions** used in policies or triggers
- **Realtime** configuration (if enabled)
- **Storage buckets** (if applicable)

### Example Report Structure

```markdown
# Supabase Schema Analysis

## Project Summary
- Project: your-project
- Database: your_db
- Total Tables: 15
- RLS Enabled Tables: 12
- Analysis Date: 03Oct2025_1430

## Tables

### profiles
**Purpose:** User profile information

**Columns:**
- `id` (UUID, PRIMARY KEY) - Profile ID (references auth.users)
- `username` (TEXT, UNIQUE) - User display name
- `avatar_url` (TEXT) - Profile picture URL
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**RLS Policies:**

1. **Enable read access for all users**
   - Command: SELECT
   - Using: `true`
   - Check: N/A

2. **Enable insert for authenticated users only**
   - Command: INSERT
   - Using: N/A
   - Check: `auth.uid() = id`

3. **Enable update for users based on id**
   - Command: UPDATE
   - Using: `auth.uid() = id`
   - Check: `auth.uid() = id`

**Triggers:**
- `handle_updated_at` - Updates `updated_at` on row changes

**Indexes:**
- `profiles_pkey` on (id)
- `profiles_username_key` on (username)
```

## Schema Documentation Format

### Best Practices

When requesting schema analysis:

1. **Be Specific:**
   ```
   @postgres-schema-reader

   Please analyze the 'users' and 'posts' tables with focus on relationships and indexes.
   ```

2. **Request Specific Information:**
   ```
   @supabase-schema-reader

   Please document all RLS policies for user-facing tables.
   ```

3. **Follow-up Analysis:**
   ```
   @postgres-schema-reader

   Based on the previous schema analysis, identify optimization opportunities for the 'comments' table.
   ```

### Report Lifecycle

1. **Generation:** Agent analyzes database and creates report
2. **Context Update:** Entry added to `context.md` with link to report
3. **Dashboard Display:** New entry appears on Dashboard within 2-3 seconds
4. **Reference:** Use report for implementation and documentation

## Security Best Practices

### Read-Only Access

Both agents operate in **read-only mode**:

- Use dedicated read-only database user
- Grant only SELECT permissions
- No schema modification capabilities
- Safe to run against production databases

### Configuration Security

**Never commit database credentials:**
- Keep agent config files in `.gitignore`
- Use environment variables when possible
- Document required permissions without exposing credentials

**Example `.gitignore` entry:**
```
.claude/agents/postgres-schema-reader.md
.claude/agents/supabase-schema-reader.md
```

Keep template versions with placeholder values only.

### Supabase Security

For Supabase projects:
- Use service role key only for schema reading
- Never expose service role key in code
- Review RLS policies regularly
- Document policy purposes

## Common Workflows

### Initial Database Documentation

1. **Run Schema Analysis:**
   ```
   @postgres-schema-reader
   # or
   @supabase-schema-reader

   Please generate complete schema documentation.
   ```

2. **Review Report:**
   - Check Dashboard for report link
   - Read table structures
   - Understand relationships

3. **Update Project Docs:**
   - Copy relevant sections to project README
   - Document table purposes
   - Explain key relationships

### Pre-Migration Analysis

1. **Document Current State:**
   ```
   @postgres-schema-reader

   Document current schema focusing on tables I plan to modify.
   ```

2. **Plan Changes:**
   - Review current structure
   - Identify breaking changes
   - Plan migration steps

3. **Post-Migration Verification:**
   ```
   @postgres-schema-reader

   Verify migration completed successfully by documenting updated schema.
   ```

### Security Audit

1. **Analyze RLS Policies:**
   ```
   @supabase-schema-reader

   Document all RLS policies with focus on security implications.
   ```

2. **Review Findings:**
   - Check policy coverage
   - Verify access controls
   - Identify gaps

3. **Document Changes:**
   - Update context.md with findings
   - Link to detailed report
   - Track remediation

## Troubleshooting

### Connection Issues

**Symptom:** Agent cannot connect to database

**Solutions:**
1. Verify database credentials in agent config
2. Check network access (firewall, VPN)
3. Confirm read-only user has SELECT permissions
4. Test connection manually with psql or similar tool

### Missing Tables

**Symptom:** Agent doesn't report all tables

**Solutions:**
1. Check schema search path
2. Verify user has access to all schemas
3. Specify schema explicitly in request
4. Review database user permissions

### Slow Analysis

**Symptom:** Schema analysis takes long time

**Solutions:**
1. Analyze specific tables instead of entire database
2. Exclude large tables if not needed
3. Check database performance
4. Run during off-peak hours

---

The database schema agents provide powerful, safe, read-only analysis capabilities that help you understand and document your database structure without risking any modifications.
