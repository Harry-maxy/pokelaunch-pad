-- Add mint_address field for Solana token address
ALTER TABLE public.monsters ADD COLUMN IF NOT EXISTS mint_address TEXT;

-- Add twitter_link field for social link
ALTER TABLE public.monsters ADD COLUMN IF NOT EXISTS twitter_link TEXT;

-- Create index on mint_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_monsters_mint_address ON public.monsters(mint_address);

-- Create index on creator_wallet for faster lookups by wallet
CREATE INDEX IF NOT EXISTS idx_monsters_creator_wallet ON public.monsters(creator_wallet);

-- Comment on columns
COMMENT ON COLUMN public.monsters.mint_address IS 'Solana token mint address from Pump.fun deployment';
COMMENT ON COLUMN public.monsters.twitter_link IS 'Twitter/X link for the monster project';


