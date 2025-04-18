-- Create a function to handle wallet transfers
CREATE OR REPLACE FUNCTION transfer_between_wallets(
  p_from_wallet_id UUID,
  p_to_wallet_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_wallet RECORD;
  v_to_wallet RECORD;
  v_expense_id UUID;
  v_income_id UUID;
BEGIN
  -- Get wallet information
  SELECT * INTO v_from_wallet FROM wallets WHERE id = p_from_wallet_id AND user_id = p_user_id;
  SELECT * INTO v_to_wallet FROM wallets WHERE id = p_to_wallet_id AND user_id = p_user_id;
  
  -- Validate wallets exist and belong to the user
  IF v_from_wallet IS NULL OR v_to_wallet IS NULL THEN
    RAISE EXCEPTION 'Dompet tidak ditemukan';
  END IF;
  
  -- Validate sufficient balance
  IF v_from_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Saldo tidak mencukupi';
  END IF;
  
  -- Generate transaction IDs
  v_expense_id := gen_random_uuid();
  v_income_id := gen_random_uuid();
  
  -- Start transaction
  BEGIN
    -- Create expense transaction
    INSERT INTO transactions (
      id,
      user_id,
      wallet_id,
      category_id,
      type,
      amount,
      description,
      date
    ) VALUES (
      v_expense_id,
      p_user_id,
      p_from_wallet_id,
      'transfer',
      'expense',
      p_amount,
      p_description || ' (Transfer keluar)',
      NOW()
    );
    
    -- Create income transaction
    INSERT INTO transactions (
      id,
      user_id,
      wallet_id,
      category_id,
      type,
      amount,
      description,
      date
    ) VALUES (
      v_income_id,
      p_user_id,
      p_to_wallet_id,
      'transfer',
      'income',
      p_amount,
      p_description || ' (Transfer masuk)',
      NOW()
    );
    
    -- Update source wallet balance
    UPDATE wallets
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE id = p_from_wallet_id;
    
    -- Update target wallet balance
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE id = p_to_wallet_id;
    
    -- Return success response
    RETURN jsonb_build_object(
      'success', true,
      'expense_id', v_expense_id,
      'income_id', v_income_id
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction
    RAISE EXCEPTION 'Transfer gagal: %', SQLERRM;
  END;
END;
$$; 