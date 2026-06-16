import { PermissionFlagsBits } from "discord.js";

const {
  Administrator,
  ManageGuild,
  ManageChannels,
  ManageRoles,
  ManageMessages,
  ManageNicknames,
  KickMembers,
  BanMembers,
  ModerateMembers,
  ViewAuditLog,
  MuteMembers,
  DeafenMembers,
  MoveMembers,
  ViewChannel,
  SendMessages,
  ReadMessageHistory,
  EmbedLinks,
  AttachFiles,
  UseExternalEmojis,
  AddReactions,
  CreateInstantInvite,
  ChangeNickname,
  UseApplicationCommands,
  SendMessagesInThreads,
  CreatePublicThreads,
  CreatePrivateThreads,
  ManageThreads,
  Connect,
  Speak,
  Stream,
  UseVAD,
  PrioritySpeaker,
  MentionEveryone,
  ViewGuildInsights,
  ManageEvents,
  ManageWebhooks,
} = PermissionFlagsBits;

// Permissions de base pour tous les membres
const BASE_PERMS = [
  ViewChannel,
  SendMessages,
  ReadMessageHistory,
  EmbedLinks,
  AttachFiles,
  UseExternalEmojis,
  AddReactions,
  ChangeNickname,
  UseApplicationCommands,
  SendMessagesInThreads,
  CreatePublicThreads,
  Connect,
  Speak,
  Stream,
  UseVAD,
  CreateInstantInvite,
];

// ─── HIÉRARCHIE STAFF (du plus haut au plus bas) ─────────────────
// Owner › Fondateur › Co-Fondateur › Responsable RH › Responsable Staff
// › Responsable Admin › Responsable Modérateur › Super Administrateur
// › Administrateur › Super Modérateur › Modérateur › Helper › Staff Événementiel
export const STAFF_ROLES = [
  {
    name: "Owner",
    color: "#FF0000",
    hoist: true,
    mentionable: false,
    position: 120,
    permissions: [Administrator],
    description: "Propriétaire absolu du serveur",
  },
  {
    name: "Fondateur",
    color: "#FF2200",
    hoist: true,
    mentionable: false,
    position: 119,
    permissions: [Administrator],
    description: "Fondateur du serveur Révolution RP",
  },
  {
    name: "Co-Fondateur",
    color: "#FF4400",
    hoist: true,
    mentionable: false,
    position: 118,
    permissions: [
      ManageGuild, ManageChannels, ManageRoles, ManageMessages,
      ManageNicknames, ManageWebhooks, ManageEvents, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers, MentionEveryone,
      ViewGuildInsights, PrioritySpeaker, ...BASE_PERMS,
    ],
    description: "Co-fondateur du serveur",
  },
  {
    name: "Responsable RH",
    color: "#FF6600",
    hoist: true,
    mentionable: true,
    position: 117,
    permissions: [
      ManageGuild, ManageChannels, ManageRoles, ManageMessages,
      ManageNicknames, ManageWebhooks, ManageEvents, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers, MentionEveryone,
      ViewGuildInsights, ...BASE_PERMS,
    ],
    description: "Responsable des Ressources Humaines",
  },
  {
    name: "Responsable Staff",
    color: "#FF8800",
    hoist: true,
    mentionable: true,
    position: 116,
    permissions: [
      ManageGuild, ManageChannels, ManageRoles, ManageMessages,
      ManageNicknames, ManageWebhooks, ManageEvents, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers, MentionEveryone,
      ...BASE_PERMS,
    ],
    description: "Responsable de l'ensemble de l'équipe staff",
  },
  {
    name: "Responsable Admin",
    color: "#FFAA00",
    hoist: true,
    mentionable: true,
    position: 115,
    permissions: [
      ManageChannels, ManageRoles, ManageMessages,
      ManageNicknames, ManageWebhooks, ManageEvents, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers, MentionEveryone,
      ...BASE_PERMS,
    ],
    description: "Responsable de l'équipe administration",
  },
  {
    name: "Responsable Modérateur",
    color: "#FFCC00",
    hoist: true,
    mentionable: true,
    position: 114,
    permissions: [
      ManageChannels, ManageMessages, ManageNicknames, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers, MentionEveryone,
      ...BASE_PERMS,
    ],
    description: "Responsable de l'équipe modération",
  },
  {
    name: "Super Administrateur",
    color: "#FFD700",
    hoist: true,
    mentionable: true,
    position: 113,
    permissions: [
      ManageChannels, ManageRoles, ManageMessages,
      ManageNicknames, ManageEvents, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers,
      ...BASE_PERMS,
    ],
    description: "Super Administrateur — gestion avancée",
  },
  {
    name: "Administrateur",
    color: "#90EE90",
    hoist: true,
    mentionable: true,
    position: 112,
    permissions: [
      ManageChannels, ManageMessages, ManageNicknames,
      ManageEvents, ManageThreads,
      KickMembers, BanMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers,
      ...BASE_PERMS,
    ],
    description: "Administrateur — gestion du serveur",
  },
  {
    name: "Super Modérateur",
    color: "#00CED1",
    hoist: true,
    mentionable: true,
    position: 111,
    permissions: [
      ManageMessages, ManageNicknames, ManageThreads,
      KickMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, DeafenMembers, MoveMembers,
      ...BASE_PERMS,
    ],
    description: "Super Modérateur — modération avancée",
  },
  {
    name: "Modérateur",
    color: "#3498DB",
    hoist: true,
    mentionable: true,
    position: 110,
    permissions: [
      ManageMessages, ManageNicknames, ManageThreads,
      KickMembers, ModerateMembers, ViewAuditLog,
      MuteMembers, MoveMembers,
      ...BASE_PERMS,
    ],
    description: "Modérateur — modération standard",
  },
  {
    name: "Helper",
    color: "#1ABC9C",
    hoist: true,
    mentionable: true,
    position: 109,
    permissions: [
      ManageMessages, ManageThreads,
      ModerateMembers, ViewAuditLog,
      ...BASE_PERMS,
    ],
    description: "Helper — aide aux membres",
  },
  {
    name: "Staff Événementiel",
    color: "#DA70D6",
    hoist: false,
    mentionable: true,
    position: 108,
    permissions: [
      ManageEvents, ManageMessages, MoveMembers,
      ...BASE_PERMS,
    ],
    description: "Organisateur d'événements RP",
  },
];

