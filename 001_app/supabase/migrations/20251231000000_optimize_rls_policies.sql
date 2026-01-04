-- Migration: Optimize RLS Policies for Performance
-- Description: Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
-- This improves query performance by evaluating auth.uid() once instead of for each row

-- ============================================
-- TABLE: sites - Optimize RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can insert their own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON public.sites;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view their own sites"
  ON public.sites FOR SELECT
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Users can insert their own sites"
  ON public.sites FOR INSERT
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can update their own sites"
  ON public.sites FOR UPDATE
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Users can delete their own sites"
  ON public.sites FOR DELETE
  USING ((select auth.uid()) = owner_id);

-- ============================================
-- TABLE: media - Optimize RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
DROP POLICY IF EXISTS "Users can insert their own media" ON public.media;
DROP POLICY IF EXISTS "Users can update their own media" ON public.media;
DROP POLICY IF EXISTS "Users can delete their own media" ON public.media;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view their own media"
  ON public.media FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own media"
  ON public.media FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own media"
  ON public.media FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own media"
  ON public.media FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- TABLE: works - Optimize RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view works of their sites" ON public.works;
DROP POLICY IF EXISTS "Users can insert works to their sites" ON public.works;
DROP POLICY IF EXISTS "Users can update works of their sites" ON public.works;
DROP POLICY IF EXISTS "Users can delete works of their sites" ON public.works;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view works of their sites"
  ON public.works FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert works to their sites"
  ON public.works FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update works of their sites"
  ON public.works FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete works of their sites"
  ON public.works FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = works.site_id
      AND sites.owner_id = (select auth.uid())
    )
  );
