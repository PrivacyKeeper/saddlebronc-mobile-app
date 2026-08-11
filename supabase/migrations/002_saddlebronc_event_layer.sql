-- 002 — Saddle bronc event layer
--
-- Half the score belongs to an animal the contestant does not own, so the
-- stock intelligence tables are the core of this app rather than a side
-- feature. The four component judge marks are always stored — a total alone
-- cannot reconstruct a protest.

CREATE TABLE IF NOT EXISTS public.bucking_horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID,
  name TEXT NOT NULL,
  brand TEXT,
  foaling_year INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bronc_patterns (
  horse_id UUID PRIMARY KEY REFERENCES public.bucking_horses(id) ON DELETE CASCADE,
  jump_frequency_hz NUMERIC(4,2),
  direction_changes_avg NUMERIC(4,2),
  drop_severity_avg NUMERIC(4,2),
  buck_off_rate NUMERIC(5,2),
  avg_horse_score NUMERIC(4,1),
  trips_recorded INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sb_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES public.bucking_horses(id) ON DELETE SET NULL,
  rule_set_id UUID REFERENCES public.rule_sets(id),
  qualified_ride BOOLEAN NOT NULL DEFAULT false,
  marked_out BOOLEAN,
  -- All four component marks, never just the total. Judge splits are
  -- analytically interesting and are needed to reconstruct a protest.
  judge1_rider INTEGER CHECK (judge1_rider BETWEEN 0 AND 25),
  judge1_horse INTEGER CHECK (judge1_horse BETWEEN 0 AND 25),
  judge2_rider INTEGER CHECK (judge2_rider BETWEEN 0 AND 25),
  judge2_horse INTEGER CHECK (judge2_horse BETWEEN 0 AND 25),
  official_score INTEGER GENERATED ALWAYS AS (
    COALESCE(judge1_rider,0) + COALESCE(judge1_horse,0) +
    COALESCE(judge2_rider,0) + COALESCE(judge2_horse,0)
  ) STORED,
  status TEXT NOT NULL DEFAULT 'clean',
  reride_offered BOOLEAN NOT NULL DEFAULT false,
  reride_accepted BOOLEAN,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sb_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES public.bucking_horses(id) ON DELETE CASCADE,
  event_name TEXT,
  performance_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bucking_horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bronc_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_rides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_draws       ENABLE ROW LEVEL SECURITY;

-- Stock data is public. A rider who has drawn a horse needs to know what
-- everybody else already knows about it.
DROP POLICY IF EXISTS "Bucking horses are public" ON public.bucking_horses;
CREATE POLICY "Bucking horses are public" ON public.bucking_horses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Patterns are public" ON public.bronc_patterns;
CREATE POLICY "Patterns are public" ON public.bronc_patterns FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage own rides" ON public.sb_rides;
CREATE POLICY "Users manage own rides" ON public.sb_rides FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users manage own draws" ON public.sb_draws;
CREATE POLICY "Users manage own draws" ON public.sb_draws FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