// ─── RÔLES CIVILS / SPÉCIAUX ─────────────────────────────────────
export const CIVIL_ROLES = [
  { name: "Joueur Confirmé", color: "#3498DB", hoist: true, mentionable: false, position: 30, permissions: [...BASE_PERMS] },
  { name: "Citoyen", color: "#95A5A6", hoist: true, mentionable: false, position: 20, permissions: [...BASE_PERMS] },
  { name: "Nouveau", color: "#BDC3C7", hoist: false, mentionable: false, position: 10, permissions: [ViewChannel, ReadMessageHistory, UseApplicationCommands, Connect, Speak] },
  { name: "En Whitelist", color: "#1ABC9C", hoist: false, mentionable: false, position: 9, permissions: [...BASE_PERMS] },
  { name: "Partenaire", color: "#F1C40F", hoist: false, mentionable: false, position: 8, permissions: [...BASE_PERMS] },
  { name: "Donateur", color: "#E91E63", hoist: false, mentionable: false, position: 7, permissions: [...BASE_PERMS] },
  { name: "Banni", color: "#000000", hoist: false, mentionable: false, position: 2, permissions: [] },
];

export const ALL_ROLES = [...STAFF_ROLES, ...CIVIL_ROLES];

// ─── STAFF NAMES (pour les permissions) ──────────────────────────
export const ALL_STAFF_NAMES = STAFF_ROLES.map((r) => r.name);

// Hiérarchie : Owner › Fondateur › Co-Fondateur › Responsable RH › Responsable Staff
// › Responsable Admin › Responsable Modérateur › Super Administrateur
// › Administrateur › Super Modérateur › Modérateur › Helper › Staff Événementiel
export const SENIOR_STAFF = ["Owner", "Fondateur", "Co-Fondateur", "Responsable RH", "Responsable Staff"];
export const MID_STAFF = [...SENIOR_STAFF, "Responsable Admin", "Responsable Modérateur", "Super Administrateur", "Administrateur", "Super Modérateur", "Modérateur"];
export const ALL_STAFF = [...MID_STAFF, "Helper", "Staff Événementiel"];

