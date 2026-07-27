-- Migration: 20260730000000_init_schema.sql

-- Activer l'extension pgcrypto pour gen_random_uuid() si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS pgcrypto;

--------------------------------------------------------
-- 1. TABLES
--------------------------------------------------------

-- Table campagnes
CREATE TABLE public.campagnes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nom text NOT NULL,
    ville text NOT NULL,
    region text,
    code_postal text,
    statut text DEFAULT 'active' CHECK (statut IN ('active', 'terminee', 'archivee')),
    date_debut date DEFAULT CURRENT_DATE,
    date_fin date,
    objectif_prospects integer,
    notes text,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Table prospects
CREATE TABLE public.prospects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campagne_id uuid REFERENCES public.campagnes(id) ON DELETE SET NULL,
    nom text NOT NULL,
    secteur text,
    adresse text,
    ville text,
    code_postal text,
    telephone text,
    email text,
    site_web text,
    statut_web text CHECK (statut_web IN ('aucun_site', 'site_obsolete', 'site_ok')),
    pipeline_stage text DEFAULT 'a_contacter' CHECK (pipeline_stage IN ('a_contacter', 'pas_decroche', 'a_rappeler', 'rdv_pris', 'devis_envoye', 'negoce', 'signe', 'pas_interesse')),
    notes text,
    priorite integer DEFAULT 0,
    source text DEFAULT 'manuel',
    tags text[] DEFAULT '{}',
    dernier_contact timestamptz,
    prochain_rappel timestamptz,
    raison_perte text,
    montant_estime numeric(10,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Table appels
CREATE TABLE public.appels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
    date_appel timestamptz DEFAULT now(),
    duree_secondes integer,
    a_decroche boolean DEFAULT false,
    resultat text CHECK (resultat IN ('rappeler', 'interesse', 'pas_interesse', 'rdv_pris', 'injoignable', 'faux_numero', 'autre')),
    notes text,
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Table rdv
CREATE TABLE public.rdv (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
    date_rdv timestamptz NOT NULL,
    lieu text,
    type_rdv text CHECK (type_rdv IN ('telephone', 'visio', 'physique')),
    statut text DEFAULT 'planifie' CHECK (statut IN ('planifie', 'effectue', 'annule', 'reporte')),
    compte_rendu text,
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Table devis
CREATE TABLE public.devis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
    numero_devis text UNIQUE,
    montant numeric(10,2),
    description_prestation text,
    date_envoi timestamptz DEFAULT now(),
    date_validite timestamptz,
    statut text DEFAULT 'envoye' CHECK (statut IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Table activite_log
CREATE TABLE public.activite_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
    type_activite text NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Table imports
CREATE TABLE public.imports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_fichier text NOT NULL,
    campagne_id uuid REFERENCES public.campagnes(id),
    nb_lignes_total integer,
    nb_importes integer DEFAULT 0,
    nb_doublons integer DEFAULT 0,
    nb_erreurs integer DEFAULT 0,
    statut text DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'erreur')),
    erreurs_detail jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) NOT NULL
);


--------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
--------------------------------------------------------

ALTER TABLE public.campagnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activite_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;

-- Politiques pour les campagnes
CREATE POLICY "Les utilisateurs peuvent voir leurs propres campagnes" ON public.campagnes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres campagnes" ON public.campagnes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres campagnes" ON public.campagnes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres campagnes" ON public.campagnes FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les prospects
CREATE POLICY "Les utilisateurs peuvent voir leurs propres prospects" ON public.prospects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres prospects" ON public.prospects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres prospects" ON public.prospects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres prospects" ON public.prospects FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les appels
CREATE POLICY "Les utilisateurs peuvent voir leurs propres appels" ON public.appels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres appels" ON public.appels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres appels" ON public.appels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres appels" ON public.appels FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les RDV
CREATE POLICY "Les utilisateurs peuvent voir leurs propres RDV" ON public.rdv FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres RDV" ON public.rdv FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres RDV" ON public.rdv FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres RDV" ON public.rdv FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les devis
CREATE POLICY "Les utilisateurs peuvent voir leurs propres devis" ON public.devis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres devis" ON public.devis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres devis" ON public.devis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres devis" ON public.devis FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les activite_log
CREATE POLICY "Les utilisateurs peuvent voir leurs propres logs" ON public.activite_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres logs" ON public.activite_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres logs" ON public.activite_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres logs" ON public.activite_log FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les imports
CREATE POLICY "Les utilisateurs peuvent voir leurs propres imports" ON public.imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres imports" ON public.imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres imports" ON public.imports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres imports" ON public.imports FOR DELETE USING (auth.uid() = user_id);


--------------------------------------------------------
-- 3. TRIGGERS & FONCTIONS
--------------------------------------------------------

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Fonction pour mettre à jour dernier_contact sur un prospect après un appel
CREATE OR REPLACE FUNCTION update_prospect_dernier_contact()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.prospects
    SET dernier_contact = NEW.date_appel
    WHERE id = NEW.prospect_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_dernier_contact
    AFTER INSERT ON public.appels
    FOR EACH ROW
    EXECUTE FUNCTION update_prospect_dernier_contact();


-- Fonction pour logger les changements de stage dans le pipeline
CREATE OR REPLACE FUNCTION log_pipeline_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
        INSERT INTO public.activite_log (prospect_id, type_activite, description, metadata, user_id)
        VALUES (
            NEW.id, 
            'changement_stage', 
            'Le prospect est passé de ' || OLD.pipeline_stage || ' à ' || NEW.pipeline_stage,
            jsonb_build_object('ancien_stage', OLD.pipeline_stage, 'nouveau_stage', NEW.pipeline_stage),
            NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_stage_change
    AFTER UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION log_pipeline_stage_change();


-- Fonction pour auto-générer un numéro de devis
CREATE OR REPLACE FUNCTION set_numero_devis()
RETURNS TRIGGER AS $$
DECLARE
    annee text := to_char(CURRENT_DATE, 'YYYY');
    compteur integer;
    nouveau_numero text;
BEGIN
    IF NEW.numero_devis IS NULL THEN
        -- Trouver le plus grand compteur pour l'année en cours
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_devis FROM '-(\d+)$') AS integer)), 0)
        INTO compteur
        FROM public.devis
        WHERE numero_devis LIKE 'DEVIS-' || annee || '-%';
        
        compteur := compteur + 1;
        
        -- Formater avec des zéros (ex: 001)
        nouveau_numero := 'DEVIS-' || annee || '-' || LPAD(compteur::text, 3, '0');
        NEW.numero_devis := nouveau_numero;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_set_numero_devis
    BEFORE INSERT ON public.devis
    FOR EACH ROW
    EXECUTE FUNCTION set_numero_devis();


--------------------------------------------------------
-- 4. INDEX
--------------------------------------------------------
CREATE INDEX idx_prospects_campagne ON public.prospects(campagne_id);
CREATE INDEX idx_prospects_pipeline ON public.prospects(pipeline_stage);
CREATE INDEX idx_prospects_ville ON public.prospects(ville);
CREATE INDEX idx_appels_prospect ON public.appels(prospect_id);
CREATE INDEX idx_prospects_prochain_rappel ON public.prospects(prochain_rappel) WHERE prochain_rappel IS NOT NULL;
