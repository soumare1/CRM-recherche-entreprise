/**
 * Script d'application de la migration SQL via l'API Supabase Management.
 * Usage : node scripts/apply-migration.mjs
 * 
 * Nécessite votre SERVICE ROLE KEY (pas la anon key).
 * Récupérez-la dans : Supabase Dashboard > Settings > API > service_role
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
// ⚠️ Remplacez par votre service_role key (Settings > API > service_role)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REMPLACEZ_PAR_VOTRE_SERVICE_ROLE_KEY';

const SQL = `
-- Extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tables
CREATE TABLE IF NOT EXISTS public.campagnes (
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

CREATE TABLE IF NOT EXISTS public.prospects (
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
    pipeline_stage text DEFAULT 'a_contacter' CHECK (pipeline_stage IN (
        'a_contacter', 'pas_decroche', 'a_rappeler', 
        'rdv_pris', 'devis_envoye', 'negoce', 'signe', 'pas_interesse'
    )),
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

CREATE TABLE IF NOT EXISTS public.appels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
    date_appel timestamptz DEFAULT now(),
    duree_secondes integer,
    a_decroche boolean DEFAULT false,
    resultat text CHECK (resultat IN ('rappeler', 'interesse', 'pas_interesse', 'rdv_pris', 'injoignable', 'faux_numero', 'autre')),
    notes text,
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- RLS
ALTER TABLE public.campagnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appels ENABLE ROW LEVEL SECURITY;

-- Policies campagnes
DO $$ BEGIN
  CREATE POLICY "own_campagnes_select" ON public.campagnes FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_campagnes_insert" ON public.campagnes FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_campagnes_update" ON public.campagnes FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_campagnes_delete" ON public.campagnes FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies prospects
DO $$ BEGIN
  CREATE POLICY "own_prospects_select" ON public.prospects FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_prospects_insert" ON public.prospects FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_prospects_update" ON public.prospects FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_prospects_delete" ON public.prospects FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies appels
DO $$ BEGIN
  CREATE POLICY "own_appels_select" ON public.appels FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_appels_insert" ON public.appels FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_appels_update" ON public.appels FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_appels_delete" ON public.appels FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$fn$ language plpgsql;

DROP TRIGGER IF EXISTS update_prospects_updated_at ON public.prospects;
CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON public.prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_prospect_dernier_contact()
RETURNS TRIGGER AS $fn$
BEGIN
    UPDATE public.prospects SET dernier_contact = NEW.date_appel WHERE id = NEW.prospect_id;
    RETURN NEW;
END;
$fn$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_update_dernier_contact ON public.appels;
CREATE TRIGGER trigger_update_dernier_contact
    AFTER INSERT ON public.appels
    FOR EACH ROW EXECUTE FUNCTION update_prospect_dernier_contact();

-- Index
CREATE INDEX IF NOT EXISTS idx_prospects_campagne ON public.prospects(campagne_id);
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline ON public.prospects(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_prospects_rappel ON public.prospects(prochain_rappel) WHERE prochain_rappel IS NOT NULL;
`;

async function applyMigration() {
  console.log('🚀 Application de la migration SQL sur Supabase...\n');

  if (SERVICE_ROLE_KEY === 'REMPLACEZ_PAR_VOTRE_SERVICE_ROLE_KEY') {
    console.error('❌ Vous devez fournir votre SERVICE_ROLE_KEY.');
    console.error('   Lancez : SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/apply-migration.mjs');
    process.exit(1);
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: SQL }),
  });

  // Alternative via pg endpoint
  const response2 = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: SQL }),
  });

  console.log('Status:', response2.status);
  const text = await response2.text();
  console.log('Réponse:', text.slice(0, 500));
}

applyMigration().catch(console.error);
