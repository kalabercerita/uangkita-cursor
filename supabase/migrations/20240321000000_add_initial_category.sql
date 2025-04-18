-- Create initial balance category for all users
INSERT INTO public.categories (id, name, type, icon, color, is_system)
SELECT 
  'init-balance-' || user_id,
  'Saldo Awal',
  'income',
  'wallet',
  'gray',
  true
FROM auth.users
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.categories IS 'Categories for transactions including system categories like initial balance';

-- Function to handle initial balance transaction
CREATE OR REPLACE FUNCTION public.handle_initial_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction if initial balance > 0
  IF NEW.balance > 0 THEN
    INSERT INTO public.transactions (
      description,
      amount,
      type,
      category_id,
      wallet_id,
      user_id,
      date
    ) VALUES (
      'Saldo Awal',
      NEW.balance,
      'income',
      'init-balance-' || NEW.user_id,
      NEW.id,
      NEW.user_id,
      NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new wallets
DROP TRIGGER IF EXISTS on_wallet_created ON public.wallets;
CREATE TRIGGER on_wallet_created
  AFTER INSERT ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_initial_balance(); 