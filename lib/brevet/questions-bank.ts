// lib/brevet/questions-bank.ts
// Banque de questions ouvertes — format DNB réel (métropole, série générale)
// Les corrigés et critères ne sont JAMAIS envoyés au client.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BankDocument {
  titre: string
  contenu: string
  type: 'texte' | 'tableau' | 'graphique' | 'image' | 'donnees'
}

/** Question complète — côté serveur uniquement */
export interface FullBankQuestion {
  id: string
  matiere: 'Mathématiques' | 'Français' | 'Histoire-Géographie' | 'Physique-Chimie' | 'Sciences de la vie et de la Terre' | 'EMC'
  theme: string
  annee: number
  source: string
  documents?: BankDocument[]
  question: string
  corrige: string      // jamais envoyé au client
  criteres: string[]   // critères binaires pour la notation par Claude
}

/** Question tronquée — stockée en DB / envoyée au client */
export type StoredQuestion = Omit<FullBankQuestion, 'corrige' | 'criteres'>

/** Sujet de rédaction */
export interface RedactionSubject {
  id: string
  annee: number
  type: 'imagination' | 'reflexion'
  texteSupport?: string   // titre du texte de l'épreuve de compréhension
  contexte?: string       // rappel narratif pour les sujets d'imagination
  consigne: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MATHÉMATIQUES — 15 questions, on pioche 3
// ─────────────────────────────────────────────────────────────────────────────

const MATHS_QUESTIONS: FullBankQuestion[] = [
  {
    id: 'mat_hard_01',
    matiere: 'Mathématiques',
    theme: 'Calcul littéral — développement et factorisation',
    annee: 2025,
    source: 'DNB Métropole — Exercice de calcul littéral',
    question: `Soit l'expression E = (3x − 2)² − (3x − 2)(x + 1).\n1. Développer et réduire E.\n2. Factoriser E en utilisant la substitution k = 3x − 2.`,
    corrige: `1. (3x−2)² = 9x²−12x+4 ; (3x−2)(x+1) = 3x²+3x−2x−2 = 3x²+x−2.\nE = 9x²−12x+4 − (3x²+x−2) = 6x²−13x+6.\n2. E = (3x−2)[(3x−2)−(x+1)] = (3x−2)(2x−3).`,
    criteres: [
      'La forme développée réduite est 6x²−13x+6',
      'La forme factorisée est (3x−2)(2x−3)',
    ],
  },
  {
    id: 'mat_hard_02',
    matiere: 'Mathématiques',
    theme: 'Équation du premier degré — avec développement',
    annee: 2024,
    source: 'DNB Métropole — Résolution d\'équation',
    question: `Résoudre l'équation suivante en détaillant toutes les étapes :\n5(2x − 3) − 2(x + 4) = 3x − 1`,
    corrige: `5(2x−3) − 2(x+4) = 3x−1\n10x−15 − 2x−8 = 3x−1\n8x−23 = 3x−1\n5x = 22\nx = 22/5 = 4,4`,
    criteres: [
      'Le développement est correct (10x−15−2x−8)',
      'La solution est x = 22/5 (ou 4,4)',
    ],
  },
  {
    id: 'mat_hard_03',
    matiere: 'Mathématiques',
    theme: 'Système d\'équations — problème concret',
    annee: 2025,
    source: 'DNB — Mise en équation',
    question: `Paul achète 3 stylos et 2 cahiers pour 8,50 €. Marie achète 1 stylo et 4 cahiers pour 9,50 €. On note s le prix d'un stylo et c le prix d'un cahier.\n1. Écrire un système de deux équations modélisant la situation.\n2. Résoudre ce système.\n3. Quel est le prix d'un cahier ?`,
    corrige: `1. { 3s + 2c = 8,5 ; s + 4c = 9,5 }\n2. De la 2ᵉ : s = 9,5 − 4c. En substituant : 3(9,5−4c)+2c = 8,5 → 28,5−12c+2c = 8,5 → 10c = 20 → c = 2. Puis s = 9,5−8 = 1,5.\n3. Un cahier coûte 2,00 €.`,
    criteres: [
      'Le système est correctement posé',
      'La résolution donne c = 2 € et s = 1,50 €',
    ],
  },
  {
    id: 'mat_hard_04',
    matiere: 'Mathématiques',
    theme: 'Fonctions affines',
    annee: 2024,
    source: 'DNB — Fonctions affines',
    question: `La fonction f est affine. On sait que f(2) = 7 et f(−1) = −2.\n1. Déterminer les coefficients a et b tels que f(x) = ax + b.\n2. Calculer f(5).\n3. Quel est l'antécédent de 13 par f ?`,
    corrige: `1. { 2a+b=7 ; −a+b=−2 } → soustraction : 3a=9 → a=3, b=1. Donc f(x)=3x+1.\n2. f(5)=16.\n3. 3x+1=13 → 3x=12 → x=4.`,
    criteres: [
      'f(x) = 3x + 1 est trouvée',
      "f(5) = 16 et l'antécédent de 13 est 4",
    ],
  },
  {
    id: 'mat_hard_05',
    matiere: 'Mathématiques',
    theme: 'Probabilités — événements composés',
    annee: 2025,
    source: 'DNB — Probabilités',
    question: `Un sac contient 12 billes : 5 rouges, 4 bleues et 3 vertes. On tire une bille au hasard.\n1. Calculer P(rouge).\n2. Calculer P(non bleue).\n3. Calculer P(rouge ou verte).\n4. Les événements « tirer une bille rouge » et « tirer une bille bleue » sont-ils incompatibles ? Justifier.`,
    corrige: `1. P(rouge) = 5/12.\n2. P(non bleue) = (5+3)/12 = 8/12 = 2/3.\n3. P(rouge ou verte) = (5+3)/12 = 2/3.\n4. Oui, incompatibles : une bille ne peut pas être à la fois rouge et bleue (intersection vide).`,
    criteres: [
      'P(rouge) = 5/12 et P(non bleue) = 2/3',
      "Les événements sont dits incompatibles avec justification correcte",
    ],
  },
  {
    id: 'mat_hard_06',
    matiere: 'Mathématiques',
    theme: 'Statistiques — quartiles et interprétation',
    annee: 2024,
    source: 'DNB — Statistiques',
    documents: [
      {
        titre: 'Notes de 10 élèves à un contrôle (données brutes)',
        type: 'tableau',
        contenu: `Note     |  5 |  8 |  9 | 11 | 12 | 12 | 14 | 15 | 17 | 19
Effectif |  1 |  1 |  1 |  1 |  1 |  1 |  1 |  1 |  1 |  1`,
      },
      {
        titre: 'Boîte à moustaches (à compléter)',
        type: 'image',
        contenu: '/brevet/mat_boite_moustaches.svg',
      },
    ],
    question: `En vous aidant du document D1 :\n1. Calculer la moyenne et déterminer la médiane de cette série.\n2. Enzo a eu 9. En calculant Q₁, dire s'il est dans le quart des élèves les plus en difficulté.\n(Le document D2 montre la boîte à moustaches correspondante.)`,
    corrige: `1. Somme = 122 ; moyenne = 12,2. 10 valeurs ordonnées : médiane = (12+12)/2 = 12.\n2. Première moitié : 5,8,9,11,12 → Q₁ = 9. Enzo a exactement Q₁ = 9 : il est à la limite du quart le plus en difficulté (25 % des élèves ≤ 9).`,
    criteres: [
      'Moyenne = 12,2 et médiane = 12',
      'Q₁ = 9 et conclusion sur Enzo justifiée',
    ],
  },
  {
    id: 'mat_hard_07',
    matiere: 'Mathématiques',
    theme: 'Trigonométrie — sin, cos, tan',
    annee: 2025,
    source: 'DNB — Trigonométrie',
    documents: [
      {
        titre: 'Triangle ABC rectangle en B',
        type: 'image',
        contenu: '/brevet/mat_triangle_trig.svg',
      },
    ],
    question: `Dans le triangle ABC rectangle en B, AB = 8 cm et l'angle BAC = 35°.\n(Valeurs : sin 35° ≈ 0,574 ; cos 35° ≈ 0,819 ; tan 35° ≈ 0,700)\n1. Calculer BC.\n2. Calculer AC.\n3. Vérifier le résultat par le théorème de Pythagore (arrondir à 0,1 cm).`,
    corrige: `1. tan(BAC) = BC/AB → BC = 8 × 0,700 = 5,6 cm.\n2. cos(BAC) = AB/AC → AC = 8 / 0,819 ≈ 9,8 cm.\n3. AB²+BC² = 64+31,36 = 95,36 ; AC² ≈ 9,8² = 96,04. Cohérent (arrondi).`,
    criteres: [
      'BC = 5,6 cm obtenu avec la tangente',
      'AC ≈ 9,8 cm et vérification par Pythagore tentée',
    ],
  },
  {
    id: 'mat_hard_08',
    matiere: 'Mathématiques',
    theme: 'Géométrie — losange et Pythagore',
    annee: 2023,
    source: 'DNB — Géométrie',
    documents: [
      {
        titre: 'Losange ABCD avec diagonales',
        type: 'image',
        contenu: '/brevet/mat_losange.svg',
      },
    ],
    question: `ABCD est un losange de côté 10 cm dont la grande diagonale AC mesure 16 cm. Les diagonales d'un losange se coupent perpendiculairement en leur milieu.\n1. Calculer la longueur de la petite diagonale BD. Justifier avec le théorème de Pythagore.\n2. Calculer l'aire du losange. (Rappel : Aire = (d₁ × d₂) / 2)`,
    corrige: `1. Les diagonales se coupent en O ; AO = 8. Dans AOB rectangle en O : 8² + BO² = 10² → BO² = 36 → BO = 6. Donc BD = 12 cm.\n2. Aire = (16 × 12) / 2 = 96 cm².`,
    criteres: [
      'BD = 12 cm avec justification par Pythagore',
      "L'aire est 96 cm²",
    ],
  },
  {
    id: 'mat_hard_09',
    matiere: 'Mathématiques',
    theme: 'Notation scientifique et puissances',
    annee: 2024,
    source: 'DNB — Notation scientifique',
    question: `1. Écrire 0,000 45 en notation scientifique.\n2. Calculer A = (3,6 × 10⁵) ÷ (9 × 10⁻²). Donner le résultat en notation scientifique.\n3. Comparer A à 4 × 10⁶ et conclure.`,
    corrige: `1. 0,00045 = 4,5 × 10⁻⁴.\n2. (3,6/9) × 10^(5−(−2)) = 0,4 × 10⁷ = 4 × 10⁶.\n3. A = 4 × 10⁶ ; ils sont égaux.`,
    criteres: [
      '0,00045 = 4,5 × 10⁻⁴',
      'A = 4 × 10⁶ et la comparaison est correcte',
    ],
  },
  {
    id: 'mat_hard_10',
    matiere: 'Mathématiques',
    theme: 'Volumes — cylindre et cône',
    annee: 2023,
    source: 'DNB — Volumes',
    question: `Un récipient cylindrique a un rayon r = 5 cm et une hauteur h = 12 cm. (π ≈ 3,14)\n1. Calculer le volume du cylindre.\n2. On remplit le cylindre aux 2/3. Quel volume d'eau contient-il ?\n3. On immerge un cône plein de même rayon et de hauteur 6 cm (Vcône = πr²h/3). L'eau déborde-t-elle ? Justifier avec les valeurs.`,
    corrige: `1. Vcyl = π×25×12 ≈ 942 cm³.\n2. Veau = 942×2/3 ≈ 628 cm³.\n3. Vcône = π×25×6/3 = 50π ≈ 157 cm³. Espace libre = 942−628 = 314 cm³. 157 < 314 : non, l'eau ne déborde pas.`,
    criteres: [
      'Vcyl ≈ 942 cm³ et Veau ≈ 628 cm³',
      'Vcône ≈ 157 cm³ et la conclusion (non-débordement) est justifiée',
    ],
  },
  {
    id: 'mat_hard_11',
    matiere: 'Mathématiques',
    theme: 'Calcul avec racines carrées',
    annee: 2025,
    source: 'DNB — Racines carrées',
    question: `1. Simplifier A = √75 + 2√3 − √12.\n2. Développer et simplifier B = (√3 + 2)².\n3. En déduire une valeur exacte de (√3 + 2)² sans calculatrice.`,
    corrige: `1. √75 = 5√3 ; √12 = 2√3. A = 5√3+2√3−2√3 = 5√3.\n2. (√3+2)² = 3 + 4√3 + 4 = 7 + 4√3.\n3. (√3+2)² = 7 + 4√3 (valeur exacte).`,
    criteres: [
      'A = 5√3',
      'B = (√3+2)² = 7 + 4√3 est correctement développé',
    ],
  },
  {
    id: 'mat_hard_12',
    matiere: 'Mathématiques',
    theme: 'Inéquations du premier degré',
    annee: 2024,
    source: 'DNB — Inéquations',
    question: `1. Résoudre l'inéquation : 2(3x − 1) ≥ 5x + 4.\n2. Représenter les solutions sur une droite graduée.\n3. Vérifier que x = 10 est solution et que x = 5 ne l'est pas.`,
    corrige: `1. 6x−2 ≥ 5x+4 → x ≥ 6. Solutions : [6 ; +∞[.\n2. Demi-droite fermée en 6, vers la droite.\n3. x=10 : 2(29)=58 ≥ 54 ✓ ; x=5 : 2(14)=28 ≥ 29 ? Non ✓.`,
    criteres: [
      'La solution est x ≥ 6',
      'Les vérifications pour x=10 et x=5 sont correctes',
    ],
  },
  {
    id: 'mat_hard_13',
    matiere: 'Mathématiques',
    theme: 'Pourcentages composés — piège classique',
    annee: 2023,
    source: 'DNB — Pourcentages',
    question: `Un article coûtait 200 € en janvier. En février, son prix augmente de 15 %. En avril, il subit une réduction de 15 %.\n1. Calculer le prix en février puis le prix final en avril.\n2. Expliquer pourquoi on ne retrouve pas le prix initial (200 €), même si les pourcentages sont identiques.`,
    corrige: `1. Prix février : 200 × 1,15 = 230 €. Prix avril : 230 × 0,85 = 195,50 €.\n2. La hausse de 15 % est calculée sur 200 € (+30 €), mais la baisse de 15 % est calculée sur 230 € (−34,50 €). Les bases sont différentes. Coefficient global : 1,15 × 0,85 = 0,9775 ≠ 1.`,
    criteres: [
      'Prix février = 230 € et prix final = 195,50 €',
      "L'explication sur les bases différentes (ou coefficient 0,9775) est présente",
    ],
  },
  {
    id: 'mat_hard_14',
    matiere: 'Mathématiques',
    theme: 'Géométrie analytique — repère orthogonal',
    annee: 2024,
    source: 'DNB — Repère et vecteurs',
    documents: [
      {
        titre: 'Repère orthogonal — points A, B, C, D',
        type: 'image',
        contenu: '/brevet/mat_repere_abcd.svg',
      },
    ],
    question: `Dans un repère orthogonal, on donne A(1 ; 4), B(5 ; 1), C(8 ; 5) et D(4 ; 8).\n1. Calculer les coordonnées des milieux I de [AC] et J de [BD].\n2. Que peut-on conclure sur ABCD ?\n3. Calculer AB et AD. ABCD est-il un carré ? Justifier.`,
    corrige: `1. I = (4,5 ; 4,5) ; J = (4,5 ; 4,5).\n2. I = J : diagonales de même milieu → ABCD est un parallélogramme.\n3. AB = √(16+9) = 5 ; AD = √(9+16) = 5. Côtés égaux → losange. Vecteurs AB=(4;−3) et AD=(3;4) : produit scalaire = 12−12 = 0 → perpendiculaires → rectangle. Losange et rectangle → carré.`,
    criteres: [
      'I = J = (4,5 ; 4,5) et la conclusion « parallélogramme » est donnée',
      'AB = AD = 5 et ABCD est identifié comme carré (ou rectangle + losange)',
    ],
  },
  {
    id: 'mat_hard_15',
    matiere: 'Mathématiques',
    theme: 'Durées, vitesses et proportionnalité',
    annee: 2023,
    source: 'DNB — Vitesse et durée',
    question: `Un train part à 14h18 et arrive à 17h45. La vitesse annoncée est de 160 km/h.\n1. Calculer la durée du trajet en heures décimales.\n2. Calculer la distance parcourue.\n3. En réalité, le train s'est arrêté 18 minutes dans une gare. Calculer la vitesse réelle de déplacement (arrondir à 1 km/h).`,
    corrige: `1. 17h45 − 14h18 = 3h27 = 3 + 27/60 = 3,45 h.\n2. d = 160 × 3,45 = 552 km.\n3. Temps réel = 3,45 − 18/60 = 3,45 − 0,3 = 3,15 h. v = 552/3,15 ≈ 175 km/h.`,
    criteres: [
      'Durée = 3,45 h et distance = 552 km',
      'Vitesse réelle ≈ 175 km/h',
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// FRANÇAIS — 29 questions, on pioche 5
// ─────────────────────────────────────────────────────────────────────────────

const FRANCAIS_QUESTIONS: FullBankQuestion[] = [
  // ── 2026 · Paul Fournel, « Pantoum Patate » ──────────────────────────────
  {
    id: 'fr_2026_01',
    matiere: 'Français',
    theme: 'Genre littéraire — poésie',
    annee: 2026,
    source: 'DNB Métropole 2026 — Compréhension',
    documents: [
      {
        titre: 'Paul Fournel, « Pantoum Patate », Le Bel Appétit (2015) — extrait',
        type: 'texte',
        contenu: `Tu frémis dans la graisse d'oie,
Je te salue pomme de terre
Tu mollis dans le feu de bois,
Ma nourriture débonnaire

Je te salue pomme de terre.
Patate universelle !
Ma nourriture débonnaire,
En fines frites ou en rondelles.

Patate universelle,
Je te farcis et je t'écrase,
En petits cubes et en rondelles
Que tu sois d'Amiens ou de Boise

Je te farcis et je t'écrase,
Je t'offre noix de beurre et lait,
Que tu sois d'Amiens ou de Boise
Joie du bébé, joie du gourmet.

[…]
Le monde entier en redemande,
Il t'aime vieille ou bien nouvelle.`,
      },
    ],
    question: 'À quel genre littéraire appartient ce texte ? Donnez deux éléments de justification tirés du texte.',
    corrige: 'Ce texte appartient au genre poétique (poésie). Justifications possibles : (1) il est écrit en vers ; (2) il est organisé en strophes régulières (quatrains) ; (3) il utilise des rimes ; (4) le langage est imagé et musical.',
    criteres: [
      'Le genre identifié est la poésie (ou le poème)',
      'Au moins deux éléments de justification sont donnés (vers, strophes, rimes, langage imagé…)',
    ],
  },
  {
    id: 'fr_2026_02',
    matiere: 'Français',
    theme: 'Compréhension — interlocuteur',
    annee: 2026,
    source: 'DNB Métropole 2026 — Compréhension',
    documents: [
      {
        titre: 'Paul Fournel, « Pantoum Patate » (2015) — extrait',
        type: 'texte',
        contenu: `Tu frémis dans la graisse d'oie,
Je te salue pomme de terre
[…]
Joie du bébé, joie du gourmet.
Le monde entier en redemande.`,
      },
    ],
    question: 'À qui s\'adresse le « je » dans ce texte ? Citez un vers pour justifier votre réponse.',
    corrige: 'Le « je » s\'adresse à la pomme de terre (la patate). Justification possible : « Je te salue pomme de terre » ou « Tu frémis dans la graisse d\'oie ».',
    criteres: [
      'L\'interlocuteur identifié est la pomme de terre (ou la patate)',
      'Une citation pertinente du texte est fournie',
    ],
  },
  {
    id: 'fr_2026_03',
    matiere: 'Français',
    theme: 'Compréhension — sens d\'un mot',
    annee: 2026,
    source: 'DNB Métropole 2026 — Compréhension',
    documents: [
      {
        titre: 'Paul Fournel, « Pantoum Patate » (2015) — extrait',
        type: 'texte',
        contenu: `Patate universelle !
[…]
Que tu sois d'Amiens ou de Boise
Joie du bébé, joie du gourmet.
[…]
Le monde entier en redemande,
Il t'aime vieille ou bien nouvelle.`,
      },
    ],
    question: 'Pourquoi la patate est-elle qualifiée d\'« universelle » dans ce texte ? Donnez deux raisons justifiées par des citations.',
    corrige: '(1) Elle est consommée partout dans le monde — « Que tu sois d\'Amiens ou de Boise » (France et États-Unis) / « Le monde entier en redemande ». (2) Elle convient à tous les âges et toutes les personnes — « Joie du bébé, joie du gourmet ».',
    criteres: [
      'Une première raison est identifiée (consommée partout dans le monde) avec citation',
      'Une seconde raison est identifiée (convient à tous) avec citation',
    ],
  },

  // ── 2025 · Simone de Beauvoir, La Force de l'âge ─────────────────────────
  {
    id: 'fr_2025_01',
    matiere: 'Français',
    theme: 'Compréhension — intention du personnage',
    annee: 2025,
    source: 'DNB Métropole 2025 — Compréhension',
    documents: [
      {
        titre: 'Simone de Beauvoir, La Force de l\'âge (1960) — extrait',
        type: 'texte',
        contenu: `La narratrice, Simone, a vingt-trois ans. Elle quitte sa ville natale, Paris, et arrive seule à Marseille.

Je me rappelle mon arrivée à Marseille comme si elle avait marqué dans mon histoire un tournant absolument neuf. Ici, je n'existais pour personne ; quelque part, sous un de ces toits, j'aurais à faire quatorze heures de cours chaque semaine : rien d'autre n'était prévu pour moi, pas même le lit où je dormirais ; mes occupations, mes habitudes, mes plaisirs, c'était à moi de les inventer.

Deux heures plus tard, j'avais rendu visite à la directrice du lycée, mon emploi du temps était fixé ; sans connaître Marseille, déjà j'y habitais.`,
      },
    ],
    question: 'Que vient faire la narratrice à Marseille ? Justifiez votre réponse par deux citations du texte.',
    corrige: 'La narratrice vient travailler comme professeure à Marseille. Citations possibles : « quatorze heures de cours chaque semaine » / « j\'avais rendu visite à la directrice du lycée, mon emploi du temps était fixé ».',
    criteres: [
      'La réponse identifie que la narratrice vient travailler (comme professeure)',
      'Deux citations pertinentes sont fournies',
    ],
  },
  {
    id: 'fr_2025_02',
    matiere: 'Français',
    theme: 'Compréhension — indices de rupture',
    annee: 2025,
    source: 'DNB Métropole 2025 — Compréhension',
    documents: [
      {
        titre: 'Simone de Beauvoir, La Force de l\'âge (1960) — extrait',
        type: 'texte',
        contenu: `Jusqu'alors, j'avais dépendu étroitement d'autrui ; on m'avait imposé des cadres et des buts. Ici, je n'existais pour personne ; rien d'autre n'était prévu pour moi, pas même le lit où je dormirais ; mes occupations, mes habitudes, mes plaisirs, c'était à moi de les inventer.`,
      },
    ],
    question: 'Citez deux éléments du texte qui montrent qu\'une vie nouvelle commence pour la narratrice.',
    corrige: '(1) « je n\'existais pour personne » — elle repart de zéro. (2) « pas même le lit où je dormirais » / « mes occupations, mes habitudes, mes plaisirs, c\'était à moi de les inventer » — elle doit tout construire seule.',
    criteres: [
      'Un premier élément pertinent est cité avec une référence au texte',
      'Un second élément pertinent est cité avec une référence au texte',
    ],
  },
  {
    id: 'fr_2025_03',
    matiere: 'Français',
    theme: 'Procédés d\'écriture — accumulation',
    annee: 2025,
    source: 'DNB Métropole 2025 — Compréhension',
    documents: [
      {
        titre: 'Simone de Beauvoir, La Force de l\'âge (1960) — extrait',
        type: 'texte',
        contenu: `J'eus le coup de foudre. Je grimpai sur toutes ses rocailles, je rôdai dans toutes ses ruelles, je respirai le goudron et les oursins du Vieux-Port, je me mêlai aux foules de la Canebière, je m'assis dans des allées, dans des jardins, sur des cours paisibles où la provinciale odeur des feuilles mortes étouffait celle du vent marin.`,
      },
    ],
    question: 'Quel procédé d\'écriture l\'auteure utilise-t-elle dans ce passage pour exprimer son émerveillement pour Marseille ? Nommez-le et expliquez l\'effet produit.',
    corrige: 'L\'auteure utilise une énumération (ou accumulation / anaphore avec « je »). Effet : ce procédé traduit l\'énergie, l\'enthousiasme et l\'avidité de la narratrice qui explore Marseille en tous sens, sans s\'arrêter.',
    criteres: [
      'Le procédé est correctement identifié (énumération, accumulation ou anaphore)',
      'L\'effet est expliqué (énergie, enthousiasme, découverte active…)',
    ],
  },
  {
    id: 'fr_2025_gram',
    matiere: 'Français',
    theme: 'Grammaire — classe grammaticale et accord',
    annee: 2025,
    source: 'DNB Métropole 2025 — Grammaire',
    documents: [
      {
        titre: 'Phrase extraite de La Force de l\'âge (1960)',
        type: 'texte',
        contenu: '« J\'étais là, seule, les mains vides, séparée de mon passé et de tout ce que j\'aimais. »',
      },
    ],
    question: 'Quelle est la classe grammaticale du mot « seule » dans cette phrase ? Justifiez la terminaison de ce mot.',
    corrige: '« Seule » est un adjectif qualificatif (épithète détachée, attribut du sujet « je »). La terminaison -e est due à l\'accord avec le sujet « je » qui désigne la narratrice, une femme.',
    criteres: [
      'La classe grammaticale est correctement identifiée (adjectif qualificatif)',
      'L\'accord (féminin singulier, accord avec « je » féminin) est justifié',
    ],
  },


  // ── 2024 · Marc Dugain, La chambre des officiers ─────────────────────────
  {
    id: 'fr_2024_01',
    matiere: 'Français',
    theme: 'Compréhension — personnages',
    annee: 2024,
    source: 'DNB Métropole 2024 — Compréhension',
    documents: [
      {
        titre: 'Marc Dugain, La chambre des officiers (1999) — extrait',
        type: 'texte',
        contenu: `Adrien Fournier, le narrateur, et ses deux amis, Penanster et Weil, sont trois officiers gravement blessés au visage durant la Première Guerre mondiale. Ils sont soignés à l'hôpital du Val-de-Grâce.

Nos blessures ne pouvaient qu'effrayer cette femme qui se réfléchissait en nous, miroirs de son infortune, mais lorsque, après des jours d'attente et de guet, elle sortit et se trouva devant Penanster, elle ne se déroba point.
— Nous formons, lui expliqua-t-il, un club d'officiers qui compte à ce jour trois membres actifs et volontiers bienfaiteurs. Nous nous sommes aperçus qu'il y manquait une femme. Voulez-vous en faire partie ?`,
      },
    ],
    question: "Qui sont les membres du « club d'officiers » ? Quelle caractéristique les unit ?",
    corrige: "Les membres sont Adrien Fournier (le narrateur), Penanster et Weil. Ce qui les unit : ils sont tous trois officiers gravement blessés au visage pendant la Première Guerre mondiale.",
    criteres: [
      'Les trois membres sont identifiés (Adrien/narrateur, Penanster, Weil)',
      'La caractéristique commune est mentionnée (blessés au visage / Grande Guerre)',
    ],
  },
  {
    id: 'fr_2024_02',
    matiere: 'Français',
    theme: 'Compréhension — obstacle à la communication',
    annee: 2024,
    source: 'DNB Métropole 2024 — Compréhension',
    documents: [
      {
        titre: 'Marc Dugain, La chambre des officiers (1999) — extrait',
        type: 'texte',
        contenu: `Penanster comprit alors qu'elle était sourde et ne pouvait que lire sur les lèvres. Lui seul avait une bouche intacte, où les mots prenaient forme. Je compris aussitôt que ni Weil ni moi ne pourrions jamais nous entretenir avec elle, les mouvements de nos lèvres étaient devenus sans signification car le son des mots reconstitués tels que nous les formions ne parviendrait jamais à son oreille.`,
      },
    ],
    question: 'Pourquoi ni Weil ni Adrien ne peuvent-ils communiquer directement avec Marguerite ?',
    corrige: "Marguerite est sourde et communique en lisant sur les lèvres. Les blessures au visage de Weil et d'Adrien ont déformé leurs lèvres, rendant impossible la lecture labiale. Seul Penanster a une bouche intacte.",
    criteres: [
      'La surdité de Marguerite et sa communication par lecture labiale sont mentionnées',
      "L'impossibilité de lire sur les lèvres d'Adrien et Weil (blessures au visage) est expliquée",
    ],
  },
  {
    id: 'fr_2024_03',
    matiere: 'Français',
    theme: 'Figure de style — comparaison',
    annee: 2024,
    source: 'DNB Métropole 2024 — Compréhension',
    documents: [
      {
        titre: 'Marc Dugain, La chambre des officiers (1999)',
        type: 'texte',
        contenu: '« Elle était comme un parterre de roses saccagé par le milieu. Elle avait été touchée au nez et aux pommettes. »',
      },
    ],
    question: 'Identifiez la figure de style dans « Elle était comme un parterre de roses saccagé par le milieu » et expliquez pourquoi elle est adaptée pour décrire Marguerite.',
    corrige: "Comparaison (outil : « comme »). Elle est adaptée car Marguerite est très belle (roses) mais blessée en plein centre du visage — nez et pommettes — comme un parterre de fleurs saccagé en son milieu.",
    criteres: [
      'La figure de style est correctement identifiée (comparaison)',
      "L'adéquation de la figure au personnage est expliquée (beauté + blessure centrale)",
    ],
  },
  {
    id: 'fr_2024_04',
    matiere: 'Français',
    theme: "Compréhension — motivations d'un personnage",
    annee: 2024,
    source: 'DNB Métropole 2024 — Compréhension',
    documents: [
      {
        titre: 'Marc Dugain, La chambre des officiers (1999) — extrait',
        type: 'texte',
        contenu: `Vers la fin de 1915, on manquait d'infirmières. Marguerite s'était portée volontaire. Elle était à cette époque aussi belle qu'inutile. Son père était un orfèvre fortuné, et elle ne manquait pas de prétendants, tous réformés ou embusqués. Elle rêvait de s'éprendre d'un homme courageux.`,
      },
    ],
    question: 'Citez deux raisons pour lesquelles Marguerite souhaitait engager comme infirmière de guerre.',
    corrige: "(1) Elle se sentait inutile : « aussi belle qu'inutile ». (2) Elle désirait rencontrer un homme courageux : « Elle rêvait de s'éprendre d'un homme courageux ».",
    criteres: [
      "Première raison identifiée (sentiment d'inutilité / désir de servir) avec citation",
      'Seconde raison identifiée (désir d\'un homme courageux) avec citation',
    ],
  },

  // ── 2023 · George Sand, Histoire de ma vie ───────────────────────────────
  {
    id: 'fr_2023_01',
    matiere: 'Français',
    theme: 'Compréhension — cadre spatio-temporel',
    annee: 2023,
    source: 'DNB Métropole 2023 — Compréhension',
    documents: [
      {
        titre: 'George Sand, Histoire de ma vie (1855) — extrait',
        type: 'texte',
        contenu: `Nous avions trouvé un jeu qui passionnait nos imaginations. Il s'agissait de passer la rivière. La rivière était dessinée sur le carreau avec de la craie et faisait mille détours dans cette grande chambre. En de certains endroits elle était fort profonde, il fallait trouver l'endroit guéable et ne pas se tromper. Hippolyte s'était déjà noyé plusieurs fois, nous l'aidions à se retirer des grands trous où il tombait toujours, car il faisait le rôle du maladroit ou de l'homme ivre, et il nageait à sec sur le carreau en se débattant et en se lamentant.`,
      },
    ],
    question: 'Où se passe la scène ? Comment expliquer la présence d\'une rivière dans ce lieu ? Justifiez par une citation.',
    corrige: 'La scène se passe dans une chambre. La rivière a été dessinée à la craie sur le carrelage par les enfants pour jouer — « La rivière était dessinée sur le carreau avec de la craie ».',
    criteres: [
      'Le lieu est correctement identifié (une chambre)',
      "L'origine fictive de la rivière (dessinée à la craie) est expliquée avec une citation",
    ],
  },
  {
    id: 'fr_2023_02',
    matiere: 'Français',
    theme: 'Champ lexical du théâtre',
    annee: 2023,
    source: 'DNB Métropole 2023 — Compréhension',
    documents: [
      {
        titre: 'George Sand, Histoire de ma vie (1855) — extrait',
        type: 'texte',
        contenu: `Pour les enfants ces jeux-là sont tout un drame, toute une fiction scénique, parfois tout un roman, tout un poème. Les enfants s'appellent vous dans ces sortes de mimodrames. Ils ne croiraient pas jouer une scène s'ils se tutoyaient comme à l'ordinaire. Ils représentent toujours certains personnages. Ils ont même des dialogues très vrais et que des acteurs de profession seraient bien embarrassés d'improviser sur la scène. Tel fut le dénouement imprévu et dramatique de notre représentation, et la toile tomba sur des larmes et des cris véritables.`,
      },
    ],
    question: 'Relevez quatre mots ou expressions appartenant au champ lexical du théâtre dans cet extrait.',
    corrige: 'Parmi les réponses possibles : drame, fiction scénique, mimodrame, scène, acteurs, représentation, toile, dénouement, personnages, dialogues.',
    criteres: [
      'Au moins quatre termes du champ lexical du théâtre sont relevés',
      'Les termes retenus appartiennent effectivement au texte',
    ],
  },
  {
    id: 'fr_2023_03',
    matiere: 'Français',
    theme: 'Compréhension — illusion et réalité',
    annee: 2023,
    source: 'DNB Métropole 2023 — Compréhension',
    documents: [
      {
        titre: 'George Sand, Histoire de ma vie (1855) — extrait',
        type: 'texte',
        contenu: `Pour mon compte, il ne me fallait pas cinq minutes pour m'y plonger de si bonne foi, que je perdais la notion de la réalité, et je croyais voir les arbres, les eaux, les rochers, une vaste campagne. À peine fus-je déchaussée, que le froid du carreau me fit l'effet de l'eau véritable, et nous voilà, Ursule et moi, pataugeant dans le ruisseau.`,
      },
    ],
    question: 'Citez un exemple du texte montrant que les enfants confondent le jeu et la réalité.',
    corrige: "Exemples possibles : « le froid du carreau me fit l'effet de l'eau véritable » ; « je perdais la notion de la réalité » ; « je croyais voir les arbres, les eaux, les rochers ».",
    criteres: [
      'Un exemple précis est cité (avec une référence au texte)',
      'L\'exemple illustre bien la confusion entre jeu et réalité',
    ],
  },

  // ── Grammaire 2025 ────────────────────────────────────────────────────────
  {
    id: 'fr_gram_juxt',
    matiere: 'Français',
    theme: 'Grammaire — juxtaposition',
    annee: 2025,
    source: 'DNB Métropole 2025 — Grammaire',
    documents: [
      {
        titre: "Phrase extraite de La Force de l'âge (Simone de Beauvoir, 1960)",
        type: 'texte',
        contenu: '« j\'avais rendu visite à la directrice du lycée, mon emploi du temps était fixé »',
      },
    ],
    question: 'Identifiez les propositions dans cette phrase et précisez comment elles sont reliées.',
    corrige: "Il y a deux propositions indépendantes juxtaposées : [j'avais rendu visite à la directrice du lycée] et [mon emploi du temps était fixé]. Elles sont reliées par juxtaposition (virgule, sans conjonction).",
    criteres: [
      'Les deux propositions sont correctement identifiées',
      'Le lien est identifié comme juxtaposition (pas de conjonction)',
    ],
  },

  // ── 2022 · Jean de La Fontaine, « Le Lion et le Moucheron » ───────────────
  {
    id: 'fr_2022_01',
    matiere: 'Français',
    theme: 'Compréhension — situation d\'énonciation et réaction',
    annee: 2022,
    source: 'DNB Métropole 2022 — Compréhension',
    documents: [
      {
        titre: 'Jean de La Fontaine, « Le Lion et le Moucheron », Fables, livre II, fable 9 (1668) — vers 1 à 14',
        type: 'texte',
        contenu: `« Va-t'en, chétif insecte, excrément de la terre ! »
C'est en ces mots que le Lion
Parlait un jour au Moucheron.
L'autre lui déclara la guerre.
5 « Penses-tu, lui dit-il, que ton titre de Roi
Me fasse peur ni me soucie ?
Un bœuf est plus puissant que toi :
Je le mène à ma fantaisie. »
À peine il achevait ces mots
10 Que lui-même il sonna la charge,
Fut le Trompette et le Héros.
Dans l'abord il se met au large ;
Puis prend son temps, fond sur le cou
Du Lion, qu'il rend presque fou.

Notes : chétif = faible ; excrément de la terre = ce qui est rejeté par la terre (insulte méprisante) ; à ma fantaisie = comme je veux ; sonna la charge = annonça l'attaque ; Trompette = celui qui joue de la trompette pendant une bataille ; dans l'abord il se met au large = pour commencer, il s'éloigne ; fond = se précipite pour attaquer.`,
      },
    ],
    question: 'Vers 1 à 8 :\n1. Qui parle au vers 1 ? À qui s\'adresse-t-il ?\n2. Quelle réaction ce propos déclenche-t-il et pourquoi ?',
    corrige: `1. C'est le Lion qui parle (il est mentionné au vers 2 et sujet du verbe « Parlait » au vers 3). Il s'adresse au Moucheron (même vers).
2. Le Moucheron déclare la guerre au Lion (vers 4). Il réagit ainsi parce que le Lion s'est montré profondément méprisant : le tutoiement associé à l'impératif « Va-t'en » (vers 1) le chasse violemment, et les deux apostrophes insultantes « chétif insecte » et « excrément de la terre » visent à la fois sa faiblesse physique et sa nature jugée inférieure. Cette position de supériorité provoque sa colère.`,
    criteres: [
      'Le Lion est identifié comme locuteur et le Moucheron comme destinataire',
      'La réaction est identifiée : le Moucheron déclare la guerre',
      "Le mépris / l'insulte du Lion est donné comme cause, avec appui sur le texte",
    ],
  },
  {
    id: 'fr_2022_02',
    matiere: 'Français',
    theme: 'Compréhension — relevé et justification',
    annee: 2022,
    source: 'DNB Métropole 2022 — Compréhension',
    documents: [
      {
        titre: 'Jean de La Fontaine, « Le Lion et le Moucheron » (1668) — vers 9 à 29',
        type: 'texte',
        contenu: `À peine il achevait ces mots
10 Que lui-même il sonna la charge,
Fut le Trompette et le Héros.
Dans l'abord il se met au large ;
Puis prend son temps, fond sur le cou
Du Lion, qu'il rend presque fou.
15 Le quadrupède écume, et son œil étincelle ;
Il rugit ; on se cache, on tremble à l'environ ;
Et cette alarme universelle
Est l'ouvrage d'un Moucheron.
Un avorton de Mouche en cent lieux le harcelle :
20 Tantôt pique l'échine, et tantôt le museau,
Tantôt entre au fond du naseau.
La rage alors se trouve à son faîte montée.
L'invisible ennemi triomphe, et rit de voir
Qu'il n'est griffe ni dent en la bête irritée
25 Qui de la mettre en sang ne fasse son devoir.
Le malheureux Lion se déchire lui-même,
Fait résonner sa queue à l'entour de ses flancs,
Bat l'air, qui n'en peut mais ; et sa fureur extrême
Le fatigue, l'abat : le voilà sur les dents.

Notes : l'échine = le dos de l'animal ; à son faîte = au plus haut ; qui n'en peut mais = qui n'en peut plus.`,
      },
    ],
    question: 'Quel animal domine le combat ? Justifiez votre réponse en relevant trois expressions dans ce passage.',
    corrige: `C'est le Moucheron qui domine le combat.
Trois expressions possibles parmi : « lui-même il sonna la charge » (vers 10), qui insiste sur le fait qu'il mène le combat seul ; « Fut le Trompette et le Héros » (vers 11), qui souligne son exploit ; « L'invisible ennemi triomphe » (vers 23), qui montre sa victoire. On accepte aussi « cette alarme universelle / Est l'ouvrage d'un Moucheron » (vers 17-18), l'hyperbole « un avorton de Mouche en cent lieux le harcelle » (vers 19), ou « Le malheureux Lion se déchire lui-même » (vers 26), qui montre le Lion défait.`,
    criteres: [
      'Le Moucheron est désigné comme dominant le combat',
      'Trois expressions sont relevées dans le passage indiqué',
      'Les relevés sont pertinents (ils montrent bien la domination du Moucheron)',
    ],
  },
  {
    id: 'fr_2022_03',
    matiere: 'Français',
    theme: 'Compréhension — analyse d\'une stratégie narrative',
    annee: 2022,
    source: 'DNB Métropole 2022 — Compréhension',
    documents: [
      {
        titre: 'Jean de La Fontaine, « Le Lion et le Moucheron » (1668) — vers 12 à 29',
        type: 'texte',
        contenu: `Dans l'abord il se met au large ;
Puis prend son temps, fond sur le cou
Du Lion, qu'il rend presque fou.
15 Le quadrupède écume, et son œil étincelle ;
Il rugit ; on se cache, on tremble à l'environ ;
Et cette alarme universelle
Est l'ouvrage d'un Moucheron.
Un avorton de Mouche en cent lieux le harcelle :
20 Tantôt pique l'échine, et tantôt le museau,
Tantôt entre au fond du naseau.
La rage alors se trouve à son faîte montée.
L'invisible ennemi triomphe, et rit de voir
Qu'il n'est griffe ni dent en la bête irritée
25 Qui de la mettre en sang ne fasse son devoir.
Le malheureux Lion se déchire lui-même,
Fait résonner sa queue à l'entour de ses flancs,
Bat l'air, qui n'en peut mais ; et sa fureur extrême
Le fatigue, l'abat : le voilà sur les dents.`,
      },
    ],
    question: 'Quelle tactique est utilisée par le Moucheron aux vers 12 à 29 ? Quel en est le résultat ?',
    corrige: `Tactique : le Moucheron s'éloigne d'abord (« Dans l'abord il se met au large »), prend son temps pour préparer son attaque, puis se précipite pour piquer le cou du Lion (vers 13). Après cette attaque surprise, il pratique le harcèlement : il pique le Lion partout (« l'échine » vers 20, « le museau » vers 20, « le naseau » vers 21), rapidement et sans s'arrêter, de sorte que le Lion n'a ni le temps ni la possibilité de l'attraper. Il utilise sa rapidité et sa petite taille pour se rendre insaisissable et invisible.
Résultat : le Lion, rendu fou de rage, finit par se blesser lui-même en voulant l'atteindre (vers 24-26) et s'épuise dans un combat où il est impuissant (vers 28-29). La force du Lion est retournée contre lui-même.`,
    criteres: [
      "La tactique du harcèlement / des piqûres répétées est identifiée et appuyée sur le texte",
      "La rapidité ou la petite taille du Moucheron est présentée comme un atout",
      "Le résultat est donné : le Lion se blesse lui-même et s'épuise",
    ],
  },
  {
    id: 'fr_2022_04',
    matiere: 'Français',
    theme: 'Compréhension — reprises nominales et effet produit',
    annee: 2022,
    source: 'DNB Métropole 2022 — Compréhension',
    documents: [
      {
        titre: 'Jean de La Fontaine, « Le Lion et le Moucheron » (1668) — vers 15 à 29',
        type: 'texte',
        contenu: `15 Le quadrupède écume, et son œil étincelle ;
Il rugit ; on se cache, on tremble à l'environ ;
Et cette alarme universelle
Est l'ouvrage d'un Moucheron.
Un avorton de Mouche en cent lieux le harcelle :
20 Tantôt pique l'échine, et tantôt le museau,
Tantôt entre au fond du naseau.
La rage alors se trouve à son faîte montée.
L'invisible ennemi triomphe, et rit de voir
Qu'il n'est griffe ni dent en la bête irritée
25 Qui de la mettre en sang ne fasse son devoir.
Le malheureux Lion se déchire lui-même,
Fait résonner sa queue à l'entour de ses flancs,
Bat l'air, qui n'en peut mais ; et sa fureur extrême
Le fatigue, l'abat : le voilà sur les dents.`,
      },
    ],
    question: 'Par quels groupes nominaux le Lion est-il désigné dans ce passage ? Quel est l\'effet produit ?',
    corrige: `Relevé : « Le quadrupède » (vers 15), « la bête irritée » (vers 24), « le malheureux Lion » (vers 26).
Effet : ces reprises nominales privent le Lion de sa fonction et de son prestige de roi. Les termes « quadrupède » et « bête » le renvoient à l'anonymat de la chaîne animale ; il est rabaissé à l'état de victime impuissante. Les adjectifs « irritée » et « malheureux » soulignent ce qu'il est devenu : un corps d'animal souffrant. La figure royale se dégrade en animal impuissant, victime du Moucheron devenu tout-puissant.`,
    criteres: [
      'Les trois groupes nominaux sont relevés',
      "L'effet de dégradation / de perte du prestige royal est expliqué",
    ],
  },
  {
    id: 'fr_2022_05',
    matiere: 'Français',
    theme: 'Compréhension — retournement de situation',
    annee: 2022,
    source: 'DNB Métropole 2022 — Compréhension',
    documents: [
      {
        titre: 'Jean de La Fontaine, « Le Lion et le Moucheron » (1668) — vers 30 à 34',
        type: 'texte',
        contenu: `30 L'insecte du combat se retire avec gloire :
Comme il sonna la charge, il sonne la victoire,
Va partout l'annoncer, et rencontre en chemin
L'embuscade d'une araignée ;
Il y rencontre aussi sa fin.`,
      },
    ],
    question: 'Quel est le retournement de situation raconté par cette fin de fable ?',
    corrige: `Après avoir été le vainqueur du combat contre le Lion, le Moucheron se retrouve exactement dans la position de celui qu'il vient de vaincre : trop occupé à claironner sa victoire, il ne voit pas le danger et se fait prendre au piège de la toile d'une araignée, qui lui est fatale. Il est donc successivement vainqueur puis vaincu.`,
    criteres: [
      "Le double statut du Moucheron (vainqueur puis vaincu) est mentionné",
      "La cause de sa fin est identifiée : la toile / l'embuscade de l'araignée",
    ],
  },
  {
    id: 'fr_2022_06',
    matiere: 'Français',
    theme: 'Compréhension — la morale de la fable',
    annee: 2022,
    source: 'DNB Métropole 2022 — Compréhension',
    documents: [
      {
        titre: 'Jean de La Fontaine, « Le Lion et le Moucheron » (1668) — vers 35 à 39',
        type: 'texte',
        contenu: `35 Quelle chose par là nous peut être enseignée ?
J'en vois deux, dont l'une est qu'entre nos ennemis
Les plus à craindre sont souvent les plus petits ;
L'autre, qu'aux grands périls tel a pu se soustraire,
Qui périt pour la moindre affaire.`,
      },
    ],
    question: 'Comment comprenez-vous les deux enseignements que le fabuliste donne au lecteur ?',
    corrige: `Premier enseignement : il ne faut pas sous-estimer les plus petits ni les juger insignifiants ; l'apparence physique ne dit rien de la dangerosité réelle d'un adversaire. Le Lion, tout roi qu'il est, est vaincu par un moucheron.
Second enseignement : celui qui a échappé aux plus grands dangers peut périr d'une cause minuscule. Le Moucheron survit au combat contre le Lion mais meurt dans une simple toile d'araignée. Il faut donc rester prudent et humble, même après un triomphe.`,
    criteres: [
      "Le premier enseignement est reformulé : ne pas sous-estimer les plus petits",
      "Le second enseignement est reformulé : on peut périr d'un péril minuscule après avoir échappé aux grands",
    ],
  },
  {
    id: 'fr_2022_gram_01',
    matiere: 'Français',
    theme: 'Grammaire — fonctions COD / COI et manipulations',
    annee: 2022,
    source: 'DNB Métropole 2022 — Grammaire',
    documents: [
      {
        titre: 'Vers 4 de « Le Lion et le Moucheron » (La Fontaine, 1668)',
        type: 'texte',
        contenu: '« L\'autre lui déclara la guerre. »\n\n(Rappel du contexte : « l\'autre » désigne le Moucheron ; le pronom « lui » renvoie au Lion.)',
      },
    ],
    question: '1. Donnez la fonction précise de « lui » et de « la guerre ».\n2. Réécrivez la phrase en remplaçant le pronom « lui » par le groupe nominal auquel il renvoie.\n3. Quelles manipulations avez-vous utilisées pour identifier la fonction de « la guerre » ? Citez-en deux.',
    corrige: `1. « lui » : COI du verbe « déclara » (on accepte « complément d'objet second »). « la guerre » : COD du verbe « déclara ».
2. « L'autre déclara la guerre au Lion » (ou « au roi »).
3. Deux manipulations parmi : la pronominalisation (« il la lui déclara ») ; le déplacement ou la suppression, ici impossibles ; l'extraction (« c'est la guerre que l'autre lui déclara »). La seule question « déclara quoi ? » n'est pas acceptée comme manipulation.`,
    criteres: [
      '« lui » est identifié comme COI (ou COS) et « la guerre » comme COD',
      'La réécriture donne « au Lion » (ou « au roi »)',
      'Deux manipulations valides sont citées (pronominalisation, extraction, déplacement/suppression)',
    ],
  },
  {
    id: 'fr_2022_gram_02',
    matiere: 'Français',
    theme: 'Grammaire — subordination et formation des mots',
    annee: 2022,
    source: 'DNB Métropole 2022 — Grammaire',
    documents: [
      {
        titre: 'Vers 16 et 23 de « Le Lion et le Moucheron » (La Fontaine, 1668)',
        type: 'texte',
        contenu: 'Vers 16 : « Il rugit ; on se cache »\nVers 23 : « L\'invisible ennemi triomphe »',
      },
    ],
    question: "1. Transformez « Il rugit ; on se cache » en une phrase complexe comportant une proposition subordonnée.\n2. De quels éléments le mot « invisible » est-il composé ? Nommez-les.\n3. Donnez la définition de « invisible » en vous appuyant sur la signification de ces éléments.",
    corrige: `1. Toute phrase complexe explicitant un lien logique convient, par exemple : « Quand / Tandis qu'il rugit, on se cache » (simultanéité) ; « Il rugit si bien qu'on se cache » ou « à tel point qu'on se cache » (conséquence) ; « On se cache parce qu'il rugit » (cause). Il faut une conjonction de subordination pertinente et une construction cohérente principale/subordonnée.
2. « invisible » est formé du radical « -vis- », précédé du préfixe « in- » et suivi du suffixe « -ible ».
3. Le préfixe « in- » exprime le contraire ; le suffixe « -ible » exprime la possibilité, la capacité. « Invisible » signifie donc « qui ne peut pas être vu ».`,
    criteres: [
      'La transformation produit bien une subordonnée avec conjonction de subordination pertinente',
      'Le radical « -vis- », le préfixe « in- » et le suffixe « -ible » sont repérés ET nommés',
      "La définition s'appuie explicitement sur le sens du préfixe et du suffixe",
    ],
  },
  {
    id: 'fr_2022_gram_03',
    matiere: 'Français',
    theme: 'Grammaire — réécriture au pluriel',
    annee: 2022,
    source: 'DNB Métropole 2022 — Réécriture',
    documents: [
      {
        titre: 'Vers 26 à 29 de « Le Lion et le Moucheron » (La Fontaine, 1668)',
        type: 'texte',
        contenu: `« Le malheureux Lion se déchire lui-même,
Fait résonner sa queue à l'entour de ses flancs,
Bat l'air […] ; et sa fureur extrême
Le fatigue, l'abat »`,
      },
    ],
    question: 'Réécrivez ce passage en remplaçant « Le malheureux Lion » par « Les malheureux lions ». Faites toutes les modifications nécessaires.',
    corrige: `« Les malheureux lions se déchirent eux-mêmes,
Font résonner leur queue à l'entour de leurs flancs,
Battent l'air […] ; et leur fureur extrême
Les fatigue, les abat »

(On accepte également « leurs queues » et « leurs fureurs ».)`,
    criteres: [
      'Les verbes sont correctement mis au pluriel : se déchirent, Font, Battent',
      '« eux-mêmes » est correctement accordé',
      'Les déterminants possessifs sont au pluriel : leur/leurs queue(s), leurs flancs, leur fureur',
      'Les pronoms COD sont au pluriel : Les fatigue, les abat',
    ],
  },

  // ── 2019 · Albert Camus, « Le Premier Homme » ─────────────────────────────
  {
    id: 'fr_2019_01',
    matiere: 'Français',
    theme: 'Compréhension — repérage de l\'itératif',
    annee: 2019,
    source: 'DNB Métropole 2019 — Compréhension',
    documents: [
      {
        titre: 'Albert Camus, Le Premier Homme (1994) — lignes 1 à 12',
        type: 'texte',
        contenu: `Dans son roman Le Premier Homme, Albert Camus raconte son enfance en Algérie dans les années 1920. Il s'est représenté dans le personnage de Jacques et évoque ici les jeux qu'il partage avec ses camarades.

Tous les jours, à la saison, un marchand de frites activait son fourneau. La plupart du temps, le petit groupe n'avait même pas l'argent d'un cornet. Si par hasard l'un d'entre eux avait la pièce nécessaire, il achetait son cornet, avançait gravement vers la plage, suivi du cortège respectueux des camarades et, devant la mer, à l'ombre d'une vieille barque démantibulée, plantant ses pieds dans le sable, il se laissait tomber sur les fesses, portant d'une main son cornet bien vertical et le couvrant de l'autre pour ne perdre aucun des gros flocons croustillants. L'usage était alors qu'il offrît une frite à chacun des camarades, qui savourait religieusement l'unique friandise chaude et parfumée d'huile forte qu'il leur laissait. Puis ils regardaient le favorisé qui, gravement, savourait une à une le restant des frites. Au fond du paquet, restaient toujours des débris de frites. On suppliait le repu de bien vouloir les partager. Et la plupart du temps, sauf s'il s'agissait de Jean, il dépliait le papier gras, étalait les miettes de frites et autorisait chacun à se servir, tour à tour, d'une miette.

Note : le repu = celui qui n'a plus faim.`,
      },
    ],
    question: "1. La scène évoquée se répète plusieurs fois. Qu'est-ce qui l'indique précisément ? Deux éléments de réponse sont attendus.\n2. Pourquoi ce moment est-il particulièrement important pour les enfants ? Justifiez en vous appuyant sur le texte.",
    corrige: `1. Deux éléments parmi : les indications de fréquence « Tous les jours », « La plupart du temps » (répété), « toujours » ; l'emploi systématique de l'imparfait à valeur itérative (« activait », « achetait », « avançait », « regardaient ») ; le terme « L'usage était alors que… », qui désigne une habitude ; la tournure hypothétique « Si par hasard l'un d'entre eux… ».
2. Ce moment est important parce que les frites sont un luxe rare pour ces enfants pauvres (« le petit groupe n'avait même pas l'argent d'un cornet ») : la friandise devient précieuse. C'est aussi un rituel collectif de partage, presque sacré, qui soude le groupe — le vocabulaire est solennel et quasi religieux (« cortège respectueux », « gravement », « savourait religieusement », « l'unique friandise »). Chacun a droit à sa part, jusqu'aux miettes.`,
    criteres: [
      "Deux indices précis de répétition sont relevés (indications de fréquence, imparfait itératif, « L'usage était »)",
      'La rareté / la pauvreté est mentionnée comme raison de l\'importance du moment',
      'Le caractère de rituel collectif et de partage est identifié, avec appui sur le texte',
    ],
  },
  {
    id: 'fr_2019_02',
    matiere: 'Français',
    theme: 'Compréhension — expression du bonheur',
    annee: 2019,
    source: 'DNB Métropole 2019 — Compréhension',
    documents: [
      {
        titre: 'Albert Camus, Le Premier Homme (1994) — lignes 12 à 24',
        type: 'texte',
        contenu: `Le festin terminé, plaisir et frustration aussitôt oubliés, c'était la course vers l'extrémité ouest de la plage, sous le dur soleil, jusqu'à une maçonnerie à demi détruite qui avait dû servir de fondation à un cabanon disparu et derrière laquelle on pouvait se déshabiller. En quelques secondes, ils étaient nus, l'instant d'après dans l'eau, nageant vigoureusement et maladroitement, s'exclamant, bavant et recrachant, se défiant à des plongeons ou à qui resterait le plus longtemps sous l'eau. La mer était douce, tiède, le soleil léger maintenant sur les têtes mouillées, et la gloire de la lumière emplissait ces jeunes corps d'une joie qui les faisait crier sans arrêt. Ils régnaient sur la vie et sur la mer, et ce que le monde peut donner de plus fastueux, ils le recevaient et en usaient sans mesure, comme des seigneurs assurés de leurs richesses irremplaçables.

Note : fastueux = très luxueux.`,
      },
    ],
    question: "1. Comment l'écrivain montre-t-il que les enfants sont heureux au moment de la baignade ? Deux éléments de réponse justifiés par le texte sont attendus.\n2. Pourquoi peut-on dire qu'ils sont transformés par la baignade ?",
    corrige: `1. Deux éléments parmi : l'accumulation de participes présents et de verbes d'action qui traduit l'énergie et le mouvement (« nageant », « s'exclamant », « bavant et recrachant », « se défiant ») ; la rapidité marquée par « En quelques secondes », « l'instant d'après » ; le lexique explicite de la joie (« une joie qui les faisait crier sans arrêt ») ; la douceur des sensations (« La mer était douce, tiède », « le soleil léger ») ; l'expression « la gloire de la lumière ».
2. Ils sont transformés parce que le texte les fait passer du statut d'enfants pauvres à celui de souverains : « Ils régnaient sur la vie et sur la mer », « comme des seigneurs assurés de leurs richesses irremplaçables ». Le champ lexical de la royauté et de la richesse (« régnaient », « fastueux », « seigneurs », « richesses ») inverse leur condition réelle : privés d'argent, ils deviennent les plus riches du monde grâce à la mer et à la lumière.`,
    criteres: [
      'Deux procédés du bonheur sont relevés et justifiés par des citations',
      'Le champ lexical de la royauté / richesse est identifié',
      "L'inversion entre pauvreté réelle et richesse ressentie est expliquée",
    ],
  },
  {
    id: 'fr_2019_03',
    matiere: 'Français',
    theme: 'Compréhension — évolution du texte et chute',
    annee: 2019,
    source: 'DNB Métropole 2019 — Compréhension',
    documents: [
      {
        titre: 'Albert Camus, Le Premier Homme (1994) — lignes 24 à 33',
        type: 'texte',
        contenu: `Ils en oubliaient même l'heure, courant de la plage à la mer, séchant sur le sable l'eau salée qui les faisait visqueux, puis lavant dans la mer le sable qui les habillait de gris. Ils couraient, et les martinets avec des cris rapides commençaient de voler plus bas au-dessus des fabriques et de la plage. Le ciel, vidé de la touffeur du jour, devenait plus pur puis verdissait, la lumière se détendait et, de l'autre côté du golfe, la courbe des maisons et de la ville, noyée jusque-là dans une sorte de brume, devenait plus distincte. Il faisait encore jour, mais des lampes s'allumaient déjà en prévision du rapide crépuscule d'Afrique. Pierre, généralement, était le premier à donner le signal : « Il est tard », et aussitôt, c'était la débandade, l'adieu rapide. Jacques avec Joseph et Jean couraient vers leurs maisons sans se soucier des autres. Ils galopaient hors de souffle. La mère de Joseph avait la main leste. Quant à la grand-mère de Jacques…

Notes : martinets = oiseaux au vol rapide, qui ressemblent aux hirondelles ; touffeur = chaleur étouffante ; avoir la main leste = donner facilement des gifles, des coups.`,
      },
    ],
    question: 'Quels changements apparaissent à la fin du texte ? Développez trois éléments de réponse en vous appuyant sur des passages précis.',
    corrige: `Trois changements attendus :
1. Le changement de moment de la journée / de lumière : le jour décline (« les martinets… commençaient de voler plus bas », « Le ciel, vidé de la touffeur du jour, devenait plus pur puis verdissait », « la lumière se détendait », « des lampes s'allumaient déjà en prévision du rapide crépuscule d'Afrique »). Le paysage devient net là où il était noyé dans la brume.
2. Le changement de rythme et d'atmosphère : à la joie insouciante succède l'urgence et la dispersion (« c'était la débandade, l'adieu rapide », « Ils galopaient hors de souffle »). Le groupe soudé éclate : chacun court chez soi « sans se soucier des autres ».
3. Le retour à la réalité et à la peur : la liberté du jeu cède la place à l'autorité familiale et à la crainte de la punition (« La mère de Joseph avait la main leste. Quant à la grand-mère de Jacques… »). La phrase inachevée laisse deviner une sanction pire encore.`,
    criteres: [
      'Le changement de lumière / de moment de la journée est développé avec citation',
      "Le changement de rythme ou l'éclatement du groupe est développé avec citation",
      "Le retour à la réalité / la crainte de la punition est identifié, avec appui sur la fin du texte",
    ],
  },
  {
    id: 'fr_2019_gram_01',
    matiere: 'Français',
    theme: 'Grammaire — complément d\'objet et expansions du nom',
    annee: 2019,
    source: 'DNB Métropole 2019 — Grammaire',
    documents: [
      {
        titre: 'Lignes 7-8 de Le Premier Homme (Albert Camus, 1994)',
        type: 'texte',
        contenu: "« L'usage était alors qu'il offrît une frite à chacun des camarades, qui savourait religieusement l'unique friandise chaude et parfumée d'huile forte qu'il leur laissait. »",
      },
    ],
    question: "1. Quel est le groupe complément d'objet de « savourait » ?\n2. Pour vérifier la délimitation de ce groupe, réécrivez la phrase en le remplaçant par un pronom.\n3. Relevez deux expansions du nom « friandise » de nature grammaticale différente et précisez la nature de chacune.",
    corrige: `1. Le groupe complément d'objet est « l'unique friandise chaude et parfumée d'huile forte qu'il leur laissait ». L'adverbe « religieusement » n'en fait pas partie.
2. « L'usage était alors qu'il offrît une frite à chacun des camarades, qui la savourait religieusement. »
3. Deux expansions de nature différente parmi : « unique » ou « chaude » → adjectifs qualificatifs ; « parfumée d'huile forte » → groupe participial (participe passé employé comme adjectif) ; « qu'il leur laissait » → proposition subordonnée relative.`,
    criteres: [
      "Le groupe COD complet est relevé, sans y inclure « religieusement »",
      'La pronominalisation est correcte (« la savourait »)',
      'Deux expansions de natures différentes sont relevées ET leur nature est nommée',
    ],
  },
  {
    id: 'fr_2019_gram_02',
    matiere: 'Français',
    theme: 'Grammaire — réécriture au pluriel',
    annee: 2019,
    source: 'DNB Métropole 2019 — Réécriture',
    documents: [
      {
        titre: 'Lignes 2 à 6 de Le Premier Homme (Albert Camus, 1994)',
        type: 'texte',
        contenu: "« Si par hasard l'un d'entre eux avait la pièce nécessaire, il achetait un cornet, avançait gravement vers la plage, suivi du cortège respectueux des camarades et, […], plantant ses pieds dans le sable, il se laissait tomber sur les fesses, portant d'une main son cornet bien vertical et le couvrant de l'autre. »",
      },
    ],
    question: "Réécrivez ce passage en remplaçant « l'un d'entre eux » par « deux d'entre eux ». Faites toutes les modifications nécessaires.",
    corrige: `« Si par hasard deux d'entre eux avaient la pièce nécessaire, ils achetaient un cornet, avançaient gravement vers la plage, suivis du cortège respectueux des camarades et, […], plantant leurs pieds dans le sable, ils se laissaient tomber sur les fesses, portant d'une main leur cornet bien vertical et le couvrant de l'autre. »

(On accepte aussi « les pièces nécessaires », « deux cornets », « leurs cornets bien verticaux et les couvrant de l'autre ».)`,
    criteres: [
      'Les verbes sont au pluriel : avaient, achetaient, avançaient, se laissaient',
      'Les pronoms sujets sont au pluriel : ils',
      '« suivi » est accordé au pluriel : suivis',
      'Les déterminants possessifs sont au pluriel : leurs pieds, leur cornet',
    ],
  },
]



// ─────────────────────────────────────────────────────────────────────────────
// HISTOIRE-GÉOGRAPHIE / EMC — 32 questions, on pioche 6
// ─────────────────────────────────────────────────────────────────────────────

const HG_QUESTIONS: FullBankQuestion[] = [
  // ── 2026 · Géo — Espaces productifs ──────────────────────────────────────
  {
    id: 'hg_2026_geo_01',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces productifs — désindustrialisation',
    annee: 2026,
    source: 'DNB Métropole 2026 — Géographie',
    documents: [
      {
        titre: 'Dynamiques des espaces productifs industriels français (Charlotte Ruggeri, 2025)',
        type: 'texte',
        contenu: `Le contexte mondial inscrit la désindustrialisation et la concurrence mondiale dans de nombreuses régions, notamment les anciennes régions industrielles. Néanmoins, l'industrie ne disparaît pas, elle se recompose. En effet, dès les années 1960, l'industrie se déplace vers les littoraux (processus de littoralisation). De grandes zones industrialo-portuaires voient le jour, comme celle de Dunkerque, qui accueille l'industrie sidérurgique qui disparaît progressivement de la Lorraine. De même, les espaces frontaliers accueillent des usines, comme l'usine Toyota près de Valenciennes, témoignant d'une intégration européenne et mondiale accrue. Sans pour autant parler de réindustrialisation, les chiffres montrent une progression de l'emploi industriel en France avec 130 000 emplois créés depuis 2017.`,
      },
    ],
    question: 'Relevez dans le document une cause du déclin des espaces anciennement industrialisés.',
    corrige: 'La désindustrialisation et/ou la concurrence mondiale sont les causes du déclin des anciennes régions industrielles.',
    criteres: [
      'Une cause est correctement relevée (désindustrialisation / concurrence mondiale)',
      'La réponse s\'appuie sur le document',
    ],
  },
  {
    id: 'hg_2026_geo_02',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces productifs — nouvelles localisations',
    annee: 2026,
    source: 'DNB Métropole 2026 — Géographie',
    documents: [
      {
        titre: 'Espaces productifs industriels français (extrait)',
        type: 'texte',
        contenu: `Dès les années 1960, l'industrie se déplace vers les littoraux (processus de littoralisation). De grandes zones industrialo-portuaires voient le jour, comme Dunkerque. De même, les espaces frontaliers accueillent des usines, comme l'usine Toyota près de Valenciennes, témoignant d'une intégration européenne et mondiale accrue.`,
      },
    ],
    question: "Citez deux types d'espaces qui accueillent les nouvelles localisations des activités industrielles sur le territoire français.",
    corrige: 'Les littoraux (zones industrialo-portuaires, comme Dunkerque) et les espaces frontaliers (comme Valenciennes avec Toyota).',
    criteres: [
      'Les espaces littoraux (ou zones industrialo-portuaires) sont mentionnés',
      'Les espaces frontaliers sont mentionnés',
    ],
  },
  // ── 2026 · EMC — 11 novembre ─────────────────────────────────────────────
  {
    id: 'hg_2026_emc_01',
    matiere: 'EMC',
    theme: 'Mémoire nationale — 11 novembre',
    annee: 2026,
    source: 'DNB Métropole 2026 — EMC',
    documents: [
      {
        titre: 'Loi du 28 février 2012 fixant au 11 novembre la commémoration de tous les morts pour la France',
        type: 'texte',
        contenu: `La loi du 28 février 2012 prévoit que la journée du 11 novembre, jour anniversaire de l'armistice de 1918 et de « commémoration de la victoire et de la paix », soit aussi un jour d'hommage à l'ensemble de ceux qui sont « morts pour la France » qu'ils soient civils ou militaires, qu'ils aient péri dans des conflits actuels ou des conflits anciens. Ce texte permet notamment de rendre hommage à tous ceux qui ont péri au cours d'opérations extérieures.`,
      },
    ],
    question: 'Identifiez ce que la République commémore chaque année le 11 novembre (deux éléments de réponse attendus).',
    corrige: "(1) La victoire et la paix de 1918 (armistice de la Première Guerre mondiale). (2) L'hommage à tous les morts pour la France, civils et militaires, de tous les conflits.",
    criteres: [
      "L'armistice de 1918 / victoire et paix est mentionné",
      "L'hommage à tous les morts pour la France (civils, militaires, tous conflits) est mentionné",
    ],
  },
  {
    id: 'hg_2026_emc_02',
    matiere: 'EMC',
    theme: 'Valeurs de la République — commémoration',
    annee: 2026,
    source: 'DNB Métropole 2026 — EMC',
    documents: [
      {
        titre: 'Loi du 28 février 2012 (extrait)',
        type: 'texte',
        contenu: `La journée du 11 novembre est un jour d'hommage à l'ensemble de ceux qui sont « morts pour la France » qu'ils soient civils ou militaires, qu'ils aient péri dans des conflits actuels ou des conflits anciens.`,
      },
    ],
    question: "Nommez une valeur de la République que l'on peut associer à la journée du 11 novembre et justifiez votre réponse en 2 à 3 lignes.",
    corrige: "Valeurs possibles : la fraternité (hommage collectif) ; l'égalité (tous les morts honorés, civils comme militaires) ; la liberté (ils ont combattu pour défendre la liberté). La réponse doit relier la valeur choisie à la commémoration.",
    criteres: [
      'Une valeur républicaine est identifiée (liberté, égalité, fraternité)',
      'La justification établit un lien entre la valeur et le 11 novembre',
    ],
  },
  // ── 2025 · Géo — Vallée de la batterie ──────────────────────────────────
  {
    id: 'hg_2025_geo_01',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces productifs — gigafactory',
    annee: 2025,
    source: 'DNB Métropole 2025 — Géographie',
    documents: [
      {
        titre: "La région Hauts-de-France devient la « vallée de la batterie » (La Voix du Nord, 2022)",
        type: 'texte',
        contenu: `L'annonce de l'implantation à Dunkerque d'une troisième gigafactory positionne les Hauts-de-France en région leader de l'industrie automobile de demain. De Dunkerque à Douai en passant par Douvrin, notre région va accueillir les trois gigafactorys françaises, ces usines de fabrication de batteries et de leurs composants. Emmanuel Macron annonçait l'implantation de Verkor, la première gigafactory de cellules de batteries bas carbone en France. Un investissement de près de 2,5 milliards d'euros (dont 60 millions de la Région), représentant un potentiel de 2 000 emplois directs et 5 000 emplois indirects.`,
      },
    ],
    question: "Relevez un extrait du texte qui définit ce qu'est une gigafactory.",
    corrige: "« ces usines de fabrication de batteries et de leurs composants ».",
    criteres: [
      "L'extrait « ces usines de fabrication de batteries et de leurs composants » est relevé (ou reformulé fidèlement)",
    ],
  },
  {
    id: 'hg_2025_geo_02',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces productifs — acteurs',
    annee: 2025,
    source: 'DNB Métropole 2025 — Géographie',
    documents: [
      {
        titre: "La « vallée de la batterie » (La Voix du Nord, 2022) — extrait",
        type: 'texte',
        contenu: `Emmanuel Macron annonçait l'implantation de Verkor dans la zone du Grand Port maritime de Dunkerque. Un investissement de près de 2,5 milliards d'euros (dont 60 millions de la Région). L'Association régionale de l'industrie automobile (ARIA) souligne que le marché des voitures électriques ne doit pas échapper aux entreprises françaises.`,
      },
    ],
    question: "Identifiez deux types d'acteurs qui participent au développement de la « vallée de la batterie ».",
    corrige: "L'État (représenté par Emmanuel Macron), la Région Hauts-de-France (60 M€ engagés), les entreprises privées (Verkor, ARIA). Deux de ces acteurs suffisent.",
    criteres: [
      'Un premier acteur est identifié (État / pouvoir politique ou entreprise)',
      'Un second acteur distinct est identifié (Région ou autre acteur)',
    ],
  },
  // ── 2025 · EMC — Égalité femmes-hommes ───────────────────────────────────
  {
    id: 'hg_2025_emc_01',
    matiere: 'EMC',
    theme: "Égalité — valeur républicaine",
    annee: 2025,
    source: 'DNB Métropole 2025 — EMC',
    documents: [
      {
        titre: "Extrait de la Constitution de la Ve République",
        type: 'texte',
        contenu: `ARTICLE PREMIER — La France est une République indivisible, laïque, démocratique et sociale. Elle assure l'égalité devant la loi de tous les citoyens sans distinction d'origine, de race ou de religion. Elle respecte toutes les croyances. La loi favorise l'égal accès des femmes et des hommes aux mandats électoraux et fonctions électives, ainsi qu'aux responsabilités professionnelles et sociales.`,
      },
    ],
    question: "Relevez un extrait de la Constitution qui montre que l'égalité est une valeur de la République.",
    corrige: "« Elle assure l'égalité devant la loi de tous les citoyens sans distinction d'origine, de race ou de religion » ou « La loi favorise l'égal accès des femmes et des hommes… ».",
    criteres: [
      "Un extrait pertinent de la Constitution mentionnant l'égalité est relevé",
    ],
  },
  // ── 2024 · Histoire — Auschwitz ──────────────────────────────────────────
  {
    id: 'hg_2024_hist_03',
    matiere: 'Histoire-Géographie',
    theme: 'Deuxième Guerre mondiale — critique de source et témoignage',
    annee: 2024,
    source: 'DNB Métropole 2024 — Histoire',
    documents: [
      {
        titre: 'Ginette Kolinka, Retour à Birkenau (2020) — extrait',
        type: 'texte',
        contenu: `Ginette Kolinka est née en 1925 dans une famille juive. Arrêtée par la Gestapo en mars 1944, elle est déportée à Auschwitz-Birkenau.

Le soir, pour rejoindre nos baraques, nous défilons devant une rangée d'officiers. La musique militaire nous force à garder la cadence, même épuisées. Si l'une d'entre nous défaille ou sort du rang, elle est frappée.
Des heures au garde-à-vous, gelées, tremblantes, épuisées. Parfois, il y en a une qui tombe de fatigue ou de fièvre.
Prenez un pain de mie, coupez-le en cinq : une tranche de pain par personne plus une petite plaque de margarine. C'est le repas du soir, de tous les jours.`,
      },
    ],
    question: "1. Identifiez la nature de ce document et présentez son auteure.\n2. Que nous apprend ce témoignage sur les conditions de vie quotidiennes imposées aux déportées à Auschwitz-Birkenau ?",
    corrige: `1. Nature : il s'agit d'un témoignage, sous forme de mémoires (récit autobiographique publié en 2020). C'est une source directe, écrite par un témoin des faits, mais rédigée longtemps après les événements.
Auteure : Ginette Kolinka, née en 1925 dans une famille juive française. Arrêtée par la Gestapo en mars 1944, elle est déportée à Auschwitz-Birkenau. Elle a survécu et témoigne de sa déportation.

2. Le témoignage montre plusieurs aspects des conditions imposées aux déportées :
— l'humiliation et la déshumanisation organisées : le défilé quotidien devant les officiers, rythmé par la musique militaire, qui contraint des femmes épuisées à garder la cadence ;
— la violence permanente : toute défaillance est immédiatement punie de coups (« Si l'une d'entre nous défaille ou sort du rang, elle est frappée ») ;
— l'épuisement physique : des heures d'appel debout au garde-à-vous, dans le froid (« gelées, tremblantes, épuisées »), jusqu'à l'effondrement de certaines ;
— la sous-alimentation systématique : une tranche de pain de mie et un peu de margarine pour tout repas du soir, chaque jour.
Ces conditions relèvent d'un système concentrationnaire visant à briser les détenues.`,
    criteres: [
      'Le document est identifié comme un témoignage / des mémoires',
      'Ginette Kolinka est présentée (née en 1925, juive, arrêtée en 1944, déportée à Auschwitz-Birkenau)',
      'Au moins deux conditions de vie distinctes sont dégagées du texte',
      'La réponse est appuyée sur des éléments précis du témoignage',
    ],
  },
  {
    id: 'hg_2024_hist_02',
    matiere: 'Histoire-Géographie',
    theme: 'Deuxième Guerre mondiale — violence dans les camps',
    annee: 2024,
    source: 'DNB Métropole 2024 — Histoire',
    documents: [
      {
        titre: "Ginette Kolinka, Retour à Birkenau (2020) — extrait",
        type: 'texte',
        contenu: `Si l'une d'entre nous défaille ou sort du rang, elle est frappée. Des heures au garde-à-vous, gelées, tremblantes, épuisées. Je voudrais m'asseoir, m'écrouler, dormir, mais il faut rester debout. Parfois, il y en a une qui tombe de fatigue ou de fièvre.
Prenez un pain de mie, coupez-le en cinq : une tranche de pain par personne plus une petite plaque de margarine.`,
      },
    ],
    question: 'Relevez trois passages du texte qui montrent différentes formes de violence subies par les déportées.',
    corrige: "(1) Violence physique : « elle est frappée ». (2) Épuisement / violence des conditions : « gelées, tremblantes, épuisées », debout des heures. (3) Privation alimentaire : ration dérisoire (une tranche de pain par jour).",
    criteres: [
      'Trois formes distinctes de violence sont identifiées (physique, épuisement, malnutrition)',
      'Trois citations du texte sont fournies',
    ],
  },
  {
    id: 'hg_2024_emc_01',
    matiere: 'EMC',
    theme: 'Engagement citoyen — Service Civique',
    annee: 2024,
    source: 'DNB Métropole 2024 — EMC',
    documents: [
      {
        titre: "Témoignage de Bastien, 200 000e volontaire du Service Civique",
        type: 'texte',
        contenu: `Pourquoi vous engager ? Alors que j'étais bénévole aux Restos du Cœur, on m'a parlé du Service Civique. J'ai tout de suite été séduit par la démarche d'utilité publique et d'intérêt général.
En quoi consiste votre mission ? Il s'agit d'une mission dans les parcs de la commune d'Avignon, avec un large volet de prévention et de sensibilisation des usagers à l'environnement.`,
      },
    ],
    question: "Identifiez les deux expériences d'engagement de Bastien.",
    corrige: "(1) Bénévolat aux Restos du Cœur. (2) Mission de Service Civique dans les parcs d'Avignon (sensibilisation à l'environnement).",
    criteres: [
      'Le bénévolat aux Restos du Cœur est identifié',
      "La mission Service Civique (parcs d'Avignon / environnement) est identifiée",
    ],
  },
  // ── 2023 · Histoire — Lettres de poilus ──────────────────────────────────
  {
    id: 'hg_2023_hist_03',
    matiere: 'Histoire-Géographie',
    theme: 'Première Guerre mondiale — critique de source et contexte',
    annee: 2023,
    source: 'DNB Métropole 2023 — Histoire',
    documents: [
      {
        titre: "Lettres de Félix Delaurat — Archives départementales de l'Allier",
        type: 'texte',
        contenu: `Félix Delaurat, cultivateur dans l'Allier, est mobilisé dès le 2 août 1914. Il entretient avec son épouse Angeline une correspondance suivie jusqu'à son retour en 1919.

Le 4 mai 1916 — Il y a toujours des boches avec des canons. Voilà douze jours que nous sommes là, c'est un vrai enfer. Malgré cela, je suis toujours en bonne santé et on finit par s'habituer à tout.

Le 12 décembre 1916 — La tristesse s'empare de nous tous. Que faisons-nous ici loin de nos familles puisque nos efforts sont nuls ! Nous sommes des martyrs ! Car si la guerre continue dans ces conditions, c'est des assassinats !

Note : « boches » est un terme péjoratif utilisé par les soldats français pour désigner les Allemands.`,
      },
    ],
    question: "1. Présentez l'auteur de ces lettres et précisez la nature de ce document.\n2. En vous appuyant sur le document, précisez le contexte historique dans lequel ces lettres ont été rédigées.",
    corrige: `1. Auteur : Félix Delaurat, cultivateur dans le département de l'Allier, mobilisé dès le 2 août 1914, c'est-à-dire dès le début de la guerre. Il combat jusqu'en 1919. Il s'agit donc d'un simple soldat, un « poilu », et non d'un officier ou d'un responsable politique.
Nature : ce sont des lettres, une correspondance privée adressée à son épouse Angeline, conservée aux Archives départementales de l'Allier. C'est une source directe et personnelle, écrite au moment même des faits.

2. Contexte : la Première Guerre mondiale (1914-1918). Les deux lettres datent de 1916, année de la bataille de Verdun et de la Somme, marquée par des combats d'une violence extrême. Le document évoque la guerre de position : Félix Delaurat est face aux Allemands (« des boches avec des canons »), immobilisé au même endroit depuis douze jours dans des conditions décrites comme « un vrai enfer ». C'est la guerre des tranchées, avec l'omniprésence de l'artillerie, l'éloignement des familles et une durée du conflit qui use le moral des combattants.`,
    criteres: [
      "Félix Delaurat est présenté (cultivateur de l'Allier, mobilisé en août 1914, simple soldat)",
      'Le document est identifié comme une correspondance privée / des lettres',
      'La Première Guerre mondiale est identifiée et située (1914-1918, lettres de 1916)',
      'Au moins un élément de contexte est tiré du document (guerre de position, artillerie, durée, éloignement)',
    ],
  },
  {
    id: 'hg_2023_hist_02',
    matiere: 'Histoire-Géographie',
    theme: "Première Guerre mondiale — évolution de l'état d'esprit",
    annee: 2023,
    source: 'DNB Métropole 2023 — Histoire',
    documents: [
      {
        titre: "Lettres de Félix Delaurat (1916) — extraits",
        type: 'texte',
        contenu: `Mai 1916 : « on finit par s'habituer à tout. »
Décembre 1916 : « La tristesse s'empare de nous tous. Nous sommes des martyrs ! Car si la guerre continue dans ces conditions, c'est des assassinats ! »`,
      },
    ],
    question: "Montrez que l'état d'esprit de Félix Delaurat change au fil de ses lettres. Utilisez des citations.",
    corrige: "En mai 1916, il garde un certain moral : « on finit par s'habituer à tout ». En décembre 1916, il exprime désespoir et révolte : « tristesse », « martyrs », « assassinats ». L'évolution montre une dégradation progressive du moral.",
    criteres: [
      "L'évolution (positive vers négative) de l'état d'esprit est montrée",
      'Des citations des deux périodes (mai et décembre 1916) sont utilisées',
    ],
  },
  {
    id: 'hg_2023_emc_01',
    matiere: 'EMC',
    theme: 'Citoyenneté — motivations pour voter',
    annee: 2023,
    source: 'DNB Métropole 2023 — EMC',
    documents: [
      {
        titre: 'Article sur les jeunes électeurs (Le Télégramme, avril 2022)',
        type: 'texte',
        contenu: `À Kerfourn, Léo, 18 ans, a voté pour la première fois à la présidentielle. « C'est un droit et un devoir important, ça prouve qu'on existe et qu'on peut décider de l'avenir commun. J'ai lu deux fois les professions de foi de tous les candidats et j'ai fait seul mon choix. »`,
      },
    ],
    question: 'Citez deux motivations qui ont poussé ce jeune citoyen à voter.',
    corrige: "(1) « C'est un droit et un devoir important ». (2) « Ça prouve qu'on existe et qu'on peut décider de l'avenir commun ».",
    criteres: [
      'La première motivation est identifiée (droit et devoir civique)',
      'La seconde motivation est identifiée (participation aux décisions collectives)',
    ],
  },
  {
    id: 'hg_2023_emc_02',
    matiere: 'EMC',
    theme: "Citoyenneté — abstention",
    annee: 2023,
    source: 'DNB Métropole 2023 — EMC',
    question: "Comment appelle-t-on le fait de ne pas aller voter lors d'une élection ?",
    corrige: "On appelle cela l'abstention.",
    criteres: ["La réponse est « l'abstention »"],
  },
  // ── 2022 · Géo — France et UE ────────────────────────────────────────────
  {
    id: 'hg_2022_geo_01',
    matiere: 'Histoire-Géographie',
    theme: "France et Union européenne — Politique de Cohésion",
    annee: 2022,
    source: 'DNB Métropole 2022 — Géographie',
    documents: [
      {
        titre: "La coopération entre les États de l'UE (Éloïse Libourel, 2017)",
        type: 'texte',
        contenu: `La Politique de Cohésion, qui vise à réduire les écarts de développement entre les régions, est la principale politique de l'Union européenne en matière territoriale. L'intégration européenne passe par le développement de la coopération entre les États membres. Cette coopération prend des formes très diverses : en matière de sécurité (Europol) ; en matière d'éducation (programme Erasmus). L'Union européenne promeut surtout la coopération interrégionale, c'est-à-dire l'interaction directe entre régions appartenant à des pays membres différents autour d'un projet commun.`,
      },
    ],
    question: "Quel est l'objectif de la Politique de Cohésion de l'Union européenne ?",
    corrige: "L'objectif est de réduire les écarts de développement entre les régions des États membres de l'UE.",
    criteres: ["La réponse mentionne la réduction des écarts de développement entre les régions"],
  },
  {
    id: 'hg_2022_geo_02',
    matiere: 'Histoire-Géographie',
    theme: "France et UE — échelles de coopération",
    annee: 2022,
    source: 'DNB Métropole 2022 — Géographie',
    documents: [
      {
        titre: "La coopération entre les États de l'UE (extrait)",
        type: 'texte',
        contenu: `Cette coopération prend des formes très diverses. En matière de sécurité, les États coopèrent autour d'accords de police (Europol). En matière d'éducation, c'est notamment le cas du programme Erasmus. L'Union européenne promeut surtout la coopération interrégionale, c'est-à-dire l'interaction directe entre régions appartenant à des pays membres différents autour d'un projet commun.`,
      },
    ],
    question: 'Quelles sont les deux échelles de coopération évoquées dans ce document ?',
    corrige: "(1) La coopération entre États membres (Europol, Erasmus). (2) La coopération interrégionale (entre régions de pays différents).",
    criteres: [
      'La coopération entre États membres est identifiée',
      'La coopération interrégionale est identifiée',
    ],
  },
  {
    id: 'hg_2022_emc_01',
    matiere: 'EMC',
    theme: 'Esprit critique — éducation aux médias',
    annee: 2022,
    source: 'DNB Métropole 2022 — EMC',
    documents: [
      {
        titre: 'Hélène Paumier, professeure de français (Le Monde, 2019)',
        type: 'texte',
        contenu: `C'est en produisant des contenus médiatiques qu'on devient un lecteur, un auditeur, un téléspectateur averti. Qui a fait de la radio une fois ne l'écoute plus jamais de la même oreille : il sait qu'un micro-trottoir est le résultat d'un choix, que l'information se vérifie et se replace dans son contexte.
Et cette leçon s'étend à d'autres situations : elle permet de comprendre qu'on ne doit pas, sur les réseaux sociaux, répercuter sans vérifier, s'indigner sans savoir qui parle.`,
      },
    ],
    question: 'Indiquez deux raisons pour lesquelles une éducation aux médias est nécessaire pour les collégiens.',
    corrige: "(1) Pour devenir un lecteur / auditeur averti, capable d'esprit critique. (2) Pour ne pas diffuser des informations non vérifiées sur les réseaux sociaux.",
    criteres: [
      "La première raison est identifiée (développer l'esprit critique)",
      'La seconde raison est identifiée (vérifier les informations avant de les partager)',
    ],
  },
  {
    id: 'hg_2022_emc_02',
    matiere: 'EMC',
    theme: "Liberté d'expression — limite légale",
    annee: 2022,
    source: 'DNB Métropole 2022 — EMC',
    documents: [
      {
        titre: "Article 11 de la Déclaration des droits de l'Homme et du Citoyen (1789)",
        type: 'texte',
        contenu: `Article 11. La libre communication des pensées et des opinions est un des droits les plus précieux de l'Homme : tout Citoyen peut donc parler, écrire, imprimer librement, sauf à répondre de l'abus de cette liberté dans les cas déterminés par la Loi.`,
      },
    ],
    question: "Nommez la valeur de la République à laquelle fait référence l'article 11 de la DDHC. Par quoi est-elle limitée dans ce même article ?",
    corrige: "L'article 11 fait référence à la liberté d'expression. Elle est limitée par la loi (responsabilité en cas d'abus).",
    criteres: [
      "La valeur identifiée est la liberté (d'expression)",
      "La limite légale est mentionnée (responsabilité / la Loi)",
    ],
  },
  // ── 2021 · Géo — Espaces ruraux ──────────────────────────────────────────
  {
    id: 'hg_2021_geo_01',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces ruraux — difficultés',
    annee: 2021,
    source: 'DNB Métropole 2021 — Géographie',
    documents: [
      {
        titre: 'Le renouveau des territoires ruraux en France (Magali Reghezza-Zitt, 2017)',
        type: 'texte',
        contenu: `Les territoires les plus isolés souffrent d'un déficit de services de plus en plus préoccupant. L'accès aux soins (« désert médical »), à l'éducation, à la culture, à l'administration et même aux services du quotidien est de plus en plus difficile. Autre enjeu majeur, la « fracture numérique », qui désigne les disparités d'accès aux technologies numériques (Internet, téléphonie mobile), renforce l'isolement et donc la fragilité de certains territoires.`,
      },
    ],
    question: 'Relevez deux difficultés que rencontrent les espaces de faible densité en France.',
    corrige: "(1) Déficit de services (déserts médicaux, accès difficile à l'éducation, à la culture). (2) Fracture numérique (inégalités d'accès à Internet et à la téléphonie mobile).",
    criteres: [
      'Une première difficulté est identifiée (déficit de services / désert médical)',
      'Une seconde difficulté est identifiée (fracture numérique)',
    ],
  },
  {
    id: 'hg_2021_geo_02',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces ruraux — tourisme',
    annee: 2021,
    source: 'DNB Métropole 2021 — Géographie',
    documents: [
      {
        titre: 'Territoires ruraux en France (extrait)',
        type: 'texte',
        contenu: `Les territoires ruraux sont désormais considérés comme « espaces de nature et d'authenticité ». Ce renversement des représentations entraîne le développement du « tourisme vert » et se traduit par la multiplication des résidences secondaires et des hébergements en gîtes ruraux ou à la ferme, par la création d'infrastructures légères (sentiers de randonnée, écomusées, etc.). La mise en tourisme permet aussi le maintien ou le développement d'autres activités : artisanat, productions agricoles, etc.`,
      },
    ],
    question: "Expliquez comment l'activité touristique dynamise les territoires ruraux en vous appuyant sur le document.",
    corrige: "Le tourisme vert entraîne la multiplication des hébergements (gîtes, fermes), la création d'infrastructures (sentiers, écomusées) et le maintien d'autres activités économiques (artisanat, agriculture).",
    criteres: [
      "Au moins deux effets du tourisme sur l'économie locale sont mentionnés",
      "La réponse s'appuie sur le document",
    ],
  },
  // ── 2018 · Histoire — La Résistance ──────────────────────────────────────
  {
    id: 'hg_2018_hist_01',
    matiere: 'Histoire-Géographie',
    theme: 'Deuxième Guerre mondiale — Résistance',
    annee: 2018,
    source: 'DNB Métropole 2018 — Histoire',
    documents: [
      {
        titre: 'Témoignage de Jean-Jacques Auduc, enfant résistant (Philippe Chapleau, 2008)',
        type: 'texte',
        contenu: `Jean-Jacques Auduc, né le 9 juillet 1931 (12 ans au moment des faits).

Mon travail était de récupérer les messages. Je venais à bicyclette. Je cachais les messages dans la pompe de mon vélo. On m'envoyait aussi dans les endroits où les adultes ne pouvaient pas aller. Les Allemands avaient positionné sur le terrain d'aviation du Mans trois escadrilles de bombardiers. On m'a envoyé avec un cerf-volant. Les gardes se sont mis à jouer avec moi. À un moment j'ai aperçu que les avions étaient en bois — c'étaient des leurres ! Il n'y avait qu'un enfant qui pouvait s'approcher sans éveiller la méfiance.

En novembre 1943, mes parents ont été arrêtés sur dénonciation.`,
      },
    ],
    question: "Présentez l'auteur de ce témoignage : qui est-il et quel âge avait-il au moment des faits ?",
    corrige: "Jean-Jacques Auduc, né le 9 juillet 1931, était un enfant résistant. Il avait 12 ans au moment des faits (en 1943).",
    criteres: [
      "Le nom de l'auteur est identifié (Jean-Jacques Auduc)",
      "Son âge (12 ans) et sa qualité (enfant résistant) sont mentionnés",
    ],
  },
  {
    id: 'hg_2018_hist_02',
    matiere: 'Histoire-Géographie',
    theme: 'Deuxième Guerre mondiale — Résistance, missions',
    annee: 2018,
    source: 'DNB Métropole 2018 — Histoire',
    documents: [
      {
        titre: 'Témoignage de Jean-Jacques Auduc (extrait)',
        type: 'texte',
        contenu: `Mon travail était de récupérer les messages que je cachais dans la pompe de mon vélo. On m'envoyait aussi dans les endroits où les adultes ne pouvaient pas aller — par exemple pour espionner un terrain d'aviation allemand. Il n'y avait qu'un enfant qui pouvait s'approcher sans éveiller la méfiance des soldats.`,
      },
    ],
    question: "Indiquez les missions confiées à Jean-Jacques Auduc et expliquez pourquoi la Résistance fait appel à lui.",
    corrige: "Missions : (1) agent de liaison (transport de messages cachés dans son vélo) ; (2) agent de renseignement (espionner des installations ennemies). La Résistance fait appel à lui car son jeune âge n'éveille pas la méfiance des soldats allemands.",
    criteres: [
      'Les deux missions sont identifiées (agent de liaison et espionnage/renseignement)',
      "La raison du recours à un enfant est expliquée (n'éveille pas la méfiance)",
    ],
  },

  // ── 2019 · Histoire — Le monde après 1989 ────────────────────────────────
  {
    id: 'hg_2019_hist_01',
    matiere: 'Histoire-Géographie',
    theme: 'Le monde après 1989 — héritage de la guerre froide',
    annee: 2019,
    source: 'DNB Amérique du Nord 2019 — Histoire',
    documents: [
      {
        titre: 'Les conséquences des attentats du 11 septembre 2001 (Le Monde, 20 mars 2005)',
        type: 'texte',
        contenu: `En montrant la vulnérabilité de l'hyperpuissance américaine et la nécessité de faire front face à la menace terroriste internationale, les attentats du 11 Septembre ont changé pour un temps l'attitude américaine.
Rompant avec l'unilatéralisme, les États-Unis ont cherché [...] à former une coalition avec pour objectif la lutte contre le terrorisme érigé en pilier de la politique étrangère. Cette alliance incluait des ennemis d'hier dont la Chine et la Russie, désormais considérées comme des alliés, quitte à passer sous silence les violations des droits de l'homme en Chine ou la guerre en Tchétchénie. Les États-Unis ont également été amenés à s'impliquer davantage dans le conflit israélo-palestinien, et à s'engager militairement dans de nouvelles zones, principalement en Asie centrale et en Asie du sud et de l'est, mais aussi dans le Caucase. […]
La coalition qui est intervenue en Afghanistan contre le régime des talibans et Oussama Ben Laden était fort réduite. L'effort de guerre a été supporté exclusivement par les Américains. Britanniques et Français ne sont entrés en scène que tardivement dans ce conflit, avec des moyens militaires limités.

Notes : unilatéralisme = attitude qui consiste, pour une puissance, à décider seule de sa politique étrangère, sans tenir compte de l'avis des autres pays ; coalition = union momentanée d'États en vue d'une intervention politique ou militaire ; érigé en pilier = devenu central ; Tchétchénie = région russe située dans le Caucase.`,
      },
    ],
    question: "Expliquez pourquoi l'auteur de ce texte évoque la Russie parmi « les ennemis d'hier » des États-Unis.",
    corrige: `L'auteur fait référence au contexte de la guerre froide (1947-1991), période durant laquelle l'Union soviétique — dont la Russie est l'État héritier — était l'adversaire militaire, politique, idéologique et économique direct des États-Unis. Le monde était alors divisé en deux blocs rivaux : le bloc de l'Ouest, dirigé par les États-Unis, et le bloc de l'Est, dirigé par l'URSS. Après la disparition de l'URSS en 1991, cette hostilité s'est atténuée, ce qui permet en 2001 de considérer la Russie comme un allié possible dans la lutte antiterroriste.`,
    criteres: [
      'La guerre froide est identifiée comme contexte de référence',
      "L'URSS est présentée comme l'adversaire direct des États-Unis (blocs Est/Ouest)",
      "Le lien entre l'URSS d'hier et la Russie d'aujourd'hui est établi",
    ],
  },
  {
    id: 'hg_2019_hist_02',
    matiere: 'Histoire-Géographie',
    theme: 'Le monde après 1989 — le 11 septembre 2001',
    annee: 2019,
    source: 'DNB Amérique du Nord 2019 — Histoire',
    documents: [
      {
        titre: 'Les conséquences des attentats du 11 septembre 2001 (Le Monde, 20 mars 2005)',
        type: 'texte',
        contenu: `En montrant la vulnérabilité de l'hyperpuissance américaine et la nécessité de faire front face à la menace terroriste internationale, les attentats du 11 Septembre ont changé pour un temps l'attitude américaine.
Rompant avec l'unilatéralisme, les États-Unis ont cherché [...] à former une coalition avec pour objectif la lutte contre le terrorisme érigé en pilier de la politique étrangère. Cette alliance incluait des ennemis d'hier dont la Chine et la Russie, désormais considérées comme des alliés, quitte à passer sous silence les violations des droits de l'homme en Chine ou la guerre en Tchétchénie. Les États-Unis ont également été amenés à s'impliquer davantage dans le conflit israélo-palestinien, et à s'engager militairement dans de nouvelles zones, principalement en Asie centrale et en Asie du sud et de l'est, mais aussi dans le Caucase.

Notes : unilatéralisme = attitude qui consiste, pour une puissance, à décider seule de sa politique étrangère, sans tenir compte de l'avis des autres pays ; coalition = union momentanée d'États en vue d'une intervention politique ou militaire.`,
      },
    ],
    question: "Montrez comment les attentats du 11 septembre 2001 ont bouleversé les relations des États-Unis avec les autres États.",
    corrige: `Les attentats font sortir les États-Unis de leur politique d'unilatéralisme : jusque-là, ils décidaient seuls de leur politique étrangère. Ils sont désormais obligés de discuter, de tenir compte de l'avis des autres pays et de s'allier avec eux pour obtenir un soutien dans leurs interventions militaires. Cela les conduit à former une coalition antiterroriste incluant d'anciens adversaires comme la Chine et la Russie, au prix du silence sur les violations des droits de l'homme dans ces pays. Ils s'impliquent aussi davantage dans le conflit israélo-palestinien et s'engagent militairement dans de nouvelles zones (Asie centrale, Asie du Sud et de l'Est, Caucase).`,
    criteres: [
      "La rupture avec l'unilatéralisme est identifiée",
      'La formation d\'une coalition avec d\'anciens ennemis (Chine, Russie) est mentionnée',
      "Au moins une conséquence concrète est citée (silence sur les droits de l'homme, nouveaux engagements militaires, conflit israélo-palestinien)",
    ],
  },
  {
    id: 'hg_2019_geo_01',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces de faible densité — développement construit',
    annee: 2019,
    source: 'DNB Amérique du Nord 2019 — Géographie',
    question: "En vous appuyant sur des exemples vus en classe, rédigez un développement construit d'environ vingt lignes montrant que les espaces français de faible densité disposent d'atouts qu'ils mettent en valeur pour dépasser leurs contraintes.",
    corrige: `Introduction : les espaces de faible densité sont des espaces éloignés des métropoles, peu peuplés, soumis à des contraintes physiques ou historiques. Ils disposent pourtant d'atouts qu'ils valorisent.

1. Les espaces ruraux (Bourgogne, Auvergne, Dordogne) ont subi un fort exode rural et sont éloignés des grandes métropoles. Mais leur territoire moins dense est aussi moins pollué et moins urbanisé : ils développent un tourisme vert (forêt des Landes), un tourisme culturel (Morvan), et attirent les urbains en quête de calme, de nature et de gastronomie. La Dordogne, surnommée « Dordogneshire », attire de nombreux Britanniques.

2. Les espaces montagnards subissent l'altitude, la pente et le froid. Depuis les années 1960, la construction de stations de ski (Isola 2000 dans les Alpes, Saint-Lary dans les Pyrénées, La Bourboule dans le Massif central) permet un tourisme hivernal important. Un tourisme vert d'été s'y ajoute (randonnée, parapente), et des productions locales spécifiques (fromages, charcuterie) dynamisent l'économie.

3. Les littoraux peu urbanisés (littoral vendéen, aquitain), éloignés de Bordeaux ou Nantes, ont fait de leur isolement un atout : plages, campings, ports de plaisance et festivals y attirent un tourisme estival massif. Capbreton passe ainsi de 9 000 habitants en hiver à 50 000 en été.

Conclusion : ces espaces disposent d'atouts variés qui leur permettent de dépasser leurs contraintes, mais ils doivent rester vigilants face à la désertification et aux excès d'un tourisme de masse mal maîtrisé.`,
    criteres: [
      'Le devoir est organisé (introduction, développement structuré, conclusion)',
      'Au moins deux types d\'espaces de faible densité sont traités (ruraux, montagnards, littoraux)',
      'Les contraintes sont présentées (éloignement, exode rural, altitude, isolement)',
      'Des exemples précis et localisés sont mobilisés',
      'Les atouts mis en valeur sont expliqués (tourisme vert, stations, productions locales)',
    ],
  },
  // ── 2019 · EMC — Impôt et solidarité nationale ───────────────────────────
  {
    id: 'hg_2019_emc_01',
    matiere: 'EMC',
    theme: 'Solidarité nationale — impôt et progressivité',
    annee: 2019,
    source: 'DNB Amérique du Nord 2019 — EMC',
    documents: [
      {
        titre: "Cinq célibataires sans enfant payent en 2018 l'impôt sur leurs revenus de 2017",
        type: 'tableau',
        contenu: `Contribuable        | Revenus de 2017 | Impôt à payer en 2018
Paul Duchemin       |   9 000 €       |        0 €
Dominique Martin    |  27 000 €       |    2 029 €
Cristina Viala      |  40 000 €       |    5 093 €
Sophie Lefranc      |  90 000 €       |   19 515 €
Ali Abdellatifi     | 160 000 €       |   46 860 €

Source : simulation à partir du site des impôts. Jusqu'en janvier 2019, les Français payaient chaque année leurs impôts sur les revenus de l'année précédente.`,
      },
    ],
    question: "D'après ce document, pour quelle raison les Français ne paient-ils pas tous un même montant d'impôt sur le revenu ? Appuyez votre réponse sur des valeurs chiffrées du tableau.",
    corrige: `Les Français ne paient pas tous le même montant parce qu'ils ne perçoivent pas les mêmes revenus : le montant de l'impôt dépend du revenu de chacun. Plus le revenu est élevé, plus l'impôt est élevé. Ainsi Paul Duchemin, qui gagne 9 000 €, ne paie aucun impôt, tandis que Cristina Viala, qui gagne 40 000 €, paie 5 093 €, et Ali Abdellatifi, qui gagne 160 000 €, paie 46 860 €. On observe même que l'impôt augmente plus vite que le revenu : c'est un impôt progressif.`,
    criteres: [
      "La différence de revenus est identifiée comme cause de la différence d'impôt",
      'Au moins deux valeurs chiffrées du tableau sont citées',
    ],
  },
  {
    id: 'hg_2019_emc_02',
    matiere: 'EMC',
    theme: 'Solidarité nationale — État-providence',
    annee: 2019,
    source: 'DNB Amérique du Nord 2019 — EMC',
    documents: [
      {
        titre: 'La solidarité nationale (Conseil national des politiques de lutte contre la pauvreté et l\'exclusion sociale, 2014)',
        type: 'texte',
        contenu: `L'engagement de l'État en matière de solidarité remonte essentiellement au lendemain de la crise économique des années 1930 et de la Seconde Guerre mondiale. Il prend la forme de l'État-providence : l'intervention de l'État dans la vie économique et sociale apparaît nécessaire afin de lutter contre la pauvreté et les inégalités et d'assurer la cohésion nationale.
Cette prise de conscience est inscrite dans le préambule de la Constitution française de 1946 (repris par celle de 1958) qui garantit le droit au travail, la protection de la santé, l'accès à l'instruction, la sécurité matérielle. [...] Concrètement, elle est à l'origine de la création de plusieurs institutions de protection sanitaire et sociale, reposant sur des systèmes d'assurance obligatoire organisés par l'État : la sécurité sociale est créée dès 1945 ; c'est également dans les années d'après-guerre qu'est mise en place l'assurance-chômage. La solidarité nationale est notamment financée par l'impôt sur le revenu, qui repose sur une redistribution des richesses, chaque citoyen y contribuant en fonction de ses moyens.`,
      },
    ],
    question: "1. Recopiez la phrase du texte qui justifie que les Français ne payent pas tous un même montant d'impôt.\n2. Relevez trois dispositifs pouvant contribuer à lutter contre la pauvreté et les inégalités.",
    corrige: `1. « La solidarité nationale est notamment financée par l'impôt sur le revenu, qui repose sur une redistribution des richesses, chaque citoyen y contribuant en fonction de ses moyens. »
2. Trois dispositifs : la sécurité sociale (créée en 1945) ; l'assurance-chômage ; l'impôt sur le revenu. On accepte également le droit au travail, la protection de la santé, l'accès à l'instruction ou la sécurité matérielle garantis par le préambule de la Constitution de 1946.`,
    criteres: [
      'La phrase relevée est bien celle sur la contribution « en fonction de ses moyens »',
      'Trois dispositifs distincts sont relevés dans le texte',
    ],
  },
  {
    id: 'hg_2019_emc_03',
    matiere: 'EMC',
    theme: 'Égalité — impôt et lutte contre les inégalités',
    annee: 2019,
    source: 'DNB Amérique du Nord 2019 — EMC',
    documents: [
      {
        titre: "Impôt sur le revenu payé en 2018 par cinq célibataires sans enfant",
        type: 'tableau',
        contenu: `Contribuable        | Revenus de 2017 | Impôt à payer en 2018
Paul Duchemin       |   9 000 €       |        0 €
Dominique Martin    |  27 000 €       |    2 029 €
Cristina Viala      |  40 000 €       |    5 093 €
Sophie Lefranc      |  90 000 €       |   19 515 €
Ali Abdellatifi     | 160 000 €       |   46 860 €`,
      },
      {
        titre: 'La solidarité nationale (extrait)',
        type: 'texte',
        contenu: `L'intervention de l'État dans la vie économique et sociale apparaît nécessaire afin de lutter contre la pauvreté et les inégalités et d'assurer la cohésion nationale. Cette prise de conscience est inscrite dans le préambule de la Constitution française de 1946 (repris par celle de 1958) qui garantit le droit au travail, la protection de la santé, l'accès à l'instruction, la sécurité matérielle. La solidarité nationale est notamment financée par l'impôt sur le revenu, qui repose sur une redistribution des richesses, chaque citoyen y contribuant en fonction de ses moyens.`,
      },
    ],
    question: "Un de vos amis ne comprend pas pourquoi certains paient des impôts et d'autres moins ou pas du tout. Il trouve cela contraire au principe d'égalité. Expliquez-lui pourquoi l'impôt sur le revenu est au contraire un outil permettant de combattre les inégalités.",
    corrige: `Depuis la fin de la Seconde Guerre mondiale, il existe en France un système de solidarité nationale inscrit dans le préambule de la Constitution de 1946. Cette solidarité s'exerce notamment par l'impôt sur le revenu, qui permet de redistribuer les richesses du pays.
Le principe est que chacun contribue « en fonction de ses moyens » : plus les revenus sont élevés, plus la participation financière est importante. Ainsi, Cristina Viala, qui perçoit 40 000 €, paie 5 093 €, tandis que Paul Duchemin, qui ne perçoit que 9 000 €, ne paie rien, ses revenus étant trop faibles pour qu'il puisse contribuer sans compromettre ses dépenses essentielles.
L'égalité républicaine ne consiste donc pas à faire payer à tous la même somme, ce qui pénaliserait lourdement les plus pauvres, mais à demander à chacun un effort proportionné à ses ressources. L'argent collecté finance la sécurité sociale, l'assurance-chômage, l'école, la santé — des services dont bénéficient tous les citoyens, et d'abord les plus démunis. Ce sont les principes d'égalité et de fraternité qui sont ici mis en œuvre pour réduire les inégalités.`,
    criteres: [
      'Le principe de contribution selon les moyens est expliqué',
      'Au moins un exemple chiffré du tableau est mobilisé',
      "La distinction entre égalité stricte et équité / proportionnalité est faite",
      "Le lien avec les valeurs de la République (égalité, fraternité, solidarité) est établi",
    ],
  },
  // ── 2021 · Histoire et EMC ───────────────────────────────────────────────
  {
    id: 'hg_2021_hist_01',
    matiere: 'Histoire-Géographie',
    theme: 'Guerre froide — développement construit',
    annee: 2021,
    source: 'DNB Métropole 2021 — Histoire',
    question: "Rédigez un développement construit d'une vingtaine de lignes pour montrer comment les deux blocs s'affrontent durant la guerre froide. Vous pouvez prendre appui sur des exemples étudiés en classe.",
    corrige: `Introduction : après 1945, les deux vainqueurs de la Seconde Guerre mondiale, les États-Unis et l'URSS, deviennent rivaux. De 1947 à 1991, le monde se divise en deux blocs qui s'affrontent sans jamais entrer en guerre directe : c'est la guerre froide.

1. Un affrontement idéologique et politique. Le bloc de l'Ouest, dirigé par les États-Unis, défend la démocratie libérale et le capitalisme (doctrine Truman, plan Marshall en 1947). Le bloc de l'Est, dirigé par l'URSS, défend le communisme et l'économie planifiée (doctrine Jdanov, Kominform). Chaque camp cherche à étendre sa zone d'influence.

2. Un affrontement militaire indirect. Les deux blocs constituent des alliances rivales : l'OTAN en 1949, le pacte de Varsovie en 1955. Ils s'affrontent par pays interposés lors de conflits périphériques : guerre de Corée (1950-1953), guerre du Vietnam (1955-1975), guerre d'Afghanistan (1979-1989). La course aux armements nucléaires instaure un « équilibre de la terreur » qui dissuade l'affrontement direct.

3. Des crises et un symbole : Berlin. Berlin, ville divisée, cristallise la rivalité : blocus de Berlin (1948-1949) auquel les Américains répondent par un pont aérien, puis construction du mur de Berlin en 1961, qui matérialise le « rideau de fer ». La crise de Cuba en 1962 amène le monde au bord de la guerre nucléaire.

Conclusion : cet affrontement prend fin avec la chute du mur de Berlin en 1989 puis la disparition de l'URSS en 1991, laissant les États-Unis seule superpuissance.`,
    criteres: [
      'Le devoir est organisé (introduction, développement structuré, conclusion)',
      'Les deux blocs et leurs modèles idéologiques opposés sont présentés',
      'La nature indirecte de l\'affrontement est expliquée (conflits périphériques, dissuasion nucléaire)',
      'Au moins deux exemples précis et datés sont mobilisés (Berlin, Corée, Cuba, Vietnam…)',
      'Les bornes chronologiques de la guerre froide sont correctes (1947-1991)',
    ],
  },
  {
    id: 'hg_2021_geo_03',
    matiere: 'Histoire-Géographie',
    theme: 'Espaces de faible densité — accessibilité',
    annee: 2021,
    source: 'DNB Métropole 2021 — Géographie',
    documents: [
      {
        titre: 'Le renouveau des territoires ruraux en France (Magali Reghezza-Zitt, La France dans ses territoires, 2017)',
        type: 'texte',
        contenu: `Les territoires ruraux sont désormais considérés comme « espaces de nature et d'authentique », c'est-à-dire où la nature aurait été préservée de l'artificialisation de la civilisation urbaine. Ce renversement des représentations entraîne en particulier le développement du « tourisme vert » et se traduit par la multiplication des résidences secondaires et des hébergements en gîtes ruraux ou à la ferme, par la création d'infrastructures légères (sentiers de randonnée, écomusées, etc.). La mise en tourisme permet aussi le maintien ou le développement d'autres activités : artisanat, productions agricoles, etc.
Si les territoires situés à proximité des grandes villes ou des villes moyennes bénéficient d'un accès convenable aux services élémentaires, en particulier aux services publics, les territoires les plus isolés souffrent d'un déficit de services de plus en plus préoccupant, notamment lorsque les populations sont âgées et ou en situation de précarité économique et sociale. L'accès aux soins, qui s'exprime à travers l'expression de « désert médical », à l'éducation, à la culture, à l'administration et même aux services du quotidien (alimentation, bureau de poste, etc.) est de plus en plus difficile dans certains territoires peu ou très peu denses situés à l'écart des aires urbaines et des liaisons rapides. Autre enjeu majeur, la « fracture numérique », qui désigne les disparités d'accès aux technologies numériques (Internet, téléphonie mobile, etc.) et aux services qui leur sont associés, renforce l'isolement et donc la fragilité de certains territoires.

Notes : artificialisation = le fait de transformer l'espace en le rendant moins naturel et plus artificiel ; renversement des représentations = changement d'opinion sur les espaces ruraux.`,
      },
    ],
    question: "Relevez dans le texte un passage qui montre que l'accessibilité est un enjeu majeur pour les espaces de faible densité, puis expliquez en quoi cet enjeu fragilise ces territoires.",
    corrige: `Passage attendu (au choix) : « L'accès aux soins, qui s'exprime à travers l'expression de "désert médical", à l'éducation, à la culture, à l'administration et même aux services du quotidien (alimentation, bureau de poste, etc.) est de plus en plus difficile dans certains territoires peu ou très peu denses situés à l'écart des aires urbaines et des liaisons rapides. » On accepte aussi le passage sur la « fracture numérique ».

Explication : l'éloignement des aires urbaines et des liaisons rapides prive les habitants des services essentiels — santé, école, culture, administration, commerces. Ce déficit touche d'abord les populations âgées ou précaires, les moins mobiles. À cela s'ajoute la fracture numérique, qui empêche de compenser cet isolement par les services en ligne. Ce cumul renforce l'isolement, décourage l'installation de nouveaux habitants et d'activités, et alimente ainsi le déclin démographique de ces territoires.`,
    criteres: [
      "Un passage pertinent sur l'accès aux services ou la fracture numérique est relevé",
      "Le lien entre éloignement et privation de services est expliqué",
      "Au moins une conséquence sur la fragilité du territoire est développée (isolement, déclin, populations vulnérables)",
    ],
  },
  {
    id: 'hg_2021_emc_01',
    matiere: 'EMC',
    theme: 'La commune — engagement et action sociale',
    annee: 2021,
    source: 'DNB Métropole 2021 — EMC',
    documents: [
      {
        titre: 'Des politiques publiques au quotidien (d\'après le site d\'une ville)',
        type: 'texte',
        contenu: `— Le Conseil municipal des enfants a été créé en 1993 par le Conseil municipal de la ville pour l'aider en proposant des idées et des projets qui pourront être réalisés avec l'aide des services compétents de la mairie. Des écoles réparties dans des quartiers de la commune sont choisies afin de participer au Conseil municipal des enfants. Ce sont les enfants des CM2 qui participent à ces conseils. Ils élisent tous les ans les Conseillers municipaux enfants qui les représentent auprès de la commune.

— Le Centre communal d'action sociale propose un ensemble de prestations pour remédier aux situations de précarité ou de grande difficulté sociale. Selon les cas, le public y est conseillé, orienté vers les services concernés ou directement pris en charge pour bénéficier immédiatement de ses droits. Pour les personnes âgées, il permet d'accéder aux soins en résidences ou à domicile mais également à un programme de loisirs grâce aux animations qu'il organise. Pour les personnes en situation précaire, il instruit les demandes de RSA, se charge de leur accompagnement social.

Note : le Revenu de Solidarité Active (RSA) assure aux personnes sans ressources un niveau minimum de revenu qui varie selon la composition du foyer.`,
      },
    ],
    question: "1. Quel est l'objectif de la création du Conseil municipal des enfants ?\n2. Citez deux actions mises en place par le Centre communal d'action sociale de la ville.",
    corrige: `1. Le Conseil municipal des enfants a pour objectif d'aider le Conseil municipal de la ville : les enfants élus y proposent des idées et des projets qui pourront ensuite être réalisés avec l'aide des services de la mairie. Il s'agit aussi d'un apprentissage de la citoyenneté et de la représentation (les élèves de CM2 élisent chaque année leurs représentants).
2. Deux actions au choix parmi : conseiller les publics en situation de précarité et les orienter vers les services compétents ; prendre directement en charge certaines demandes pour un accès immédiat aux droits ; permettre aux personnes âgées d'accéder aux soins en résidence ou à domicile ; organiser un programme de loisirs et d'animations ; instruire les demandes de RSA ; assurer l'accompagnement social des personnes précaires.`,
    criteres: [
      "L'objectif du Conseil municipal des enfants est identifié (proposer des idées/projets à la mairie)",
      "Deux actions distinctes du CCAS sont citées à partir du document",
    ],
  },
  {
    id: 'hg_2021_emc_02',
    matiere: 'EMC',
    theme: 'Valeurs et principes de la République — République sociale',
    annee: 2021,
    source: 'DNB Métropole 2021 — EMC',
    documents: [
      {
        titre: "Missions du Centre communal d'action sociale (extrait)",
        type: 'texte',
        contenu: `Le Centre communal d'action sociale propose un ensemble de prestations pour remédier aux situations de précarité ou de grande difficulté sociale. Selon les cas, le public y est conseillé, orienté vers les services concernés ou directement pris en charge pour bénéficier immédiatement de ses droits. Pour les personnes âgées, il permet d'accéder aux soins en résidences ou à domicile mais également à un programme de loisirs grâce aux animations qu'il organise. Pour les personnes en situation précaire, il instruit les demandes de RSA, se charge de leur accompagnement social.`,
      },
      {
        titre: 'La Constitution de la Ve République (extrait)',
        type: 'texte',
        contenu: `Article premier. La France est une République indivisible, laïque, démocratique et sociale. Elle assure l'égalité devant la loi de tous les citoyens sans distinction d'origine, de race ou de religion. Elle respecte toutes les croyances.`,
      },
    ],
    question: "Expliquez quelle valeur et quel principe de la République les missions du Centre communal d'action sociale permettent de mettre en application. Justifiez votre réponse à l'aide des deux documents.",
    corrige: `Deux éléments sont attendus, une valeur ET un principe.

Valeur : l'égalité. L'article premier de la Constitution affirme que la République « assure l'égalité devant la loi de tous les citoyens ». Le CCAS y contribue en réduisant les inégalités qui risqueraient de se transformer en injustices : il fournit des aides aux plus démunis, instruit les demandes de RSA, et propose des loisirs et animations accessibles à tous, y compris aux personnes âgées. On accepte également la fraternité / solidarité.

Principe : celui d'une République sociale, également inscrit à l'article premier (« République indivisible, laïque, démocratique et sociale »). Une République sociale agit en faveur des plus défavorisés : c'est exactement la mission du CCAS, qui prend en charge les situations de précarité et permet de percevoir des aides comme le RSA.`,
    criteres: [
      "Une valeur est identifiée et nommée (égalité, ou fraternité/solidarité)",
      "Le principe de République sociale est identifié à partir de l'article premier",
      "La justification s'appuie sur des missions concrètes du CCAS",
    ],
  },
]


// ─────────────────────────────────────────────────────────────────────────────
// SCIENCES — 15 questions (PC + SVT), on pioche 3
// ─────────────────────────────────────────────────────────────────────────────

const SCIENCES_QUESTIONS: FullBankQuestion[] = [
  // ── PC 2026 — Formule 1 ───────────────────────────────────────────────────,
  // ── SVT 2026 — SMB chauves-souris ────────────────────────────────────────
  {
    id: 'sci_svt_2026_01',
    matiere: 'Sciences de la vie et de la Terre',
    theme: 'Santé des animaux — parasitisme fongique',
    annee: 2026,
    source: 'DNB Métropole 2026 — SVT',
    documents: [
      {
        titre: 'Caractéristiques du champignon P. destructans',
        type: 'texte',
        contenu: 'P. destructans est un champignon microscopique qui se transmet aux chauves-souris par contacts et se développe sur les parties du corps dépourvues de poils à des températures comprises entre 2 °C et 20 °C.',
      },
      {
        titre: 'Comparaison hibernation saine vs. atteinte du SMB',
        type: 'texte',
        contenu: "Chauve-souris saine : hiberne d'octobre à avril, rares réveils (quelques courts par saison), température corporelle en torpeur ≈ 5 °C, faible consommation d'énergie.\nChauve-souris atteinte du SMB : réveils très fréquents, température remonte à ≈ 37 °C à chaque réveil, consommation d'énergie très accrue. Elle épuise ses réserves avant la fin de l'hibernation et meurt.",
      },
    ],
    question: "Comparez les informations pour indiquer les effets du champignon P. destructans sur les chauves-souris qui hibernent. Des valeurs chiffrées sont attendues.",
    corrige: "La chauve-souris atteinte se réveille bien plus souvent. À chaque réveil sa température remonte à 37 °C (contre ≈ 5 °C en torpeur). Elle consomme ainsi beaucoup plus d'énergie et épuise ses réserves avant la fin de l'hibernation, entraînant sa mort.",
    criteres: [
      'La fréquence accrue des réveils est mentionnée avec valeurs chiffrées',
      "La conséquence (épuisement des réserves / mort) est expliquée",
    ],
  },
  // ── PC 2024 — Piscine olympique ───────────────────────────────────────────
  {
    id: 'sci_pc_2024_01',
    matiere: 'Physique-Chimie',
    theme: 'pH — inconvénients eau acide',
    annee: 2024,
    source: 'DNB Métropole 2024 — Physique-Chimie',
    documents: [
      {
        titre: 'Eau de piscine et pH (CIO)',
        type: 'texte',
        contenu: "Si le pH de l'eau tombe en dessous de 7, le confort des baigneurs n'est plus assuré (irritations de la peau et des yeux) et la durée de vie des équipements notamment métalliques est réduite.",
      },
    ],
    question: "Donnez les deux inconvénients d'une eau de piscine dont le pH est inférieur à 7.",
    corrige: "(1) Irritations de la peau et des yeux des baigneurs. (2) Réduction de la durée de vie des équipements métalliques.",
    criteres: [
      "L'irritation de la peau et/ou des yeux est mentionnée",
      'La dégradation des équipements métalliques est mentionnée',
    ],
  },
  {
    id: 'sci_pc_2024_02',
    matiere: 'Physique-Chimie',
    theme: 'pH — indicateur coloré',
    annee: 2024,
    source: 'DNB Métropole 2024 — Physique-Chimie',
    documents: [
      {
        titre: 'Zones de coloration du rouge de phénol',
        type: 'tableau',
        contenu: "Couleur jaune → pH entre 0 et 6,6 (milieu acide)\nCouleur orange → pH entre 6,6 et 8,4 (proche de la neutralité)\nCouleur rouge → pH entre 8,4 et 14 (milieu basique)",
      },
    ],
    question: "Un test au rouge de phénol donne une couleur rouge. L'eau de la piscine a-t-elle un caractère acide, basique ou neutre ? Justifiez.",
    corrige: "L'eau est basique. Le rouge de phénol est rouge pour des pH compris entre 8,4 et 14, ce qui correspond à un milieu basique (pH > 7).",
    criteres: [
      'Le caractère basique est correctement identifié',
      'La justification fait référence au tableau (pH > 8,4 → rouge → basique)',
    ],
  },
  {
    id: 'sci_pc_2024_03',
    matiere: 'Physique-Chimie',
    theme: 'Chimie — molécule, atome, ion',
    annee: 2024,
    source: 'DNB Métropole 2024 — Physique-Chimie',
    documents: [
      {
        titre: 'Équation de réaction du fer en milieu acide',
        type: 'texte',
        contenu: 'Fe + 2 H+ → Fe2+ + H2',
      },
    ],
    question: "Dans l'équation ci-dessus, citez la formule d'une molécule, celle d'un atome et celle d'un ion.",
    corrige: 'Molécule : H2 (dihydrogène). Atome : Fe (fer). Ion : H+ (ion hydrogène) ou Fe2+ (ion fer II).',
    criteres: [
      'Une molécule est correctement identifiée (H2)',
      'Un atome est correctement identifié (Fe)',
      'Un ion est correctement identifié (H+ ou Fe2+)',
    ],
  },
  // ── PC 2025 — Circuit électrique ────────────────────────────────────────
  {
    id: 'sci_pc_2025_01a',
    matiere: 'Physique-Chimie',
    theme: 'Électricité — loi d\'Ohm',
    annee: 2025,
    source: 'DNB — Électricité',
    documents: [
      {
        titre: 'Données du circuit',
        type: 'donnees',
        contenu: `Générateur : tension U = 12 V\nRésistance R₁ = 30 Ω en série avec R₂ = 10 Ω\nFormule : U = R × I`,
      },
    ],
    question: `R₁ et R₂ sont en série. Calculer la résistance totale R du circuit, puis l'intensité I du courant (loi d'Ohm).`,
    corrige: `R = R₁ + R₂ = 30 + 10 = 40 Ω. I = U/R = 12/40 = 0,3 A.`,
    criteres: [
      'R = 40 Ω',
      'I = 0,3 A',
    ],
  },
  {
    id: 'sci_pc_2025_01b',
    matiere: 'Physique-Chimie',
    theme: 'Électricité — puissance et tension',
    annee: 2025,
    source: 'DNB — Électricité',
    documents: [
      {
        titre: 'Données du circuit (I = 0,3 A)',
        type: 'donnees',
        contenu: `R₁ = 30 Ω, R₂ = 10 Ω, I = 0,3 A\nFormule : P = U × I ; U = R × I`,
      },
    ],
    question: `L'intensité dans le circuit est I = 0,3 A. Calculer la puissance dissipée par R₁, puis la tension aux bornes de R₂. Vérifier que U₁ + U₂ = 12 V.`,
    corrige: `U₁ = R₁ × I = 30 × 0,3 = 9 V ; P₁ = U₁ × I = 9 × 0,3 = 2,7 W. U₂ = R₂ × I = 10 × 0,3 = 3 V. Vérif : 9 + 3 = 12 V ✓`,
    criteres: [
      'P₁ = 2,7 W',
      'U₂ = 3 V et vérification correcte',
    ],
  },
  {
    id: 'sci_pc_2025_02',
    matiere: 'Physique-Chimie',
    theme: 'Cinématique — calcul de vitesse et d\'énergie',
    annee: 2025,
    source: 'DNB — Mouvement et énergie',
    documents: [
      {
        titre: 'Données',
        type: 'donnees',
        contenu: `Cycliste : masse totale (vélo + cycliste) m = 80 kg\nDistance parcourue d = 36 km en t = 1h30 min\nÉnergie cinétique Ec = ½mv² (v en m/s)\nÉnergie d'un repas sportif : 2 000 kJ`,
      },
    ],
    question: `1. Calculer la vitesse moyenne du cycliste en km/h puis en m/s.\n2. Calculer l'énergie cinétique Ec du cycliste à cette vitesse.\n3. Le rendement du corps humain est de 25 %. Quelle énergie chimique (en kJ) faut-il pour fournir Ec = 10 000 J ? Le repas sportif couvre-t-il cet apport ?`,
    corrige: `1. v = 36/1,5 = 24 km/h = 24 000/3600 ≈ 6,67 m/s.\n2. Ec = ½ × 80 × 6,67² ≈ ½ × 80 × 44,5 ≈ 1 778 J ≈ 1 800 J.\n3. Rendement 25 % : Echimique = Ec / 0,25 = 10 000 / 0,25 = 40 000 J = 40 kJ. Repas = 2 000 kJ >> 40 kJ : oui, le repas couvre largement cet apport.`,
    criteres: [
      'v = 24 km/h = 6,67 m/s et Ec ≈ 1 800 J corrects',
      'Echimique = 40 kJ et la conclusion sur le repas est justifiée',
    ],
  },
  // ── SVT 2023 — Phénylcétonurie ───────────────────────────────────────────
  {
    id: 'sci_svt_2023_01',
    matiere: 'Sciences de la vie et de la Terre',
    theme: 'Génétique — maladie génétique et traitement',
    annee: 2023,
    source: 'DNB Métropole 2023 — SVT',
    documents: [
      {
        titre: 'Tableau des traitements selon le taux de phénylalanine (PHE)',
        type: 'tableau',
        contenu: "PHE < 2 mg/dL → dépistage négatif → aucun traitement\n2 < PHE < 10 mg/dL → dépistage positif → suivi médical\nPHE > 10 mg/dL → dépistage positif → régime alimentaire pauvre en PHE et riche en tyrosine + suivi médical",
      },
    ],
    question: "Le patient 2 a un taux de phénylalanine de 19 mg/dL. Citez le traitement qu'il devra suivre et justifiez avec les valeurs chiffrées.",
    corrige: "Le patient 2 a un taux de 19 mg/dL, supérieur à 10 mg/dL. Il devra suivre un régime alimentaire pauvre en phénylalanine et riche en tyrosine, ainsi qu'un suivi médical.",
    criteres: [
      'Le traitement correct est identifié (régime pauvre en PHE, riche en tyrosine + suivi médical)',
      'La justification utilise les valeurs chiffrées (19 mg/dL > 10 mg/dL)',
    ],
  },
  {
    id: 'sci_svt_2023_02',
    matiere: 'Sciences de la vie et de la Terre',
    theme: 'Génétique — phénotype et enzyme',
    annee: 2023,
    source: 'DNB Métropole 2023 — SVT',
    documents: [
      {
        titre: 'Phénylcétonurie et mélanine',
        type: 'texte',
        contenu: "Chez les personnes atteintes de phénylcétonurie, l'enzyme PAH n'est pas fonctionnelle : la phénylalanine ne peut pas être transformée en tyrosine.\nLa mélanine est une molécule produite à partir de la tyrosine. Plus la concentration de mélanine est importante, plus la coloration de la peau, des cheveux et des yeux est foncée.",
      },
    ],
    question: "Expliquez le lien entre la phénylcétonurie et l'aspect très clair de la peau, des cheveux et des yeux d'un patient atteint.",
    corrige: "L'enzyme PAH est non fonctionnelle → la phénylalanine ne peut pas être transformée en tyrosine → pas de tyrosine → pas de mélanine fabriquée → la peau, les cheveux et les yeux sont très clairs.",
    criteres: [
      'La chaîne causale (PAH non fonctionnelle → pas de tyrosine → pas de mélanine) est expliquée',
      'Le lien avec la coloration claire est établi',
    ],
  },
  // ── PC 2023 — GES ─────────────────────────────────────────────────────────
  {
    id: 'sci_pc_2023_01',
    matiere: 'Physique-Chimie',
    theme: 'Chimie — gaz à effet de serre',
    annee: 2023,
    source: 'DNB Métropole 2023 — Physique-Chimie',
    documents: [
      {
        titre: 'Proportion des principaux GES dans l\'atmosphère (GIEC, 2018)',
        type: 'tableau',
        contenu: "CO2 : 0,0408 %\nCH4 : 0,0001857 %\nN2O et autres : ~0,000033 %",
      },
    ],
    question: "Identifiez le gaz à effet de serre le plus abondant dans l'atmosphère en 2018. Donnez le nom et le nombre des atomes de sa molécule.",
    corrige: "Le gaz le plus abondant est le CO2 (dioxyde de carbone) avec 0,0408 %. Une molécule de CO2 contient 1 atome de carbone (C) et 2 atomes d'oxygène (O).",
    criteres: [
      'CO2 (dioxyde de carbone) est identifié comme le plus abondant',
      'La composition atomique est correcte (1 C + 2 O)',
    ],
  },
  {
    id: 'sci_pc_2023_02',
    matiere: 'Physique-Chimie',
    theme: 'Calcul — budget carbone',
    annee: 2023,
    source: 'DNB Métropole 2023 — Physique-Chimie',
    documents: [
      {
        titre: 'Données — Accords de Paris et émissions cumulées de CO2',
        type: 'donnees',
        contenu: "Quantité totale de CO2 émise entre 1850 et 2018 : 2 400 Gt.\nLimite maximale pour rester sous +2 °C (Accords de Paris) : 3 700 Gt.\nÉmissions annuelles de CO2 en 2018, toutes sources de combustibles réunies : 37 Gt.",
        // (document enrichi : la prévision d'année nécessite les émissions annuelles)
      },
    ],
    question: "1. Calculez la quantité de CO2 que l'humanité peut encore émettre pour rester sous +2 °C.\n2. Prévoyez en quelle année cette limite sera atteinte si les émissions annuelles restent égales à celles de 2018. Détaillez votre démarche.",
    corrige: "1. Quantité restante = 3 700 - 2 400 = 1 300 Gt de CO2.\n2. Nombre d'années restantes = 1 300 / 37 ≈ 35 ans. La limite serait donc atteinte vers 2018 + 35 = 2053.",
    criteres: [
      'La soustraction est effectuée et donne 1 300 Gt',
      'La division 1 300 / 37 ≈ 35 est effectuée',
      "L'année est obtenue en ajoutant 35 à 2018, soit environ 2053",
    ],
  },
  // ── SVT 2022 — IST ────────────────────────────────────────────────────────
  {
    id: 'sci_svt_2022_01',
    matiere: 'Sciences de la vie et de la Terre',
    theme: 'Santé — modes de transmission du VIH',
    annee: 2022,
    source: 'DNB Métropole 2022 — SVT',
    documents: [
      {
        titre: 'Modes de transmission des IST (preventionsida.org)',
        type: 'tableau',
        contenu: "VIH : transmis par sperme (risque élevé), sang (risque élevé), sécrétions vaginales (risque élevé) — PAS par la salive.",
      },
    ],
    question: "D'après le document, citez deux liquides biologiques pouvant transmettre le VIH.",
    corrige: "Le VIH peut être transmis par le sperme, le sang et les sécrétions vaginales. Deux de ces trois réponses sont attendues.",
    criteres: [
      'Au moins deux liquides biologiques corrects sont cités (sperme, sang, sécrétions vaginales)',
      'La salive n\'est pas citée comme mode de transmission du VIH',
    ],
  },
  {
    id: 'sci_svt_2022_02',
    matiere: 'Sciences de la vie et de la Terre',
    theme: 'Santé — dépistage, prévention et traitement des IST',
    annee: 2022,
    source: 'DNB Métropole-Antilles septembre 2022 — SVT',
    documents: [
      {
        titre: 'La chlamydiose, une des IST les plus répandues en France (source : ameli.fr)',
        type: 'tableau',
        contenu: `Agent pathogène          : bactérie Chlamydia trachomatis

Symptômes                : douleurs en urinant ; douleurs lors des rapports sexuels ;
                           aucun symptôme dans 60 à 70 % des cas

Conséquences possibles   : à long terme chez la femme — infertilité, infection des trompes
                           utérines, douleurs chroniques dans le bas ventre, risque de
                           grossesse extra-utérine

Moyens de prévention     : dépistage (analyse d'urine ou prélèvement vaginal) ;
et de protection           utilisation du préservatif ; absence de vaccin

Traitement               : efficace par prise d'antibiotiques, en respectant quelques règles
                           pour éviter la réinfection (dépistage du partenaire, respect de la
                           durée du traitement, utilisation du préservatif)`,
      },
    ],
    question: "1. À partir du document, expliquez pourquoi la chlamydiose est une infection particulièrement difficile à repérer, et pourquoi cela la rend dangereuse.\n2. Indiquez comment une personne peut s'en protéger et comment elle peut en guérir.",
    corrige: `1. La chlamydiose est difficile à repérer parce qu'elle ne provoque aucun symptôme dans 60 à 70 % des cas : deux personnes infectées sur trois environ ne se savent pas malades. Elles ne consultent donc pas, continuent de transmettre la bactérie, et l'infection n'est pas traitée. C'est dangereux car, à long terme chez la femme, elle peut provoquer une infertilité, une infection des trompes utérines, des douleurs chroniques dans le bas ventre et un risque de grossesse extra-utérine.

2. Protection : l'utilisation du préservatif lors des rapports sexuels, et le dépistage (analyse d'urine ou prélèvement vaginal), qui permet de détecter l'infection même en l'absence de symptômes. Il n'existe pas de vaccin contre cette IST.
Guérison : la chlamydiose se traite efficacement par la prise d'antibiotiques, à condition de respecter la durée du traitement, de faire dépister son partenaire et d'utiliser un préservatif, afin d'éviter une réinfection.`,
    criteres: [
      "L'absence de symptômes dans 60 à 70 % des cas est identifiée comme cause de la difficulté de repérage",
      'Au moins une conséquence grave à long terme est citée',
      'Le préservatif et le dépistage sont cités comme moyens de protection',
      "Le traitement antibiotique est cité, avec au moins une règle pour éviter la réinfection",
    ],
  },
  // ── SVT 2021 — Séisme ─────────────────────────────────────────────────────
  {
    id: 'sci_svt_2021_01',
    matiere: 'Sciences de la vie et de la Terre',
    theme: "Géologie — intensité sismique et distance",
    annee: 2021,
    source: 'DNB Métropole 2021 — SVT',
    documents: [
      {
        titre: 'Séisme en Méditerranée (7 juillet 2011)',
        type: 'texte',
        contenu: "Un séisme de magnitude 5,2 est enregistré en Méditerranée. Il a été ressenti sur une distance de 260 km. Son intensité (échelle macrosismique I à XII) est mesurée à différentes distances depuis l'épicentre.",
      },
    ],
    question: "Comment varie l'intensité d'un séisme en fonction de la distance à l'épicentre ?",
    corrige: "L'intensité d'un séisme diminue à mesure que l'on s'éloigne de l'épicentre. Elle est maximale à l'épicentre et devient négligeable au-delà d'une certaine distance.",
    criteres: [
      "L'intensité est dite décroissante avec la distance à l'épicentre",
    ],
  },
  // ── PC 2021 — Isolation thermique ────────────────────────────────────────
  {
    id: 'sci_pc_2021_01',
    matiere: 'Physique-Chimie',
    theme: 'Énergie — isolation thermique',
    annee: 2021,
    source: 'DNB Métropole 2021 — Physique-Chimie',
    documents: [
      {
        titre: 'Conductivité thermique λ (W/m·K) de trois matériaux isolants',
        type: 'tableau',
        contenu: "Laine de verre : λ = 0,035 W/m·K\nOuate de cellulose : λ = 0,042 W/m·K\nPaille : λ = 0,045 W/m·K",
      },
    ],
    question: 'Classez ces trois matériaux du moins isolant au plus isolant. Justifiez votre classement.',
    corrige: 'Du moins isolant au plus isolant : paille (λ = 0,045) → ouate de cellulose (λ = 0,042) → laine de verre (λ = 0,035). Plus la conductivité thermique λ est faible, meilleur est l\'isolant.',
    criteres: [
      'Le classement est correct (paille → ouate de cellulose → laine de verre)',
      'La justification explique que plus λ est petit, meilleur est l\'isolant',
    ],
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// SUJETS DE RÉDACTION — 12 sujets, on pioche 1
// ─────────────────────────────────────────────────────────────────────────────

export const REDACTION_SUBJECTS: RedactionSubject[] = [
  {
    id: 'red_2026_refl',
    annee: 2026,
    type: 'reflexion',
    texteSupport: 'Pantoum Patate — Paul Fournel (2015)',
    consigne: "Selon vous, la poésie, la littérature et l'art ont-ils pour mission d'embellir le réel ? Présentez votre réflexion dans un développement argumenté et organisé. Illustrez votre propos à l'aide d'exemples issus de vos lectures et de votre culture artistique personnelle. Rédigez en une trentaine de lignes au moins.",
  },
  {
    id: 'red_2026_ima',
    annee: 2026,
    type: 'imagination',
    texteSupport: 'Pantoum Patate — Paul Fournel (2015)',
    consigne: "À votre tour, choisissez un aliment auquel vous vous adressez directement pour révéler ses qualités. Vous rédigerez ce texte dans une langue poétique, attentive aux images, aux effets de rythme et de sonorité. Rédigez en 35 lignes au moins.",
  },
  {
    id: 'red_2025_ima',
    annee: 2025,
    type: 'imagination',
    texteSupport: "La Force de l'âge — Simone de Beauvoir (1960)",
    contexte: 'La narratrice, Simone, vient d\'arriver seule à Marseille pour y travailler comme professeure de lycée.',
    consigne: "Quelque temps plus tard, la narratrice écrit une lettre à ses parents dans laquelle elle raconte les jours qui ont suivi son arrivée dans la ville. Vous décrirez les expériences vécues, les lieux explorés, les personnes rencontrées et exprimerez les impressions que lui procurent ces découvertes.",
  },
  {
    id: 'red_2025_refl',
    annee: 2025,
    type: 'reflexion',
    texteSupport: "La Force de l'âge — Simone de Beauvoir (1960)",
    consigne: "Pensez-vous que la littérature et les arts en général permettent aux lecteurs et aux spectateurs de découvrir des lieux, réels ou fictifs, comme s'ils y étaient ? Présentez votre réflexion dans un développement argumenté et organisé, illustré d'exemples issus de vos lectures et de votre culture artistique personnelle.",
  },
  {
    id: 'red_2024_ima',
    annee: 2024,
    type: 'imagination',
    texteSupport: 'La chambre des officiers — Marc Dugain (1999)',
    contexte: "Marguerite est une jeune femme courageuse qui s'est engagée comme infirmière volontaire durant la Première Guerre mondiale.",
    consigne: "Imaginez la suite du récit de Marguerite, du point de vue de la jeune femme, en utilisant la première personne et en terminant par l'accident qui a causé ses blessures. Vous mêlerez narration et description.\n\nVous commencerez ainsi : « Me voilà désormais sur le front. Je ne ressentais pas la peur, je n'en avais pas le temps. »",
  },
  {
    id: 'red_2024_refl',
    annee: 2024,
    type: 'reflexion',
    texteSupport: 'La chambre des officiers — Marc Dugain (1999)',
    consigne: "Que peuvent apporter les récits de vie, réels ou fictifs, à celles et ceux qui les découvrent ? Présentez votre réflexion dans un développement argumenté et organisé, illustré d'exemples issus de vos lectures et de votre culture artistique personnelle.",
  },
  {
    id: 'red_2023_ima',
    annee: 2023,
    type: 'imagination',
    texteSupport: 'Histoire de ma vie — George Sand (1855)',
    consigne: "Il vous est arrivé d'être pris dans un jeu qui vous a entraîné progressivement dans une aventure imaginaire intense. Vous raconterez cet épisode à la première personne. Vous pourrez enrichir votre récit par des descriptions, l'expression des sentiments et des sensations.",
  },
  {
    id: 'red_2023_refl',
    annee: 2023,
    type: 'reflexion',
    texteSupport: 'Histoire de ma vie — George Sand (1855)',
    consigne: "Pourquoi parle-t-on de soi et raconte-t-on sa vie dans des œuvres autobiographiques ? Vous répondrez à cette question dans un développement argumenté. Pour illustrer vos arguments, vous vous appuierez sur des exemples précis tirés d'œuvres littéraires et artistiques.",
  },
  {
    id: 'red_2022_refl',
    annee: 2022,
    type: 'reflexion',
    consigne: "La littérature et les œuvres artistiques peuvent-elles nous aider à réfléchir sur notre propre comportement ? Vous répondrez à cette question dans un développement organisé, en vous appuyant sur des exemples pris dans les œuvres littéraires et artistiques que vous connaissez.",
  },
  {
    id: 'red_2021_refl',
    annee: 2021,
    type: 'reflexion',
    consigne: "Aimez-vous découvrir des œuvres littéraires et artistiques dans lesquelles interviennent le surnaturel ou l'étrange ? Vous répondrez à cette question par un développement argumenté en vous appuyant sur les œuvres étudiées en classe, vos lectures personnelles et les œuvres cinématographiques et artistiques que vous connaissez.",
  },
  {
    id: 'red_2022_ima',
    annee: 2022,
    type: 'imagination',
    texteSupport: '« Le Lion et le Moucheron » — Jean de La Fontaine (1668)',
    contexte: "Dans cette fable, un Moucheron, insulté par le Lion qui le traite de « chétif insecte », lui déclare la guerre. Par des piqûres incessantes sur le cou, l'échine, le museau et les naseaux, il rend le Lion fou de rage : le fauve se déchire lui-même et s'épuise. Vainqueur, le Moucheron « sonne la victoire » et « va partout l'annoncer ».",
    consigne: "Imaginez le récit que fait le Moucheron de son combat victorieux aux autres animaux. Vous mettrez en évidence le caractère, les sentiments et les réflexions du Moucheron et vous pourrez montrer les réactions des autres animaux. Votre récit peut être rédigé à la première ou à la troisième personne du singulier.",
  },
  {
    id: 'red_2019_refl',
    annee: 2019,
    type: 'reflexion',
    texteSupport: 'Le Premier Homme — Albert Camus (1994)',
    consigne: "La littérature, le cinéma et les autres arts permettent de découvrir la vie de personnages fictifs ou réels. Que peut vous apporter cette découverte ? Vous développerez votre point de vue en prenant appui sur des exemples précis, issus de votre culture personnelle et des œuvres étudiées lors de votre scolarité.",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Index serveur (corrigé + critères disponibles, jamais exposé au client)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_QUESTIONS: FullBankQuestion[] = [
  ...MATHS_QUESTIONS,
  ...FRANCAIS_QUESTIONS,
  ...HG_QUESTIONS,
  ...SCIENCES_QUESTIONS,
]

export const QUESTIONS_INDEX = new Map<string, FullBankQuestion>(
  ALL_QUESTIONS.map(q => [q.id, q])
)

export const REDACTION_INDEX = new Map<string, RedactionSubject>(
  REDACTION_SUBJECTS.map(r => [r.id, r])
)

// ─────────────────────────────────────────────────────────────────────────────
// Fonctions utilitaires
// ─────────────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function toStored(q: FullBankQuestion): StoredQuestion {
  const { corrige: _c, criteres: _cr, ...stored } = q
  void _c; void _cr
  return stored
}

/**
 * Historique de ce qu'un élève a déjà vu.
 * `rank` = 0 pour la session la plus récente, 1 pour la précédente, etc.
 * Une question absente de la Map n'a jamais été servie à cet élève.
 */
export type SeenMap = Map<string, number>

/**
 * Pioche `n` questions dans `pool` en excluant tout ce que l'élève a déjà vu.
 * Si le pool de questions fraîches est trop petit, on complète avec les
 * questions vues il y a le plus longtemps (rank le plus élevé) plutôt qu'au
 * hasard — l'élève retombe ainsi sur ses questions les plus anciennes en dernier.
 */
function pickFresh<T extends { id: string }>(
  pool: T[],
  n: number,
  seen: SeenMap
): { picked: T[]; reused: number } {
  const fresh = shuffle(pool.filter(q => !seen.has(q.id)))
  if (fresh.length >= n) return { picked: fresh.slice(0, n), reused: 0 }

  const manquant = n - fresh.length
  const recycles = pool
    .filter(q => seen.has(q.id))
    .sort((a, b) => seen.get(b.id)! - seen.get(a.id)!)   // les plus anciennes d'abord
    .slice(0, manquant)

  return { picked: shuffle([...fresh, ...recycles]), reused: recycles.length }
}

/**
 * Pioche 5 Français + 6 HG/EMC + 3 Maths + 3 Sciences = 17 questions ouvertes
 * + 1 sujet de rédaction.
 *
 * Aucune question déjà servie à l'élève n'est reproposée tant que la banque
 * n'est pas épuisée pour la matière concernée. `reused > 0` dans le retour
 * signale que la banque a été épuisée et que des questions ont dû être
 * recyclées (les plus anciennes en priorité).
 *
 * Les corrigés et critères sont retirés avant le retour.
 */
export function pickRandomQuestions(
  seen: SeenMap = new Map(),
  seenRedaction: SeenMap = new Map()
): {
  questions: StoredQuestion[]
  redaction: RedactionSubject
  reused: number
} {
  const fr   = pickFresh(FRANCAIS_QUESTIONS, 5, seen)
  const hg   = pickFresh(HG_QUESTIONS, 6, seen)
  const math = pickFresh(MATHS_QUESTIONS, 3, seen)
  const sci  = pickFresh(SCIENCES_QUESTIONS, 3, seen)
  const red  = pickFresh(REDACTION_SUBJECTS, 1, seenRedaction)

  return {
    questions: [...fr.picked, ...hg.picked, ...math.picked, ...sci.picked].map(toStored),
    redaction: red.picked[0],
    reused: fr.reused + hg.reused + math.reused + sci.reused + red.reused,
  }
}

/** Taille de la banque par matière — utile pour le monitoring / l'admin. */
export const BANK_SIZE = {
  francais: FRANCAIS_QUESTIONS.length,
  hgEmc: HG_QUESTIONS.length,
  maths: MATHS_QUESTIONS.length,
  sciences: SCIENCES_QUESTIONS.length,
  redaction: REDACTION_SUBJECTS.length,
  /** Nombre de brevets 100 % inédits qu'un élève peut enchaîner. */
  epreuvesInedites: Math.min(
    Math.floor(FRANCAIS_QUESTIONS.length / 5),
    Math.floor(HG_QUESTIONS.length / 6),
    Math.floor(MATHS_QUESTIONS.length / 3),
    Math.floor(SCIENCES_QUESTIONS.length / 3),
    REDACTION_SUBJECTS.length
  ),
} as const

/** Récupère une question complète (avec corrigé) côté serveur uniquement. */
export function getFullQuestion(id: string): FullBankQuestion | undefined {
  return QUESTIONS_INDEX.get(id)
}

/** Récupère un sujet de rédaction par son id. */
export function getRedactionById(id: string): RedactionSubject | undefined {
  return REDACTION_INDEX.get(id)
}
