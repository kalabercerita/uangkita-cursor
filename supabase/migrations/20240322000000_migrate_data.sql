-- Migration script to copy data from source project to target project
-- Make sure to run this in the target project's SQL editor

-- Enable dblink extension
CREATE EXTENSION IF NOT EXISTS dblink;

-- Set statement timeout to 1 hour
SET statement_timeout = '1h';

-- Create temporary table for user mapping
CREATE TEMP TABLE user_id_mapping (
    old_id UUID,
    new_id UUID
);

-- Copy users in batches
DO $$
DECLARE
    batch_size INTEGER := 100;
    offset_val INTEGER := 0;
    total_users INTEGER;
BEGIN
    -- Get total number of users
    SELECT COUNT(*) INTO total_users FROM dblink(
        'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
        'SELECT COUNT(*) FROM auth.users'
    ) AS t(count INTEGER);

    -- Process users in batches
    WHILE offset_val < total_users LOOP
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, role
        )
        SELECT 
            id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, role
        FROM dblink(
            'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
            'SELECT id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                    created_at, updated_at, role
             FROM auth.users
             ORDER BY id
             LIMIT ' || batch_size || ' OFFSET ' || offset_val
        ) AS t(
            id UUID, email TEXT, encrypted_password TEXT, email_confirmed_at TIMESTAMPTZ,
            raw_app_meta_data JSONB, raw_user_meta_data JSONB, created_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ, role TEXT
        );

        offset_val := offset_val + batch_size;
    END LOOP;
END $$;

-- Create user mapping
INSERT INTO user_id_mapping (old_id, new_id)
SELECT source.id, target.id
FROM dblink(
    'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
    'SELECT id, email FROM auth.users'
) AS source(id UUID, email TEXT)
JOIN auth.users target ON source.email = target.email;

-- Copy wallets in batches
DO $$
DECLARE
    batch_size INTEGER := 100;
    offset_val INTEGER := 0;
    total_wallets INTEGER;
BEGIN
    -- Get total number of wallets
    SELECT COUNT(*) INTO total_wallets FROM dblink(
        'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
        'SELECT COUNT(*) FROM public.wallets'
    ) AS t(count INTEGER);

    -- Process wallets in batches
    WHILE offset_val < total_wallets LOOP
        INSERT INTO public.wallets (
            id, user_id, name, balance, currency, created_at, updated_at
        )
        SELECT 
            w.id, m.new_id, w.name, w.balance, w.currency, w.created_at, w.updated_at
        FROM dblink(
            'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
            'SELECT id, user_id, name, balance, currency, created_at, updated_at
             FROM public.wallets
             ORDER BY id
             LIMIT ' || batch_size || ' OFFSET ' || offset_val
        ) AS w(
            id UUID, user_id UUID, name TEXT, balance DECIMAL, currency TEXT,
            created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
        )
        JOIN user_id_mapping m ON w.user_id = m.old_id;

        offset_val := offset_val + batch_size;
    END LOOP;
END $$;

-- Copy transactions in batches
DO $$
DECLARE
    batch_size INTEGER := 100;
    offset_val INTEGER := 0;
    total_transactions INTEGER;
BEGIN
    -- Get total number of transactions
    SELECT COUNT(*) INTO total_transactions FROM dblink(
        'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
        'SELECT COUNT(*) FROM public.transactions'
    ) AS t(count INTEGER);

    -- Process transactions in batches
    WHILE offset_val < total_transactions LOOP
        INSERT INTO public.transactions (
            id, user_id, wallet_id, amount, type, category_id, description, date, created_at, updated_at
        )
        SELECT 
            t.id, m.new_id, t.wallet_id, t.amount, t.type, t.category_id, t.description,
            t.date, t.created_at, t.updated_at
        FROM dblink(
            'dbname=postgres host=cussrbqrhbmafhdrgaxo.supabase.co port=5432 user=postgres password=Kolektor666&',
            'SELECT id, user_id, wallet_id, amount, type, category_id, description, date, created_at, updated_at
             FROM public.transactions
             ORDER BY id
             LIMIT ' || batch_size || ' OFFSET ' || offset_val
        ) AS t(
            id UUID, user_id UUID, wallet_id UUID, amount DECIMAL, type TEXT, category_id UUID,
            description TEXT, date DATE, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
        )
        JOIN user_id_mapping m ON t.user_id = m.old_id;

        offset_val := offset_val + batch_size;
    END LOOP;
END $$;

-- Clean up
DROP TABLE user_id_mapping;

-- Verify data
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.wallets;
SELECT COUNT(*) FROM public.transactions;

-- Cek jumlah pengguna
SELECT COUNT(*) FROM auth.users;

-- Cek jumlah dompet
SELECT COUNT(*) FROM public.wallets;

-- Cek jumlah transaksi
SELECT COUNT(*) FROM public.transactions;

-- Cek beberapa contoh data
SELECT * FROM auth.users LIMIT 5;
SELECT * FROM public.wallets LIMIT 5;
SELECT * FROM public.transactions LIMIT 5; 