// ─── SERVEUR PRINCIPAL : RÉVOLUTION RP ───────────────────────────
export const MAIN_SERVER_CONFIG = {
  name: "Révolution RP",

  categories: [
    // ══ INFORMATIONS ══
    {
      name: "📢 ┃ INFORMATIONS",
      private: false,
      channels: [
        { name: "📌┃règlement", type: "text", topic: "Règlement officiel de Révolution RP. Lecture obligatoire.", readOnly: true },
        { name: "📣┃annonces", type: "text", topic: "Annonces officielles du staff.", readOnly: true },
        { name: "🔔┃mises-à-jour", type: "text", topic: "Mises à jour du serveur et du jeu.", readOnly: true },
        { name: "🗓️┃événements", type: "text", topic: "Événements RP à venir.", readOnly: true },
        { name: "🤝┃partenariats", type: "text", topic: "Nos partenaires officiels.", readOnly: true },
      ],
    },
    // ══ ACCUEIL ══
    {
      name: "👋 ┃ ACCUEIL",
      private: false,
      channels: [
        { name: "👋┃bienvenue", type: "text", topic: "Bienvenue sur Révolution RP !", readOnly: true },
        { name: "📝┃présentation", type: "text", topic: "Présente-toi à la communauté." },
        { name: "❓┃faq", type: "text", topic: "Questions fréquentes.", readOnly: true },
        { name: "🎭┃charte-rp", type: "text", topic: "Les règles du RP.", readOnly: true },
        { name: "📊┃sondages", type: "text", topic: "Sondages communautaires." },
      ],
    },
    // ══ GÉNÉRAL ══
    {
      name: "💬 ┃ GÉNÉRAL",
      private: false,
      channels: [
        { name: "💬┃général", type: "text", topic: "Discussion générale hors RP." },
        { name: "🖼️┃médias", type: "text", topic: "Screenshots et vidéos RP." },
        { name: "😂┃humour", type: "text", topic: "Mèmes et humour." },
        { name: "🎮┃autres-jeux", type: "text", topic: "Discussion sur d'autres jeux." },
        { name: "🤖┃commandes-bot", type: "text", topic: "Commandes bot ici." },
        { name: "💡┃suggestions", type: "text", topic: "Vos suggestions pour le serveur." },
        { name: "Général", type: "voice" },
        { name: "Détente", type: "voice" },
        { name: "AFK", type: "voice" },
      ],
    },
    // ══ RP GÉNÉRAL ══
    {
      name: "🎭 ┃ RÉVOLUTION RP",
      private: false,
      channels: [
        { name: "📰┃journal-rp", type: "text", topic: "Journal officiel de la ville — actualités RP." },
        { name: "🏛️┃mairie", type: "text", topic: "Communiqués officiels de la mairie." },
        { name: "🗣️┃radio-ville", type: "text", topic: "Radio officielle de la ville." },
        { name: "📸┃photos-rp", type: "text", topic: "Photos et captures de jeu." },
        { name: "🎬┃clips-rp", type: "text", topic: "Clips et vidéos de jeu." },
        { name: "🗺️┃carte-ville", type: "text", topic: "Carte et lieux importants.", readOnly: true },
        { name: "RP Général", type: "voice" },
        { name: "Scène RP", type: "voice" },
        { name: "Réunion RP", type: "voice" },
      ],
    },
    // ══ ÉVÉNEMENTS ══
    {
      name: "🎉 ┃ ÉVÉNEMENTS",
      private: false,
      channels: [
        { name: "📅┃agenda", type: "text", topic: "Calendrier des événements RP.", readOnly: true },
        { name: "🎭┃événement-en-cours", type: "text", topic: "Événements RP en cours." },
        { name: "🏆┃résultats", type: "text", topic: "Résultats des événements." },
        { name: "Salle Événement", type: "voice" },
        { name: "Événement 1", type: "voice" },
        { name: "Événement 2", type: "voice" },
      ],
    },
    // ══ DONATEURS ══
    {
      name: "💎 ┃ DONATEURS",
      private: true,
      privateRoles: ["Donateur", ...SENIOR_STAFF],
      channels: [
        { name: "💎┃salon-donateurs", type: "text", topic: "Salon exclusif donateurs." },
        { name: "🎁┃avantages", type: "text", topic: "Liste des avantages donateurs.", readOnly: true },
        { name: "Lounge Donateurs", type: "voice" },
      ],
    },
    // ══ SUPPORT / TICKETS ══
    {
      name: "🎫 ┃ SUPPORT",
      private: false,
      channels: [
        { name: "🎫┃ouvrir-un-ticket", type: "text", topic: "Créez un ticket pour contacter le staff.", readOnly: true },
        { name: "📬┃recours-sanction", type: "text", topic: "Faire un recours contre une sanction." },
        { name: "🆘┃signalement", type: "text", topic: "Signaler un comportement inapproprié." },
      ],
    },

    // ══════════════════════════════════════
    //           STAFF PRIVÉ
    // ══════════════════════════════════════

    // ══ OWNER / FONDATEURS ══
    {
      name: "👑 ┃ DIRECTION",
      private: true,
      privateRoles: ["Owner", "Fondateur", "Co-Fondateur"],
      channels: [
        { name: "💬┃chat-direction", type: "text", topic: "Discussion privée de la direction." },
        { name: "📊┃bilans", type: "text", topic: "Bilans et statistiques du serveur." },
        { name: "🔑┃décisions", type: "text", topic: "Décisions majeures." },
        { name: "🗃️┃archives", type: "text", topic: "Archives confidentielles." },
        { name: "Direction", type: "voice" },
      ],
    },
    // ══ ADMINISTRATION ══
    {
      name: "🔴 ┃ ADMINISTRATION",
      private: true,
      privateRoles: ["Owner", "Fondateur", "Co-Fondateur", "Responsable RH", "Responsable Staff", "Responsable Admin", "Responsable Modérateur", "Super Administrateur", "Administrateur"],
      channels: [
        { name: "💬┃admin-chat", type: "text", topic: "Chat interne administrateurs." },
        { name: "📋┃admin-tâches", type: "text", topic: "Tâches en cours côté admin." },
        { name: "🚨┃sanctions-admin", type: "text", topic: "Sanctions appliquées par l'administration." },
        { name: "📁┃rank-admin", type: "text", topic: "Grades et hiérarchie admin." },
        { name: "📝┃admin-logs", type: "text", topic: "Logs des actions admin." },
        { name: "🗓️┃planning-admin", type: "text", topic: "Planning de l'équipe admin." },
        { name: "Admin Général", type: "voice" },
        { name: "Réunion Admin", type: "voice" },
      ],
    },
    // ══ MODÉRATION ══
    {
      name: "🟠 ┃ MODÉRATION",
      private: true,
      privateRoles: [...MID_STAFF],
      channels: [
        { name: "💬┃mod-chat", type: "text", topic: "Chat interne modérateurs." },
        { name: "🔨┃sanctions-actives", type: "text", topic: "Sanctions en cours." },
        { name: "📋┃procédures-sanction", type: "text", topic: "Procédures officielles de sanction." },
        { name: "🕵️┃surveillance", type: "text", topic: "Surveillance et signalements." },
        { name: "📜┃journal-modération", type: "text", topic: "Journal complet des actions de modération." },
        { name: "🚫┃bans-list", type: "text", topic: "Liste des membres bannis." },
        { name: "Modération", type: "voice" },
      ],
    },
    // ══ STAFF GÉNÉRAL ══
    {
      name: "🟡 ┃ STAFF GÉNÉRAL",
      private: true,
      privateRoles: [...ALL_STAFF],
      channels: [
        { name: "💬┃staff-chat", type: "text", topic: "Chat général du staff." },
        { name: "📋┃staff-tâches", type: "text", topic: "Tâches en cours pour le staff." },
        { name: "🔔┃staff-alertes", type: "text", topic: "Alertes et signalements urgents." },
        { name: "📁┃rank-staff", type: "text", topic: "Grades et hiérarchie du staff.", readOnly: true },
        { name: "📝┃staff-logs", type: "text", topic: "Logs d'activité du staff." },
        { name: "📩┃staff-rapports", type: "text", topic: "Rapports et comptes rendus." },
        { name: "🗓️┃staff-planning", type: "text", topic: "Planning du staff." },
        { name: "Staff Général", type: "voice" },
        { name: "Réunion Staff", type: "voice" },
        { name: "Staff VC 1", type: "voice" },
      ],
    },
    // ══ RESSOURCES HUMAINES ══
    {
      name: "👥 ┃ RESSOURCES HUMAINES",
      private: true,
      privateRoles: ["Owner", "Fondateur", "Co-Fondateur", "Responsable RH", "Responsable Staff"],
      channels: [
        { name: "📝┃candidatures-reçues", type: "text", topic: "Candidatures reçues." },
        { name: "✅┃candidatures-acceptées", type: "text", topic: "Candidatures acceptées." },
        { name: "❌┃candidatures-refusées", type: "text", topic: "Candidatures refusées." },
        { name: "📊┃suivi-membres", type: "text", topic: "Suivi et évaluation des membres." },
        { name: "📁┃fiches-membres", type: "text", topic: "Fiches personnelles des membres." },
        { name: "Entretien RH", type: "voice" },
      ],
    },
    // ══ BOTS ══
    {
      name: "🤖 ┃ BOTS",
      private: true,
      privateRoles: ["Owner", "Fondateur", "Co-Fondateur", "Super Administrateur", "Administrateur"],
      channels: [
        { name: "🤖┃bot-logs", type: "text", topic: "Logs et actions des bots." },
        { name: "⚙️┃bot-config", type: "text", topic: "Configuration des bots." },
      ],
    },
  ],
};

