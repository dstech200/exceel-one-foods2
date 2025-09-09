-- Verify all tables were created successfully
SELECT 
  t.table_name,
  t.table_type
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('customers', 'menu_items', 'orders', 'order_items', 'order_status_history')
ORDER BY t.table_name;

-- Check column counts for each table
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('customers', 'menu_items', 'orders', 'order_items', 'order_status_history')
GROUP BY t.table_name
ORDER BY t.table_name;

-- Check if all expected tables exist
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY['customers', 'menu_items', 'orders', 'order_items', 'order_status_history'];
    current_table TEXT;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_exists BOOLEAN;
BEGIN
    FOREACH current_table IN ARRAY expected_tables
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = current_table
        ) INTO table_exists;
        
        IF NOT table_exists THEN
            missing_tables := array_append(missing_tables, current_table);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All tables created successfully!';
        RAISE NOTICE 'Database setup is complete and ready for use.';
    END IF;
END $$;

-- Show table relationships
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('customers', 'menu_items', 'orders', 'order_items', 'order_status_history')
    AND tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type;
