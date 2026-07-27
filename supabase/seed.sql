-- Seed data: supabase/seed.sql

-- 1. Créer un utilisateur de test (pour le développement local)
-- On utilise un UUID fixe pour faciliter les tests
DO $$
DECLARE
    test_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Insertion dans auth.users si n'existe pas (nécessaire car user_id est NOT NULL dans nos tables)
    -- Ceci est pour le dev local. En prod, l'utilisateur existera via le système d'auth.
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated', 'authenticated', 'test@buzz.com', 
        crypt('password123', gen_salt('bf')), now(), now(), now(), 
        '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Créer la campagne
    INSERT INTO public.campagnes (id, nom, ville, region, code_postal, statut, user_id)
    VALUES (
        '11111111-1111-1111-1111-111111111111', 
        'Évry-Courcouronnes — Juillet 2026', 
        'Évry-Courcouronnes', 
        'Île-de-France', 
        '91000', 
        'active', 
        test_user_id
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Insérer les 30 prospects
    INSERT INTO public.prospects (campagne_id, nom, secteur, adresse, ville, telephone, statut_web, source, user_id)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', 'AFK Épicerie', 'Épicerie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 52 63', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'La Bonoise', 'Boulangerie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 64 97 67 61', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Boulangerie Pâtisserie Sydney', 'Boulangerie-Pâtisserie', '1 Allée de l''Orme à Martin, Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 78 33 34', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Aux Délices d''Evry', 'Boulangerie-Pâtisserie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 90 17', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'N&BRY Coiffure', 'Coiffure', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 18 74', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Innovation Coiffure', 'Coiffure', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 21 63', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Feeling Beauty', 'Institut de beauté', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 78 39 83', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Guy Ongles', 'Onglerie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '06 21 49 81 12', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'FAI Beauty', 'Institut de beauté', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '07 67 36 10 67', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'La Corbeille à Confitures', 'Épicerie fine', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 78 49 25', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Le Biblos', 'Restaurant', 'Place des Miroirs, Évry-Courcouronnes', 'Évry-Courcouronnes', '01 69 36 94 27', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Café de la République', 'Café', 'Place de la République, Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 62 78', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'African Food', 'Restaurant africain', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 47 62', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Bodrum', 'Restaurant turc', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 78 05 15', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Le Goût de Carthage', 'Restaurant tunisien', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 93 47', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'TENZ DUMPLING', 'Restaurant asiatique', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '09 54 86 78 45', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Le hérisson jaune', 'Crêperie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 87 24', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Ravito Gourmand', 'Restauration rapide', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '07 68 27 59 03', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Le Bar à Crêpes', 'Crêperie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 55 44', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'La Petite Mordi', 'Snack', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '06 50 92 34 18', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Nuri Doner Kebab', 'Kebab', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 72 07', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Crousti Poulet', 'Restauration rapide', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 30 43', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Supermarché G20', 'Supermarché', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 78 03 43', 'site_obsolete', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'SERMI 2', 'Serrurerie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 91 82', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Gomes de Oliveira Antonio', 'Peinture/Bâtiment', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 78 63 49', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Joie Sucrée et Chocolatée', 'Pâtisserie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '06 95 44 72 31', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Friperie Factory', 'Friperie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '07 83 62 14 59', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Taymi Beauté', 'Institut de beauté', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '06 44 38 57 92', 'aucun_site', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'COIFF''EVRY', 'Coiffure', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 85 14', 'site_obsolete', 'import_excel', test_user_id),
        ('11111111-1111-1111-1111-111111111111', 'Boulangerie de la Gare', 'Boulangerie', 'Évry-Courcouronnes', 'Évry-Courcouronnes', '01 60 77 60 25', 'aucun_site', 'import_excel', test_user_id);
END $$;
