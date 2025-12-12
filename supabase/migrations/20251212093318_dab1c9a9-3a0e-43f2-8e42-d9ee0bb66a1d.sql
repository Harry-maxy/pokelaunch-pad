-- Add mint_address column to monsters table
ALTER TABLE public.monsters ADD COLUMN mint_address text;

-- Create index for faster lookups by mint address
CREATE INDEX idx_monsters_mint_address ON public.monsters(mint_address);