-- Migration: Rename films table to works
-- Description: Renames the films table to works for better clarity


-- Drop old policies
DROP POLICY IF EXISTS "Users can view films of their sites" ON public.works;
DROP POLICY IF EXISTS "Users can insert films to their sites" ON public.works;
DROP POLICY IF EXISTS "Users can update films of their sites" ON public.works;
DROP POLICY IF EXISTS "Users can delete films of their sites" ON public.works;

-- Create new policies with updated names
CREATE POLICY "Users can view works of their sites"
  ON public.works FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert works to their sites"
  ON public.works FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update works of their sites"
  ON public.works FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete works of their sites"
  ON public.works FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = auth.uid()
    )
  );
