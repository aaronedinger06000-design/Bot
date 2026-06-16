import {
  Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes,
  PermissionFlagsBits, ActivityType, ChannelType, AuditLogEvent,
} from "discord.js";
import { createServer } from "http";
import { setupServer } from "./setup.mjs";
import { setupLegalServer } from "./setup-legal.mjs";
import { ALL_ROLES, STAFF_ROLES, CIVIL_ROLES, MAIN_SERVER_CONFIG, LEGAL_SERVER_CONFIG } from "./config.mjs";
import {
  handleKick, handleBan, handleUnban, handleTimeout, handleUntimeout,
  handleWarn, handleWarns, handleClearwarns, handleClear, handleSlowmode,
  handleLock, handleUnlock, handleRole, handleUserinfo, handleServerinfo,
  handleWhitelist,
} from "./management.mjs";
import {
  handleAntiRaid, checkAntiSpam, checkAntiMention, checkAntiJoin,
  checkAntiBot, checkAntiNuke,
} from "./antiraid.mjs";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) { console.error("❌ DISCORD_BOT_TOKEN manquant !"); process.exit(1); }

// ═══════════════════════════════════════════
// KEEP-ALIVE
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 3000;
createServer((req, res) => { res.writeHead(200); res.end("🌆 Révolution RP Bot — En ligne !"); }).listen(PORT, () => {
  console.log(`🌐 Keep-alive HTTP actif sur le port ${PORT}`);
});
const REPLIT_URL = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null;
if (REPLIT_URL) setInterval(async () => { try { await fetch(REPLIT_URL); } catch (_) {} }, 4 * 60 * 1000);

// ═══════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// ═══════════════════════════════════════════
// COMMANDES SLASH
// ═══════════════════════════════════════════
const MOD = PermissionFlagsBits.ModerateMembers;
const KICK = PermissionFlagsBits.KickMembers;
const BAN = PermissionFlagsBits.BanMembers;
const MSGS = PermissionFlagsBits.ManageMessages;
const CHAN = PermissionFlagsBits.ManageChannels;
const ROLES = PermissionFlagsBits.ManageRoles;
const ADMIN = PermissionFlagsBits.Administrator;

