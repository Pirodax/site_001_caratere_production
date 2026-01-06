-- Migration: Allow Public Read Access
-- Description: Permet à tous les visiteurs (même non-authentifiés) de voir le contenu du site
-- Seuls les propriétaires authentifiés peuvent modifier/supprimer

-- ============================================
-- TABLE: sites - Accès public en lecture
-- ============================================

-- Supprimer l'ancienne politique SELECT
DROP POLICY IF EXISTS "Users can view their own sites" ON public.sites;

-- Nouvelle politique SELECT - Tout le monde peut voir
CREATE POLICY "Anyone can view sites"
  ON public.sites FOR SELECT
  USING (true);

-- Les autres politiques restent inchangées (INSERT/UPDATE/DELETE réservés aux propriétaires)

-- ============================================
-- TABLE: works - Accès public en lecture
-- ============================================

-- Supprimer l'ancienne politique SELECT
DROP POLICY IF EXISTS "Users can view works of their sites" ON public.works;

-- Nouvelle politique SELECT - Tout le monde peut voir les works
CREATE POLICY "Anyone can view works"
  ON public.works FOR SELECT
  USING (true);

-- Les autres politiques restent inchangées (INSERT/UPDATE/DELETE réservés aux propriétaires)

-- ============================================
-- TABLE: media - Accès public en lecture
-- ============================================

-- Supprimer l'ancienne politique SELECT
DROP POLICY IF EXISTS "Users can view their own media" ON public.media;

-- Nouvelle politique SELECT - Tout le monde peut voir les médias
CREATE POLICY "Anyone can view media"
  ON public.media FOR SELECT
  USING (true);

-- Les autres politiques restent inchangées (INSERT/UPDATE/DELETE réservés aux propriétaires)

-- ============================================
-- RÉSUMÉ DES PERMISSIONS
-- ============================================
--
-- Sites:
--   SELECT: Tout le monde (visiteurs + authentifiés)
--   INSERT/UPDATE/DELETE: Uniquement les propriétaires (auth.uid() = owner_id)
--
-- Works:
--   SELECT: Tout le monde
--   INSERT/UPDATE/DELETE: Uniquement les propriétaires via leurs sites
--
-- Media:
--   SELECT: Tout le monde
--   INSERT/UPDATE/DELETE: Uniquement les propriétaires (auth.uid() = user_id)
