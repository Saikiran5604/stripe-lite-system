-- Fix schema mismatches between code and database

-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        CREATE INDEX idx_users_role ON users(role);
    END IF;
END $$;

-- Update existing users to have a role (first user becomes admin)
UPDATE users SET role = 'admin' 
WHERE role IS NULL 
AND id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

UPDATE users SET role = 'user' 
WHERE role IS NULL;

-- Fix invoices table - remove extra columns and rename paid_at to paid_date
DO $$
BEGIN
    -- Check if we have the old schema with tax and total columns
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='invoices' AND column_name='tax') THEN
        ALTER TABLE invoices DROP COLUMN IF EXISTS tax;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='invoices' AND column_name='total') THEN
        ALTER TABLE invoices DROP COLUMN IF EXISTS total;
    END IF;
    
    -- Rename paid_at to paid_date if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='invoices' AND column_name='paid_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='invoices' AND column_name='paid_date') THEN
        ALTER TABLE invoices RENAME COLUMN paid_at TO paid_date;
    END IF;
END $$;

-- Fix payment_transactions table - remove user_id and metadata columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='payment_transactions' AND column_name='user_id') THEN
        ALTER TABLE payment_transactions DROP COLUMN user_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='payment_transactions' AND column_name='metadata') THEN
        ALTER TABLE payment_transactions DROP COLUMN metadata;
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_transactions' AND column_name='transaction_id') THEN
        ALTER TABLE payment_transactions ADD COLUMN transaction_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_transactions' AND column_name='transaction_date') THEN
        ALTER TABLE payment_transactions ADD COLUMN transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix subscription_history table - rename columns to match code expectations
DO $$
BEGIN
    -- Rename old_status to previous_status
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='subscription_history' AND column_name='old_status') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='subscription_history' AND column_name='previous_status') THEN
        ALTER TABLE subscription_history RENAME COLUMN old_status TO previous_status;
    END IF;
    
    -- Rename metadata to notes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='subscription_history' AND column_name='metadata') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='subscription_history' AND column_name='notes') THEN
        ALTER TABLE subscription_history RENAME COLUMN metadata TO notes;
        ALTER TABLE subscription_history ALTER COLUMN notes TYPE TEXT;
    END IF;
    
    -- Remove user_id if it exists (subscription_id is the FK we need)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='subscription_history' AND column_name='user_id') THEN
        ALTER TABLE subscription_history DROP COLUMN user_id;
    END IF;
    
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_history' AND column_name='changed_by') THEN
        ALTER TABLE subscription_history ADD COLUMN changed_by UUID REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_history' AND column_name='change_date') THEN
        ALTER TABLE subscription_history ADD COLUMN change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Remove user_id from user_subscriptions payment_method column if it's causing issues
DO $$
BEGIN
    -- Ensure payment_method column exists and is correct type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_subscriptions' AND column_name='payment_method') THEN
        ALTER TABLE user_subscriptions ADD COLUMN payment_method VARCHAR(50);
    END IF;
END $$;
