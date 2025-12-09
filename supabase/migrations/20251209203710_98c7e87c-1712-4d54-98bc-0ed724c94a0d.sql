-- Create monster types enum
CREATE TYPE public.monster_type AS ENUM ('Fire', 'Water', 'Electric', 'Grass', 'Shadow', 'Meme');

-- Create rarity enum
CREATE TYPE public.monster_rarity AS ENUM ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  total_launches INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create monsters table
CREATE TABLE public.monsters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  description TEXT,
  type monster_type NOT NULL DEFAULT 'Meme',
  hp INTEGER NOT NULL DEFAULT 100,
  image_url TEXT,
  moves JSONB DEFAULT '[]'::jsonb,
  rarity monster_rarity NOT NULL DEFAULT 'Common',
  market_cap NUMERIC DEFAULT 0,
  evolution_stage INTEGER DEFAULT 1 CHECK (evolution_stage >= 1 AND evolution_stage <= 4),
  pump_url TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_wallet TEXT,
  volume_24h NUMERIC DEFAULT 0,
  holders INTEGER DEFAULT 0,
  price_change_24h NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on monsters
ALTER TABLE public.monsters ENABLE ROW LEVEL SECURITY;

-- Monsters policies (public read, authenticated write)
CREATE POLICY "Anyone can view monsters" ON public.monsters
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create monsters" ON public.monsters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own monsters" ON public.monsters
  FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own monsters" ON public.monsters
  FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type monster_type NOT NULL,
  image_url TEXT,
  base_moves JSONB DEFAULT '[]'::jsonb,
  rarity monster_rarity NOT NULL DEFAULT 'Common',
  hp INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Templates are public read
CREATE POLICY "Anyone can view templates" ON public.templates
  FOR SELECT USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, username)
  VALUES (gen_random_uuid(), NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update evolution stage based on market cap
CREATE OR REPLACE FUNCTION public.update_evolution_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.market_cap >= 1000000 THEN
    NEW.evolution_stage = 4;
  ELSIF NEW.market_cap >= 250000 THEN
    NEW.evolution_stage = 3;
  ELSIF NEW.market_cap >= 50000 THEN
    NEW.evolution_stage = 2;
  ELSE
    NEW.evolution_stage = 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for evolution stage updates
CREATE TRIGGER update_monster_evolution
  BEFORE UPDATE ON public.monsters
  FOR EACH ROW EXECUTE FUNCTION public.update_evolution_stage();

-- Insert default templates
INSERT INTO public.templates (name, type, image_url, base_moves, rarity, hp) VALUES
  ('Blazing Phoenix', 'Fire', NULL, '[{"name": "Phoenix Rise", "damage": 90}, {"name": "Flame Tornado", "damage": 70}]', 'Epic', 160),
  ('Ocean Leviathan', 'Water', NULL, '[{"name": "Deep Dive", "damage": 80}, {"name": "Whirlpool", "damage": 65}]', 'Rare', 140),
  ('Thunder Beast', 'Electric', NULL, '[{"name": "Gigavolt", "damage": 100}, {"name": "Chain Lightning", "damage": 55}]', 'Legendary', 180),
  ('Ancient Treant', 'Grass', NULL, '[{"name": "Root Prison", "damage": 60}, {"name": "Nature Wrath", "damage": 85}]', 'Rare', 150),
  ('Void Reaper', 'Shadow', NULL, '[{"name": "Soul Harvest", "damage": 95}, {"name": "Dark Matter", "damage": 75}]', 'Epic', 130),
  ('Pepe Supreme', 'Meme', NULL, '[{"name": "Rare Pepe", "damage": 69}, {"name": "Kek Beam", "damage": 42}]', 'Legendary', 169),
  ('Inferno Drake', 'Fire', NULL, '[{"name": "Dragon Breath", "damage": 85}, {"name": "Lava Pool", "damage": 60}]', 'Uncommon', 120),
  ('Frost Serpent', 'Water', NULL, '[{"name": "Ice Fang", "damage": 70}, {"name": "Blizzard", "damage": 80}]', 'Rare', 135),
  ('Storm Falcon', 'Electric', NULL, '[{"name": "Sky Strike", "damage": 75}, {"name": "Thunder Dive", "damage": 90}]', 'Uncommon', 110),
  ('Mushroom King', 'Grass', NULL, '[{"name": "Spore Cloud", "damage": 50}, {"name": "Toxic Bloom", "damage": 70}]', 'Common', 100),
  ('Phantom Knight', 'Shadow', NULL, '[{"name": "Ghost Slash", "damage": 80}, {"name": "Shadow Step", "damage": 60}]', 'Rare', 145),
  ('Doge Warrior', 'Meme', NULL, '[{"name": "Much Attack", "damage": 77}, {"name": "Very Power", "damage": 55}]', 'Epic', 140);