function buildCommands() {
  return [
    // ── SETUP ──
    new SlashCommandBuilder().setName("setup").setDescription("⚙️ Configure le serveur principal Révolution RP").setDefaultMemberPermissions(ADMIN),
    new SlashCommandBuilder().setName("setup-legal").setDescription("🏛️ Configure le serveur légal Révolution RP").setDefaultMemberPermissions(ADMIN),

    // ── MODÉRATION ──
    new SlashCommandBuilder().setName("kick").setDescription("🥾 Expulser un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre à expulser").setRequired(true))
      .addStringOption(o => o.setName("raison").setDescription("Raison du kick"))
      .setDefaultMemberPermissions(KICK),

    new SlashCommandBuilder().setName("ban").setDescription("🔨 Bannir un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre à bannir").setRequired(true))
      .addStringOption(o => o.setName("raison").setDescription("Raison du ban"))
      .addIntegerOption(o => o.setName("suppr_messages").setDescription("Supprimer ses messages des X derniers jours (0-7)").setMinValue(0).setMaxValue(7))
      .setDefaultMemberPermissions(BAN),

    new SlashCommandBuilder().setName("unban").setDescription("✅ Débannir un utilisateur")
      .addStringOption(o => o.setName("user_id").setDescription("ID de l'utilisateur à débannir").setRequired(true))
      .addStringOption(o => o.setName("raison").setDescription("Raison du unban"))
      .setDefaultMemberPermissions(BAN),

    new SlashCommandBuilder().setName("timeout").setDescription("🔇 Mettre un membre en sourdine (timeout)")
      .addUserOption(o => o.setName("membre").setDescription("Membre à mute").setRequired(true))
      .addIntegerOption(o => o.setName("durée").setDescription("Durée en minutes").setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption(o => o.setName("raison").setDescription("Raison du mute"))
      .setDefaultMemberPermissions(MOD),

    new SlashCommandBuilder().setName("untimeout").setDescription("🔊 Retirer le timeout d'un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre à unmute").setRequired(true))
      .addStringOption(o => o.setName("raison").setDescription("Raison"))
      .setDefaultMemberPermissions(MOD),

    new SlashCommandBuilder().setName("warn").setDescription("⚠️ Avertir un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre à avertir").setRequired(true))
      .addStringOption(o => o.setName("raison").setDescription("Raison de l'avertissement").setRequired(true))
      .setDefaultMemberPermissions(MOD),

    new SlashCommandBuilder().setName("warns").setDescription("📋 Voir les avertissements d'un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre (soi-même si vide)"))
      .setDefaultMemberPermissions(MOD),

    new SlashCommandBuilder().setName("clearwarns").setDescription("🗑️ Effacer tous les avertissements d'un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre").setRequired(true))
      .setDefaultMemberPermissions(MOD),

    new SlashCommandBuilder().setName("clear").setDescription("🗑️ Supprimer des messages en masse")
      .addIntegerOption(o => o.setName("nombre").setDescription("Nombre de messages à supprimer (1-100)").setRequired(true).setMinValue(1).setMaxValue(100))
      .addChannelOption(o => o.setName("salon").setDescription("Salon cible (actuel si vide)").addChannelTypes(ChannelType.GuildText))
      .setDefaultMemberPermissions(MSGS),

    new SlashCommandBuilder().setName("slowmode").setDescription("🐌 Définir le mode lent d'un salon")
      .addIntegerOption(o => o.setName("secondes").setDescription("Délai en secondes (0 = désactiver)").setRequired(true).setMinValue(0).setMaxValue(21600))
      .addChannelOption(o => o.setName("salon").setDescription("Salon cible (actuel si vide)").addChannelTypes(ChannelType.GuildText))
      .setDefaultMemberPermissions(CHAN),

    new SlashCommandBuilder().setName("lock").setDescription("🔒 Verrouiller un salon")
      .addChannelOption(o => o.setName("salon").setDescription("Salon à verrouiller (actuel si vide)").addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("raison").setDescription("Raison du verrouillage"))
      .setDefaultMemberPermissions(CHAN),

    new SlashCommandBuilder().setName("unlock").setDescription("🔓 Déverrouiller un salon")
      .addChannelOption(o => o.setName("salon").setDescription("Salon à déverrouiller (actuel si vide)").addChannelTypes(ChannelType.GuildText))
      .setDefaultMemberPermissions(CHAN),

    new SlashCommandBuilder().setName("role").setDescription("🎭 Ajouter ou retirer un rôle à un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre cible").setRequired(true))
      .addRoleOption(o => o.setName("rôle").setDescription("Rôle à ajouter/retirer").setRequired(true))
      .setDefaultMemberPermissions(ROLES),

    new SlashCommandBuilder().setName("whitelist").setDescription("✅ Mettre un membre en whitelist (rôle Citoyen + En Whitelist)")
      .addUserOption(o => o.setName("membre").setDescription("Membre à whitelister").setRequired(true))
      .setDefaultMemberPermissions(MOD),

    // ── INFOS ──
    new SlashCommandBuilder().setName("userinfo").setDescription("👤 Afficher les infos d'un membre")
      .addUserOption(o => o.setName("membre").setDescription("Membre (toi-même si vide)")),

    new SlashCommandBuilder().setName("serverinfo").setDescription("🏙️ Afficher les infos du serveur"),

    new SlashCommandBuilder().setName("roles").setDescription("🎭 Afficher la hiérarchie des rôles Révolution RP"),

    new SlashCommandBuilder().setName("help").setDescription("❓ Afficher l'aide complète du bot"),

    // ── ANTI-RAID ──
    new SlashCommandBuilder().setName("antiraid").setDescription("🛡️ Système anti-raid — configuration et statut")
      .addSubcommand(s => s.setName("status").setDescription("📊 Voir le statut et la configuration actuelle"))
      .addSubcommand(s => s.setName("activer").setDescription("✅ Activer le système anti-raid"))
      .addSubcommand(s => s.setName("désactiver").setDescription("❌ Désactiver le système anti-raid"))
      .addSubcommand(s => s.setName("logs")
        .setDescription("📋 Définir le salon de logs anti-raid")
        .addChannelOption(o => o.setName("salon").setDescription("Salon pour les alertes").setRequired(true).addChannelTypes(ChannelType.GuildText)))
      .addSubcommand(s => s.setName("spam")
        .setDescription("📨 Configurer l'anti-spam messages")
        .addBooleanOption(o => o.setName("actif").setDescription("Activer/désactiver l'anti-spam"))
        .addIntegerOption(o => o.setName("max_messages").setDescription("Nombre max de messages").setMinValue(2).setMaxValue(30))
        .addIntegerOption(o => o.setName("intervalle").setDescription("Intervalle en secondes").setMinValue(1).setMaxValue(30))
        .addStringOption(o => o.setName("action").setDescription("Action à effectuer").addChoices(
          { name: "Avertir", value: "warn" },
          { name: "Timeout", value: "timeout" },
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )))
      .addSubcommand(s => s.setName("join")
        .setDescription("👥 Configurer l'anti-join raid")
        .addBooleanOption(o => o.setName("actif").setDescription("Activer/désactiver l'anti-join"))
        .addIntegerOption(o => o.setName("max_joins").setDescription("Nombre max de joins").setMinValue(2).setMaxValue(50))
        .addIntegerOption(o => o.setName("intervalle").setDescription("Intervalle en secondes").setMinValue(1).setMaxValue(60))
        .addStringOption(o => o.setName("action").setDescription("Action à effectuer").addChoices(
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
          { name: "Lockdown serveur", value: "lockdown" },
        )))
      .addSubcommand(s => s.setName("nuke")
        .setDescription("💣 Configurer l'anti-nuke (suppressions de salons/rôles)")
        .addBooleanOption(o => o.setName("actif").setDescription("Activer/désactiver l'anti-nuke"))
        .addIntegerOption(o => o.setName("max_suppressions").setDescription("Nb max de suppressions").setMinValue(1).setMaxValue(20))
        .addIntegerOption(o => o.setName("intervalle").setDescription("Intervalle en secondes").setMinValue(1).setMaxValue(60))
        .addStringOption(o => o.setName("action").setDescription("Action à effectuer").addChoices(
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )))
      .addSubcommand(s => s.setName("bot")
        .setDescription("🤖 Configurer l'anti-bot (ajout de bots non autorisés)")
        .addBooleanOption(o => o.setName("actif").setDescription("Activer/désactiver l'anti-bot"))
        .addStringOption(o => o.setName("action").setDescription("Action").addChoices(
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )))
      .addSubcommand(s => s.setName("mention")
        .setDescription("📢 Configurer l'anti-mention spam")
        .addBooleanOption(o => o.setName("actif").setDescription("Activer/désactiver l'anti-mention"))
        .addIntegerOption(o => o.setName("max_mentions").setDescription("Nb max de mentions par message").setMinValue(2).setMaxValue(20))
        .addStringOption(o => o.setName("action").setDescription("Action").addChoices(
          { name: "Timeout", value: "timeout" },
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )))
      .setDefaultMemberPermissions(ADMIN),
  ].map(c => c.toJSON());
}

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    console.log("📡 Enregistrement des commandes slash...");
    await rest.put(Routes.applicationCommands(client.user.id), { body: buildCommands() });
    console.log("✅ Commandes slash enregistrées !");
  } catch (err) {
    console.error("❌ Erreur commandes:", err.message);
  }
}

