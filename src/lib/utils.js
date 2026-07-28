export function parseTSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  // On suppose que l'ordre des colonnes du texte fourni est :
  // Nom | Secteur | Adresse | Téléphone | Statut Web / Commentaire | Pas de site
  // Exemple: AFK Épicerie	Épicerie fine / Traiteur	36 rue Nettie Stevens, 91000	06 51 49 88 96	Aucun site web (Facebook uniquement)	Pas de site

  return lines.map(line => {
    const cols = line.split('\t');
    if (cols.length < 2) return null;
    
    let nom = cols[0]?.trim();
    let secteur = cols[1]?.trim();
    let adresse = cols[2]?.trim();
    let telephone = cols[3]?.trim();
    let commentaire_web = cols[4]?.trim();
    let statut_simplifie = cols[5]?.trim();
    
    // Nettoyage "Non trouvé"
    if (telephone?.toLowerCase() === 'non trouvé') telephone = '';
    
    // Déduction du statut web
    let statut_web = 'site_ok';
    const text_web = (commentaire_web + ' ' + statut_simplifie).toLowerCase();
    
    if (text_web.includes('aucun') || text_web.includes('pas de site')) {
      statut_web = 'aucun_site';
    } else if (text_web.includes('obsolète') || text_web.includes('basique') || text_web.includes('minimal')) {
      statut_web = 'site_obsolete';
    }

    return {
      nom,
      secteur,
      adresse,
      telephone,
      statut_web,
      notes: commentaire_web, // On garde le commentaire d'origine en note
      source: 'import_tsv'
    };
  }).filter(Boolean);
}
