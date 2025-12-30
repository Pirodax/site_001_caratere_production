-- =========================================================
-- Création du bucket pour les images
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;


-- =========================================================
-- Politique : upload d'images pour les sites appartenant à l'utilisateur
-- Chemin attendu : site_id/folder/filename
-- =========================================================
CREATE POLICY "Users can upload images to their site"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text
        FROM public.sites
        WHERE owner_id = auth.uid()
    )
);


-- =========================================================
-- Politique : mise à jour des images du site
-- =========================================================
CREATE POLICY "Users can update their site images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text
        FROM public.sites
        WHERE owner_id = auth.uid()
    )
);


-- =========================================================
-- Politique : suppression des images du site
-- =========================================================
CREATE POLICY "Users can delete their site images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text
        FROM public.sites
        WHERE owner_id = auth.uid()
    )
);


-- =========================================================
-- Politique : lecture publique des images
-- =========================================================
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'images'
);