// ─── SERVEUR LÉGAL ────────────────────────────────────────────────
export const LEGAL_SERVER_CONFIG = {
  name: "Révolution RP — Légal",

  categories: [
    {
      name: "📢 ┃ INFORMATIONS LÉGAL",
      private: false,
      channels: [
        { name: "📌┃règlement-légal", type: "text", topic: "Règlement du serveur légal Révolution RP.", readOnly: true },
        { name: "📣┃annonces-légal", type: "text", topic: "Annonces officielles des services légaux.", readOnly: true },
        { name: "🔔┃mises-à-jour-légal", type: "text", topic: "Mises à jour des services légaux.", readOnly: true },
        { name: "📋┃guide-recrutement", type: "text", topic: "Guide pour rejoindre un service légal.", readOnly: true },
      ],
    },
    {
      name: "🏛️ ┃ SERVICES LÉGAUX — SERVEURS",
      private: false,
      channels: [
        { name: "🚔┃police-nationale", type: "text", topic: "Serveur Discord de la Police Nationale — lien et informations." },
        { name: "🚑┃samu-urgences", type: "text", topic: "Serveur Discord du SAMU / Urgences — lien et informations." },
        { name: "🚒┃pompiers-secours", type: "text", topic: "Serveur Discord des Pompiers — lien et informations." },
        { name: "🛃┃douanes", type: "text", topic: "Serveur Discord des Douanes — lien et informations." },
        { name: "⚖️┃justice-tribunal", type: "text", topic: "Serveur Discord du Tribunal / Justice — lien et informations." },
        { name: "🏥┃hôpital", type: "text", topic: "Serveur Discord de l'Hôpital — lien et informations." },
        { name: "🏛️┃mairie-gouvernement", type: "text", topic: "Serveur Discord de la Mairie — lien et informations." },
      ],
    },
    {
      name: "💬 ┃ GÉNÉRAL LÉGAL",
      private: false,
      channels: [
        { name: "💬┃général-légal", type: "text", topic: "Discussion générale des services légaux." },
        { name: "📸┃photos-légal", type: "text", topic: "Photos et captures des services légaux." },
        { name: "🤖┃commandes-bot", type: "text", topic: "Commandes bot." },
        { name: "Général Légal", type: "voice" },
        { name: "Légal VC 1", type: "voice" },
      ],
    },
    {
      name: "🔐 ┃ STAFF LÉGAL",
      private: true,
      privateRoles: [...ALL_STAFF],
      channels: [
        { name: "💬┃staff-légal", type: "text", topic: "Chat staff du serveur légal." },
        { name: "📋┃gestion-légal", type: "text", topic: "Gestion des services légaux." },
        { name: "📁┃dossiers-légal", type: "text", topic: "Dossiers et archives légal." },
        { name: "Staff Légal", type: "voice" },
      ],
    },
  ],
};
