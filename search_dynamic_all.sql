-- DYNAMIC SEARCH: Automatically searches ALL text columns in ALL tables
-- This will find "You are a wise and compassionate guide" anywhere in the database

DO $$
DECLARE
    table_rec RECORD;
    column_rec RECORD;
    result_rec RECORD;
    query TEXT;
    result_count INTEGER;
BEGIN
    RAISE NOTICE '=== Starting comprehensive database search ===';
    RAISE NOTICE 'Search phrase: "You are a wise and compassionate guide"';
    RAISE NOTICE '';

    -- Loop through all tables in public schema
    FOR table_rec IN
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND data_type IN ('text', 'character varying', 'varchar', 'USER-DEFINED')
        ORDER BY table_name
    LOOP
        RAISE NOTICE 'Searching table: %', table_rec.table_name;

        -- Loop through all text columns in this table
        FOR column_rec IN
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = table_rec.table_name
              AND data_type IN ('text', 'character varying', 'varchar', 'USER-DEFINED')
            ORDER BY ordinal_position
        LOOP
            -- Build and execute search query
            query := format(
                'SELECT COUNT(*) FROM %I WHERE %I::text ILIKE ''%%wise and compassionate guide%%''',
                table_rec.table_name,
                column_rec.column_name
            );

            EXECUTE query INTO result_count;

            IF result_count > 0 THEN
                RAISE NOTICE '  ✓ FOUND in column "%" (%): % row(s)',
                    column_rec.column_name,
                    column_rec.data_type,
                    result_count;

                -- Show sample data
                query := format(
                    'SELECT %I, LEFT(%I::text, 100) as preview FROM %I WHERE %I::text ILIKE ''%%wise and compassionate guide%%'' LIMIT 3',
                    'id',
                    column_rec.column_name,
                    table_rec.table_name,
                    column_rec.column_name
                );

                RAISE NOTICE '    Sample data from %.%:', table_rec.table_name, column_rec.column_name;
                FOR result_rec IN EXECUTE query LOOP
                    RAISE NOTICE '      ID: %, Preview: %', result_rec.id, result_rec.preview;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '=== Search complete ===';
END $$;
