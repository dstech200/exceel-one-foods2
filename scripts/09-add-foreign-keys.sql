-- Add foreign key constraints after all tables are created
-- This script should be run after all other table creation scripts

-- Add foreign key from orders to customers (optional reference)
DO $$ 
BEGIN
    -- Check if customers table exists before adding foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        -- Only add constraint if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_orders_customer_id'
        ) THEN
            ALTER TABLE orders ADD CONSTRAINT fk_orders_customer_id 
                FOREIGN KEY (customer_id) REFERENCES customers(id);
        END IF;
    END IF;
END $$;

-- Add foreign key from order_items to orders
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_order_items_order_id'
        ) THEN
            ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id 
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Add foreign key from order_items to menu_items
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_order_items_menu_item_id'
        ) THEN
            ALTER TABLE order_items ADD CONSTRAINT fk_order_items_menu_item_id 
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id);
        END IF;
    END IF;
END $$;

-- Add foreign key from order_status_history to orders
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_status_history') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_order_status_history_order_id'
        ) THEN
            ALTER TABLE order_status_history ADD CONSTRAINT fk_order_status_history_order_id 
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