// Statuts tournants
const STATUTS = [
  { name: "🌆 Révolution RP", type: ActivityType.Watching },
  { name: "/setup pour configurer 🛠️", type: ActivityType.Playing },
  { name: "les raids 🛡️", type: ActivityType.Watching },
  { name: "/antiraid status 🔒", type: ActivityType.Playing },
  { name: "le staff au travail 👮", type: ActivityType.Watching },
  { name: "/help pour l'aide ❓", type: ActivityType.Playing },
];
let statutIdx = 0;
function updateStatut() {
  if (!client.user) return;
  const s = STATUTS[statutIdx++ % STATUTS.length];
  client.user.setPresence({ status: "online", activities: [s] });
}

client.once("ready", async () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  console.log(`📊 ${client.guilds.cache.size} serveur(s)`);
  await registerCommands();
  updateStatut();
  setInterval(updateStatut, 30_000);
});

// ═══════════════════════════════════════════
// ÉVÉNEMENTS ANTI-RAID
// ═══════════════════════════════════════════
client.on("messageCreate", async (message) => {
  if (message.author?.bot) return;
  await checkAntiSpam(message);
  await checkAntiMention(message);
});

client.on("guildMemberAdd", async (member) => {
  await checkAntiJoin(member);
  await checkAntiBot(member);
});

client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  await checkAntiNuke(channel.guild, AuditLogEvent.ChannelDelete, channel.name);
});

client.on("roleDelete", async (role) => {
  if (!role.guild) return;
  await checkAntiNuke(role.guild, AuditLogEvent.RoleDelete, role.name);
});

