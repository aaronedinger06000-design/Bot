export const SERVER_CONFIG = {
  name: "RP Emergencie Hambourg",
  description: "Serveur de jeu de rôle urgences à Hambourg",

  roles: [
    // ═══════════════ ADMINISTRATION ═══════════════
    { name: "Fondateur", color: "#FF0000", hoist: true, mentionable: false, position: 100, icon: null },
    { name: "Co-Fondateur", color: "#FF4500", hoist: true, mentionable: false, position: 99 },
    { name: "Directeur Général", color: "#FF6600", hoist: true, mentionable: false, position: 98 },
    { name: "Administrateur", color: "#FF8C00", hoist: true, mentionable: false, position: 97 },
    { name: "Modérateur Chef", color: "#FFD700", hoist: true, mentionable: true, position: 96 },
    { name: "Modérateur", color: "#FFA500", hoist: true, mentionable: true, position: 95 },
    { name: "Modérateur Junior", color: "#FFCC00", hoist: true, mentionable: true, position: 94 },
    { name: "Responsable RH", color: "#DA70D6", hoist: true, mentionable: true, position: 93 },
    { name: "Staff Événementiel", color: "#9370DB", hoist: true, mentionable: true, position: 92 },
    { name: "Helper", color: "#8A2BE2", hoist: true, mentionable: true, position: 91 },

    // ═══════════════ POLICE ═══════════════
    { name: "Commissaire de Police", color: "#003087", hoist: true, mentionable: true, position: 80 },
    { name: "Commandant de Police", color: "#0047AB", hoist: true, mentionable: true, position: 79 },
    { name: "Capitaine de Police", color: "#1560BD", hoist: true, mentionable: true, position: 78 },
    { name: "Lieutenant de Police", color: "#2171C7", hoist: true, mentionable: true, position: 77 },
    { name: "Sergent de Police", color: "#3182D0", hoist: true, mentionable: true, position: 76 },
    { name: "Brigadier de Police", color: "#4193D9", hoist: true, mentionable: true, position: 75 },
    { name: "Agent de Police", color: "#6BB3EC", hoist: true, mentionable: true, position: 74 },
    { name: "Agent Stagiaire Police", color: "#90C8F5", hoist: false, mentionable: true, position: 73 },

    // ═══════════════ SAMU / MÉDICAL ═══════════════
    { name: "Médecin Chef SAMU", color: "#006400", hoist: true, mentionable: true, position: 70 },
    { name: "Médecin SAMU", color: "#228B22", hoist: true, mentionable: true, position: 69 },
    { name: "Infirmier Chef", color: "#2E8B57", hoist: true, mentionable: true, position: 68 },
    { name: "Infirmier", color: "#3CB371", hoist: true, mentionable: true, position: 67 },
    { name: "Ambulancier Chef", color: "#4CAF50", hoist: true, mentionable: true, position: 66 },
    { name: "Ambulancier", color: "#66BB6A", hoist: false, mentionable: true, position: 65 },
    { name: "Stagiaire SAMU", color: "#A5D6A7", hoist: false, mentionable: true, position: 64 },

    // ═══════════════ POMPIERS ═══════════════
    { name: "Colonel Pompier", color: "#8B0000", hoist: true, mentionable: true, position: 60 },
    { name: "Commandant Pompier", color: "#B22222", hoist: true, mentionable: true, position: 59 },
    { name: "Capitaine Pompier", color: "#CC2200", hoist: true, mentionable: true, position: 58 },
    { name: "Lieutenant Pompier", color: "#DC3545", hoist: true, mentionable: true, position: 57 },
    { name: "Sergent Pompier", color: "#E74C3C", hoist: true, mentionable: true, position: 56 },
    { name: "Caporal Pompier", color: "#F05460", hoist: false, mentionable: true, position: 55 },
    { name: "Pompier", color: "#FF6B6B", hoist: false, mentionable: true, position: 54 },
    { name: "Stagiaire Pompier", color: "#FFAAAA", hoist: false, mentionable: true, position: 53 },

    // ═══════════════ DOUANES ═══════════════
    { name: "Directeur des Douanes", color: "#4B0082", hoist: true, mentionable: true, position: 50 },
    { name: "Inspecteur des Douanes", color: "#6A0DAD", hoist: true, mentionable: true, position: 49 },
    { name: "Agent des Douanes", color: "#7B2FBE", hoist: false, mentionable: true, position: 48 },

    // ═══════════════ JUSTICE ═══════════════
    { name: "Juge", color: "#2C3E50", hoist: true, mentionable: true, position: 45 },
    { name: "Procureur", color: "#34495E", hoist: true, mentionable: true, position: 44 },
    { name: "Avocat", color: "#4A6274", hoist: false, mentionable: true, position: 43 },

    // ═══════════════ CIVILS / MÉTIERS ═══════════════
    { name: "Maire de Hambourg", color: "#C0392B", hoist: true, mentionable: true, position: 40 },
    { name: "Journaliste", color: "#D4AC0D", hoist: false, mentionable: true, position: 39 },
    { name: "Mécanicien", color: "#7F8C8D", hoist: false, mentionable: true, position: 38 },
    { name: "Chauffeur de Taxi", color: "#F39C12", hoist: false, mentionable: true, position: 37 },
    { name: "Livreur", color: "#E67E22", hoist: false, mentionable: true, position: 36 },
    { name: "Commerçant", color: "#27AE60", hoist: false, mentionable: true, position: 35 },
    { name: "Chef Cuisinier", color: "#E74C3C", hoist: false, mentionable: true, position: 34 },
    { name: "Banquier", color: "#2980B9", hoist: false, mentionable: true, position: 33 },
    { name: "Architecte", color: "#8E44AD", hoist: false, mentionable: true, position: 32 },
    { name: "Enseignant", color: "#16A085", hoist: false, mentionable: true, position: 31 },
    { name: "Criminel", color: "#1C2833", hoist: false, mentionable: true, position: 30 },

    // ═══════════════ CIVILS ═══════════════
    { name: "Citoyen de Hambourg", color: "#95A5A6", hoist: true, mentionable: false, position: 20 },
    { name: "Nouveau Citoyen", color: "#BDC3C7", hoist: false, mentionable: false, position: 19 },

    // ═══════════════ SPÉCIAUX ═══════════════
    { name: "En Whitelist", color: "#1ABC9C", hoist: false, mentionable: false, position: 10 },
    { name: "Partenaire", color: "#F1C40F", hoist: false, mentionable: false, position: 9 },
    { name: "Donateur", color: "#E91E63", hoist: false, mentionable: false, position: 8 },
    { name: "Banni", color: "#000000", hoist: false, mentionable: false, position: 1 },
  ],

  categories: [
    // ═══════════════ INFORMATIONS GÉNÉRALES ═══════════════
    {
      name: "📢 ┃ INFORMATIONS",
      private: false,
      channels: [
        { name: "📌┃règlement-du-serveur", type: "text", topic: "Règlement officiel du serveur RP Emergencie Hambourg. Merci de le lire avant toute participation." },
        { name: "📣┃annonces", type: "text", topic: "Annonces officielles du staff et de la direction." },
        { name: "🔔┃mises-à-jour", type: "text", topic: "Mises à jour du serveur, du bot et des règles RP." },
        { name: "📋┃informations-rp", type: "text", topic: "Informations importantes sur le jeu de rôle Emergencie Hambourg." },
        { name: "🗓️┃événements", type: "text", topic: "Annonces des événements RP à venir." },
        { name: "🤝┃partenariats", type: "text", topic: "Nos partenaires et serveurs alliés." },
      ],
    },
    // ═══════════════ ACCUEIL ═══════════════
    {
      name: "👋 ┃ ACCUEIL",
      private: false,
      channels: [
        { name: "👋┃bienvenue", type: "text", topic: "Bienvenue sur le serveur RP Emergencie Hambourg !" },
        { name: "📝┃présentation", type: "text", topic: "Présente-toi à la communauté ici." },
        { name: "🎭┃charte-rp", type: "text", topic: "Charte de conduite RP à respecter en jeu." },
        { name: "❓┃faq", type: "text", topic: "Questions fréquentes sur le RP Emergencie Hambourg." },
        { name: "📊┃sondages", type: "text", topic: "Sondages et votes communautaires." },
      ],
    },
    // ═══════════════ CANDIDATURES ═══════════════
    {
      name: "📄 ┃ CANDIDATURES",
      private: false,
      channels: [
        { name: "📋┃modèle-candidature", type: "text", topic: "Modèles officiels pour postuler aux différents corps de métier." },
        { name: "🚔┃candidature-police", type: "text", topic: "Déposez ici vos candidatures pour rejoindre la Police de Hambourg." },
        { name: "🚑┃candidature-samu", type: "text", topic: "Déposez ici vos candidatures pour rejoindre le SAMU de Hambourg." },
        { name: "🚒┃candidature-pompiers", type: "text", topic: "Déposez ici vos candidatures pour rejoindre les Pompiers de Hambourg." },
        { name: "⚖️┃candidature-justice", type: "text", topic: "Déposez ici vos candidatures pour rejoindre l'institution judiciaire." },
        { name: "🛃┃candidature-douanes", type: "text", topic: "Déposez ici vos candidatures pour rejoindre la Douane de Hambourg." },
        { name: "💼┃candidature-staff", type: "text", topic: "Déposez ici vos candidatures pour rejoindre le staff du serveur." },
      ],
    },
    // ═══════════════ GÉNÉRAL ═══════════════
    {
      name: "💬 ┃ GÉNÉRAL",
      private: false,
      channels: [
        { name: "💬┃général", type: "text", topic: "Discussion générale hors RP." },
        { name: "🖼️┃médias", type: "text", topic: "Partagez vos screenshots et vidéos RP." },
        { name: "😂┃humour", type: "text", topic: "Mèmes et humour communautaire." },
        { name: "🎮┃jeux-hors-rp", type: "text", topic: "Discussion sur d'autres jeux." },
        { name: "🎵┃musique", type: "text", topic: "Partage de musiques." },
        { name: "🤖┃commandes-bot", type: "text", topic: "Utilisez les commandes bot ici." },
        { name: "General", type: "voice", topic: null },
        { name: "🎵 Musique", type: "voice", topic: null },
        { name: "AFK", type: "voice", topic: null },
      ],
    },
    // ═══════════════ RP GÉNÉRAL ═══════════════
    {
      name: "🎭 ┃ RP HAMBOURG",
      private: false,
      channels: [
        { name: "📰┃journal-de-hambourg", type: "text", topic: "Journal officiel de la ville de Hambourg. Actualités RP publiées par les journalistes." },
        { name: "🏛️┃mairie-hambourg", type: "text", topic: "Communiqués officiels de la mairie de Hambourg." },
        { name: "🗣️┃radio-hambourg", type: "text", topic: "Transcriptions et annonces de la radio de Hambourg." },
        { name: "📸┃photos-rp", type: "text", topic: "Photos et captures RP à partager." },
        { name: "🎬┃clips-rp", type: "text", topic: "Vos meilleurs moments RP en vidéo." },
        { name: "🗺️┃carte-hambourg", type: "text", topic: "Carte de la ville et lieux importants." },
        { name: "RP Général", type: "voice", topic: null },
        { name: "Scène RP", type: "voice", topic: null },
      ],
    },
    // ═══════════════ POLICE NATIONALE ═══════════════
    {
      name: "🚔 ┃ POLICE NATIONALE",
      private: false,
      channels: [
        { name: "📋┃règlement-police", type: "text", topic: "Règlement interne de la Police Nationale de Hambourg." },
        { name: "📢┃annonces-police", type: "text", topic: "Annonces officielles de la Police Nationale." },
        { name: "🔍┃avis-de-recherche", type: "text", topic: "Avis de recherche publiés par la police." },
        { name: "🚔┃opérations-en-cours", type: "text", topic: "Opérations de police actives sur le terrain." },
        { name: "Dispatch Police", type: "voice", topic: null },
        { name: "Briefing Police", type: "voice", topic: null },
        { name: "Patrouille 1", type: "voice", topic: null },
        { name: "Patrouille 2", type: "voice", topic: null },
      ],
      privateRoles: ["Commissaire de Police", "Commandant de Police", "Capitaine de Police", "Lieutenant de Police", "Sergent de Police", "Brigadier de Police", "Agent de Police", "Agent Stagiaire Police"],
    },
    // ═══════════════ POLICE PRIVÉ ═══════════════
    {
      name: "🔒 ┃ POLICE — PRIVÉ",
      private: true,
      channels: [
        { name: "💬┃chat-officiers", type: "text", topic: "Discussion interne réservée aux officiers de police." },
        { name: "📁┃dossiers-criminels", type: "text", topic: "Dossiers et fiches criminelles confidentielles." },
        { name: "🗂️┃procédures-internes", type: "text", topic: "Procédures et protocoles internes de la police." },
        { name: "⚠️┃sanctions-police", type: "text", topic: "Sanctions internes aux membres de la police." },
        { name: "📝┃rapports-terrain", type: "text", topic: "Rapports d'intervention sur le terrain." },
        { name: "Chat Officiers", type: "voice", topic: null },
        { name: "Salle de Commandement", type: "voice", topic: null },
      ],
      privateRoles: ["Commissaire de Police", "Commandant de Police", "Capitaine de Police", "Lieutenant de Police", "Sergent de Police"],
    },
    // ═══════════════ SAMU ═══════════════
    {
      name: "🚑 ┃ SAMU — URGENCES",
      private: false,
      channels: [
        { name: "📋┃règlement-samu", type: "text", topic: "Règlement interne du SAMU de Hambourg." },
        { name: "📢┃annonces-samu", type: "text", topic: "Annonces officielles du SAMU." },
        { name: "🏥┃urgences-actives", type: "text", topic: "Interventions médicales d'urgence en cours." },
        { name: "💊┃protocoles-médicaux", type: "text", topic: "Protocoles et procédures médicales à suivre." },
        { name: "Dispatch SAMU", type: "voice", topic: null },
        { name: "Ambulance 1", type: "voice", topic: null },
        { name: "Ambulance 2", type: "voice", topic: null },
        { name: "Salle des Urgences", type: "voice", topic: null },
      ],
      privateRoles: ["Médecin Chef SAMU", "Médecin SAMU", "Infirmier Chef", "Infirmier", "Ambulancier Chef", "Ambulancier", "Stagiaire SAMU"],
    },
    // ═══════════════ SAMU PRIVÉ ═══════════════
    {
      name: "🔒 ┃ SAMU — PRIVÉ",
      private: true,
      channels: [
        { name: "💬┃chat-médical", type: "text", topic: "Discussion interne réservée au personnel médical." },
        { name: "📁┃dossiers-patients", type: "text", topic: "Dossiers patients confidentiels." },
        { name: "⚠️┃sanctions-samu", type: "text", topic: "Sanctions internes du SAMU." },
        { name: "📝┃rapports-médicaux", type: "text", topic: "Rapports d'intervention médicale." },
        { name: "Réunion SAMU", type: "voice", topic: null },
      ],
      privateRoles: ["Médecin Chef SAMU", "Médecin SAMU", "Infirmier Chef"],
    },
    // ═══════════════ POMPIERS ═══════════════
    {
      name: "🚒 ┃ POMPIERS",
      private: false,
      channels: [
        { name: "📋┃règlement-pompiers", type: "text", topic: "Règlement interne des Pompiers de Hambourg." },
        { name: "📢┃annonces-pompiers", type: "text", topic: "Annonces officielles des Pompiers." },
        { name: "🔥┃incendies-actifs", type: "text", topic: "Interventions en cours pour les pompiers." },
        { name: "🛠️┃matériel-caserne", type: "text", topic: "État du matériel et des véhicules de la caserne." },
        { name: "Dispatch Pompiers", type: "voice", topic: null },
        { name: "Camion 1", type: "voice", topic: null },
        { name: "Camion 2", type: "voice", topic: null },
        { name: "Salle de Repos", type: "voice", topic: null },
      ],
      privateRoles: ["Colonel Pompier", "Commandant Pompier", "Capitaine Pompier", "Lieutenant Pompier", "Sergent Pompier", "Caporal Pompier", "Pompier", "Stagiaire Pompier"],
    },
    // ═══════════════ POMPIERS PRIVÉ ═══════════════
    {
      name: "🔒 ┃ POMPIERS — PRIVÉ",
      private: true,
      channels: [
        { name: "💬┃chat-pompiers", type: "text", topic: "Discussion interne réservée aux pompiers." },
        { name: "📁┃rapports-intervention", type: "text", topic: "Rapports d'intervention incendie." },
        { name: "⚠️┃sanctions-pompiers", type: "text", topic: "Sanctions internes aux pompiers." },
        { name: "Commandement Pompiers", type: "voice", topic: null },
      ],
      privateRoles: ["Colonel Pompier", "Commandant Pompier", "Capitaine Pompier", "Lieutenant Pompier"],
    },
    // ═══════════════ DOUANES ═══════════════
    {
      name: "🛃 ┃ DOUANES",
      private: false,
      channels: [
        { name: "📋┃règlement-douanes", type: "text", topic: "Règlement interne de la Douane de Hambourg." },
        { name: "📢┃annonces-douanes", type: "text", topic: "Annonces officielles de la Douane." },
        { name: "🔎┃contrôles-actifs", type: "text", topic: "Contrôles douaniers en cours." },
        { name: "🚢┃port-hambourg", type: "text", topic: "Activité portuaire et saisies." },
        { name: "Dispatch Douanes", type: "voice", topic: null },
        { name: "Poste de Contrôle", type: "voice", topic: null },
      ],
      privateRoles: ["Directeur des Douanes", "Inspecteur des Douanes", "Agent des Douanes"],
    },
    // ═══════════════ JUSTICE ═══════════════
    {
      name: "⚖️ ┃ JUSTICE",
      private: false,
      channels: [
        { name: "📋┃règlement-judiciaire", type: "text", topic: "Règlement et procédures judiciaires de Hambourg." },
        { name: "📢┃annonces-judiciaires", type: "text", topic: "Annonces officielles du tribunal." },
        { name: "🔨┃jugements", type: "text", topic: "Jugements rendus par le tribunal de Hambourg." },
        { name: "📜┃code-pénal-hambourg", type: "text", topic: "Code pénal en vigueur à Hambourg." },
        { name: "Salle d'Audience", type: "voice", topic: null },
        { name: "Délibération", type: "voice", topic: null },
      ],
      privateRoles: ["Juge", "Procureur", "Avocat"],
    },
    // ═══════════════ CIVILS & MÉTIERS ═══════════════
    {
      name: "👷 ┃ MÉTIERS CIVILS",
      private: false,
      channels: [
        { name: "🗺️┃offres-emploi", type: "text", topic: "Offres d'emploi disponibles à Hambourg." },
        { name: "🔧┃garage-mécanique", type: "text", topic: "Salon dédié aux mécaniciens de Hambourg." },
        { name: "🚕┃taxi-vtc", type: "text", topic: "Salon dédié aux chauffeurs de taxi et VTC." },
        { name: "📦┃livraisons", type: "text", topic: "Salon dédié aux livreurs." },
        { name: "🏪┃commerces", type: "text", topic: "Commerces et boutiques de Hambourg." },
        { name: "👨‍🍳┃restauration", type: "text", topic: "Restaurants et établissements de restauration." },
        { name: "🏦┃banque", type: "text", topic: "Services bancaires de Hambourg." },
        { name: "📰┃presse", type: "text", topic: "Salon dédié aux journalistes." },
        { name: "Espace Civils", type: "voice", topic: null },
        { name: "Marché Hambourg", type: "voice", topic: null },
      ],
    },
    // ═══════════════ PÉGALE / CRIMINALITÉ ═══════════════
    {
      name: "💀 ┃ MILIEU CRIMINEL",
      private: false,
      channels: [
        { name: "📋┃règles-criminalité", type: "text", topic: "Règles RP concernant les activités criminelles." },
        { name: "🕵️┃activités-illicites", type: "text", topic: "Salon de coordination des activités criminelles RP." },
        { name: "⚫┃marché-noir", type: "text", topic: "Marché noir RP de Hambourg." },
        { name: "Repaire", type: "voice", topic: null },
      ],
      privateRoles: ["Criminel"],
    },
    // ═══════════════ STAFF PRIVÉ ═══════════════
    {
      name: "🔐 ┃ STAFF — DIRECTION",
      private: true,
      channels: [
        { name: "💬┃chat-direction", type: "text", topic: "Discussion réservée à la direction du serveur." },
        { name: "📊┃bilan-hebdo", type: "text", topic: "Bilans et rapports hebdomadaires de la direction." },
        { name: "🔑┃décisions-importantes", type: "text", topic: "Décisions majeures concernant le serveur." },
        { name: "🗃️┃archives-direction", type: "text", topic: "Archives et documents de la direction." },
        { name: "Direction", type: "voice", topic: null },
      ],
      privateRoles: ["Fondateur", "Co-Fondateur", "Directeur Général"],
    },
    {
      name: "🛡️ ┃ STAFF — GÉNÉRAL",
      private: true,
      channels: [
        { name: "💬┃staff-chat", type: "text", topic: "Discussion générale du staff." },
        { name: "📋┃staff-tâches", type: "text", topic: "Tâches en cours et à venir pour le staff." },
        { name: "🚨┃sanctions-staff", type: "text", topic: "Journal des sanctions appliquées par le staff." },
        { name: "📁┃rank-staff", type: "text", topic: "Grades et hiérarchie du staff." },
        { name: "📝┃staff-logs", type: "text", topic: "Logs d'activité du staff." },
        { name: "🔔┃staff-alertes", type: "text", topic: "Alertes et signalements urgents pour le staff." },
        { name: "📩┃staff-rapports", type: "text", topic: "Rapports et comptes rendus du staff." },
        { name: "🗓️┃staff-planning", type: "text", topic: "Planning et calendrier du staff." },
        { name: "Staff Général", type: "voice", topic: null },
        { name: "Réunion Staff", type: "voice", topic: null },
      ],
      privateRoles: ["Fondateur", "Co-Fondateur", "Directeur Général", "Administrateur", "Modérateur Chef", "Modérateur", "Modérateur Junior", "Responsable RH", "Staff Événementiel", "Helper"],
    },
    {
      name: "🎫 ┃ TICKETS & SUPPORT",
      private: true,
      channels: [
        { name: "🎫┃ouvrir-un-ticket", type: "text", topic: "Ouvrez un ticket pour contacter le staff." },
        { name: "📬┃recours-sanctions", type: "text", topic: "Faites un recours contre une sanction." },
        { name: "🆘┃signalements", type: "text", topic: "Signalez un comportement inapproprié." },
        { name: "🏛️┃suggestions", type: "text", topic: "Proposez des améliorations pour le serveur." },
      ],
      privateRoles: ["Fondateur", "Co-Fondateur", "Directeur Général", "Administrateur", "Modérateur Chef", "Modérateur", "Modérateur Junior"],
    },
    // ═══════════════ MODÉRATION ═══════════════
    {
      name: "⚠️ ┃ MODÉRATION",
      private: true,
      channels: [
        { name: "🔨┃sanctions-actives", type: "text", topic: "Sanctions en cours et bannissements." },
        { name: "📋┃procédures-sanction", type: "text", topic: "Procédures officielles de sanction du staff." },
        { name: "🕵️┃surveillance", type: "text", topic: "Surveillance et rapports d'infractions." },
        { name: "📜┃journal-modération", type: "text", topic: "Journal complet des actions de modération." },
        { name: "🚫┃bans-list", type: "text", topic: "Liste des membres bannis du serveur." },
        { name: "Modération", type: "voice", topic: null },
      ],
      privateRoles: ["Fondateur", "Co-Fondateur", "Directeur Général", "Administrateur", "Modérateur Chef", "Modérateur", "Modérateur Junior"],
    },
    // ═══════════════ RH ═══════════════
    {
      name: "👥 ┃ RESSOURCES HUMAINES",
      private: true,
      channels: [
        { name: "📝┃candidatures-reçues", type: "text", topic: "Candidatures reçues en attente de traitement." },
        { name: "✅┃candidatures-acceptées", type: "text", topic: "Candidatures acceptées." },
        { name: "❌┃candidatures-refusées", type: "text", topic: "Candidatures refusées." },
        { name: "📊┃suivi-membres", type: "text", topic: "Suivi et évaluation des membres." },
        { name: "📁┃fiches-personnelles", type: "text", topic: "Fiches personnelles des membres du serveur." },
        { name: "Entretien RH", type: "voice", topic: null },
      ],
      privateRoles: ["Fondateur", "Co-Fondateur", "Directeur Général", "Administrateur", "Responsable RH"],
    },
    // ═══════════════ ÉVÉNEMENTS ═══════════════
    {
      name: "🎉 ┃ ÉVÉNEMENTS",
      private: false,
      channels: [
        { name: "📅┃agenda-événements", type: "text", topic: "Calendrier des événements RP à venir." },
        { name: "🎭┃événement-en-cours", type: "text", topic: "Suivi des événements RP en cours." },
        { name: "🏆┃résultats-événements", type: "text", topic: "Résultats et compte rendus des événements." },
        { name: "Salle Événement", type: "voice", topic: null },
        { name: "Événement 1", type: "voice", topic: null },
        { name: "Événement 2", type: "voice", topic: null },
      ],
    },
    // ═══════════════ DONATEURS ═══════════════
    {
      name: "💎 ┃ DONATEURS",
      private: true,
      channels: [
        { name: "💎┃salon-donateurs", type: "text", topic: "Salon exclusif réservé aux donateurs du serveur." },
        { name: "🎁┃avantages-donateurs", type: "text", topic: "Liste des avantages pour les donateurs." },
        { name: "Lounge Donateurs", type: "voice", topic: null },
      ],
      privateRoles: ["Donateur"],
    },
    // ═══════════════ BOTS ═══════════════
    {
      name: "🤖 ┃ BOTS",
      private: true,
      channels: [
        { name: "🤖┃bot-logs", type: "text", topic: "Logs et actions des bots du serveur." },
        { name: "⚙️┃bot-config", type: "text", topic: "Configuration des bots du serveur." },
      ],
      privateRoles: ["Fondateur", "Co-Fondateur", "Directeur Général", "Administrateur"],
    },
  ],
};
