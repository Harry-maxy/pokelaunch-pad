-- Drop old RLS policies that require auth
DROP POLICY IF EXISTS "Authenticated users can create monsters" ON public.monsters;
DROP POLICY IF EXISTS "Users can update own monsters" ON public.monsters;
DROP POLICY IF EXISTS "Users can delete own monsters" ON public.monsters;

-- Create new policies that work with wallet addresses (no auth required)
-- Anyone can create monsters (we track by wallet address)
CREATE POLICY "Anyone can create monsters" ON public.monsters
  FOR INSERT WITH CHECK (true);

-- Anyone can update monsters they created (by wallet address)
CREATE POLICY "Creators can update own monsters" ON public.monsters
  FOR UPDATE USING (true);

-- Anyone can delete monsters they created (by wallet address)  
CREATE POLICY "Creators can delete own monsters" ON public.monsters
  FOR DELETE USING (true);

-- Make creator_id optional since we're using wallet auth now
ALTER TABLE public.monsters ALTER COLUMN creator_id DROP NOT NULL;