// ═══════════════════════════════════════════
// GESTION DES COMMANDES
// ═══════════════════════════════════════════
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    // ── SETUP ──
    if (commandName === "setup") {
      if (!interaction.member.permissions.has(ADMIN)) return interaction.reply({ content: "❌ Administrateur requis.", ephemeral: true });
      await interaction.reply({ content: "⚙️ **Configuration de Révolution RP en cours...**\n\nNe quitte pas !" });
      return setupServer(interaction.guild, interaction);
    }
    if (commandName === "setup-legal") {
      if (!interaction.member.permissions.has(ADMIN)) return interaction.reply({ content: "❌ Administrateur requis.", ephemeral: true });
      await interaction.reply({ content: "🏛️ **Configuration du serveur légal en cours...**\n\nNe quitte pas !" });
      return setupLegalServer(interaction.guild, interaction);
    }

    // ── MODÉRATION ──
    if (commandName === "kick") return handleKick(interaction);
    if (commandName === "ban") return handleBan(interaction);
    if (commandName === "unban") return handleUnban(interaction);
    if (commandName === "timeout") return handleTimeout(interaction);
    if (commandName === "untimeout") return handleUntimeout(interaction);
    if (commandName === "warn") return handleWarn(interaction);
    if (commandName === "warns") return handleWarns(interaction);
    if (commandName === "clearwarns") return handleClearwarns(interaction);
    if (commandName === "clear") return handleClear(interaction);
    if (commandName === "slowmode") return handleSlowmode(interaction);
    if (commandName === "lock") return handleLock(interaction);
    if (commandName === "unlock") return handleUnlock(interaction);
    if (commandName === "role") return handleRole(interaction);
    if (commandName === "whitelist") return handleWhitelist(interaction);

    // ── INFOS ──
    if (commandName === "userinfo") return handleUserinfo(interaction);
    if (commandName === "serverinfo") return handleServerinfo(interaction);

    // ── ANTI-RAID ──
    if (commandName === "antiraid") return handleAntiRaid(interaction);

    // ── ROLES ──
    if (commandName === "roles") {
      const staffList = STAFF_ROLES
        .sort((a, b) => b.position - a.position)
        .map((r, i) => `\`${i + 1}.\` **${r.name}** — ${r.description}`)
        .join("\n");
      const civilList = CIVIL_ROLES
        .filter(r => r.name !== "Banni")
        .sort((a, b) => b.position - a.position)
        .map(r => `> ${r.name}`).join("\n");
      return interaction.reply({
        embeds: [{
          color: 0xff4500,
          title: "👑 Hiérarchie — Révolution RP",
          fields: [
            { name: "🛡️ Staff (du plus haut au plus bas)", value: staffList, inline: false },
            { name: "👥 Civils", value: civilList, inline: false },
          ],
          footer: { text: "Révolution RP • /setup • /setup-legal • /antiraid status" },
          timestamp: new Date().toISOString(),
        }],
      });
    }

    // ── HELP ──
    if (commandName === "help") {
      return interaction.reply({
        embeds: [{
          color: 0x003087,
          title: "🌆 Bot Révolution RP — Aide complète",
          fields: [
            { name: "🏗️ Setup", value: "`/setup` — Serveur principal\n`/setup-legal` — Serveur légal", inline: false },
            { name: "🥾 Modération membres", value: "`/kick` `/ban` `/unban` `/timeout` `/untimeout` `/warn` `/warns` `/clearwarns` `/whitelist`", inline: false },
            { name: "💬 Gestion salons", value: "`/clear` `/slowmode` `/lock` `/unlock`", inline: false },
            { name: "🎭 Rôles", value: "`/role @membre @rôle` — Ajouter/retirer un rôle", inline: false },
            { name: "👤 Infos", value: "`/userinfo` `/serverinfo` `/roles`", inline: false },
            { name: "🛡️ Anti-Raid", value: "`/antiraid status` — Voir la config\n`/antiraid activer` / `désactiver`\n`/antiraid spam` — Anti-spam messages\n`/antiraid join` — Anti-join raid\n`/antiraid nuke` — Anti-nuke (suppressions)\n`/antiraid bot` — Anti-ajout de bots\n`/antiraid mention` — Anti-mention spam\n`/antiraid logs #salon` — Salon d'alertes", inline: false },
          ],
          footer: { text: "Révolution RP • Bonne révolution ! 🌆" },
          timestamp: new Date().toISOString(),
        }],
      });
    }
  } catch (err) {
    console.error(`❌ Erreur commande ${commandName}:`, err.message);
    const payload = { content: `❌ Erreur inattendue : ${err.message}`, ephemeral: true };
    if (interaction.replied || interaction.deferred) interaction.followUp(payload).catch(() => {});
    else interaction.reply(payload).catch(() => {});
  }
});

client.on("guildCreate", (guild) => {
  console.log(`🆕 Ajouté : ${guild.name}`);
  guild.systemChannel?.send(
    "🌆 **Bot Révolution RP est arrivé !**\n\n" +
    "⚙️ `/setup` — Serveur principal\n" +
    "🏛️ `/setup-legal` — Serveur légal\n" +
    "🛡️ `/antiraid status` — Anti-raid\n" +
    "❓ `/help` — Aide complète\n\n" +
    "> ⚠️ `/setup` et `/setup-legal` nécessitent **Administrateur**."
  ).catch(() => {});
});

client.on("error", (err) => console.error("❌ Erreur client:", err.message));
process.on("unhandledRejection", (r) => console.error("⚠️ Rejet non géré:", r));
process.on("uncaughtException", (e) => console.error("⚠️ Exception:", e.message));

async function connectBot() {
  try { await client.login(TOKEN); }
  catch (err) { console.error("❌ Connexion échouée, relance dans 10s:", err.message); setTimeout(connectBot, 10_000); }
}
connectBot();
