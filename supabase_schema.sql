-- Score Keeper Pro - Supabase schema / migration
-- Safe to run on an existing database. It adds missing columns and policies.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  max_score integer,
  ended boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  name text,
  total integer DEFAULT 0,
  eliminated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.rounds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  round_number integer,
  scores jsonb,
  created_at timestamptz DEFAULT now()
);

-- Upgrade older installations. IF NOT EXISTS prevents the created_at error you saw.
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS max_score integer;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS ended boolean DEFAULT false;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS game_id uuid;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS total integer DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS eliminated boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS game_id uuid;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS round_number integer;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS scores jsonb;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_select_games ON public.games;
DROP POLICY IF EXISTS allow_public_insert_games ON public.games;
DROP POLICY IF EXISTS allow_public_update_games ON public.games;
DROP POLICY IF EXISTS allow_public_delete_games ON public.games;
CREATE POLICY allow_public_select_games ON public.games FOR SELECT USING (true);
CREATE POLICY allow_public_insert_games ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY allow_public_update_games ON public.games FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY allow_public_delete_games ON public.games FOR DELETE USING (true);

DROP POLICY IF EXISTS allow_public_select_members ON public.members;
DROP POLICY IF EXISTS allow_public_insert_members ON public.members;
DROP POLICY IF EXISTS allow_public_update_members ON public.members;
DROP POLICY IF EXISTS allow_public_delete_members ON public.members;
CREATE POLICY allow_public_select_members ON public.members FOR SELECT USING (true);
CREATE POLICY allow_public_insert_members ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY allow_public_update_members ON public.members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY allow_public_delete_members ON public.members FOR DELETE USING (true);

DROP POLICY IF EXISTS allow_public_select_rounds ON public.rounds;
DROP POLICY IF EXISTS allow_public_insert_rounds ON public.rounds;
DROP POLICY IF EXISTS allow_public_update_rounds ON public.rounds;
DROP POLICY IF EXISTS allow_public_delete_rounds ON public.rounds;
CREATE POLICY allow_public_select_rounds ON public.rounds FOR SELECT USING (true);
CREATE POLICY allow_public_insert_rounds ON public.rounds FOR INSERT WITH CHECK (true);
CREATE POLICY allow_public_update_rounds ON public.rounds FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY allow_public_delete_rounds ON public.rounds FOR DELETE USING (true);

-- Keep existing rows valid after migration.
UPDATE public.games SET ended = COALESCE(ended,false) WHERE ended IS NULL;
UPDATE public.members SET total = COALESCE(total,0), eliminated = COALESCE(eliminated,false) WHERE total IS NULL OR eliminated IS NULL;
