import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ActivityType } from "discord.js";
import { createServer } from "http";
import { setupServer } from "./setup.mjs";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN manquant !");
  process.exit(1);
}

// ═══════════════════════════════════════════
// KEEP-ALIVE : mini serveur HTTP pour que
// Replit ne mette jamais le bot en veille
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 3000;
const keepAliveServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🚨 RP Emergencie Hambourg Bot — En ligne !");
});
keepAliveServer.listen(PORT, () => {
  console.log(`🌐 Keep-alive HTTP actif sur le port ${PORT}`);
});

// Auto-ping toutes les 4 minutes pour rester actif
const REPLIT_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : null;

if (REPLIT_URL) {
  setInterval(async () => {
    try {
      await fetch(REPLIT_URL);
      console.log("🔄 Auto-ping OK —", new Date().toLocaleTimeString("fr-FR"));
    } catch (_) {}
  }, 4 * 60 * 1000);
}

// ═══════════════════════════════════════════
// CLIENT DISCORD
// ═══════════════════════════════════════════
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Enregistrement des commandes slash
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("setup")
      .setDescription("⚙️ Configure le serveur RP Emergencie Hambourg (rôles, catégories, salons)")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .toJSON(),
    new SlashCommandBuilder()
      .setName("roles")
      .setDescription("🎭 Affiche la liste de tous les rôles du serveur RP Emergencie Hambourg")
      .toJSON(),
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("❓ Affiche l'aide du bot RP Emergencie Hambourg")
      .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    console.log("📡 Enregistrement des commandes slash...");
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Commandes slash enregistrées !");
  } catch (error) {
    console.error("❌ Erreur commandes slash:", error.message);
  }
}

// Statut tournant pour paraître toujours actif
const STATUTS = [
  { name: "🚨 RP Emergencie Hambourg", type: ActivityType.Watching },
  { name: "les urgences de Hambourg 🚑", type: ActivityType.Watching },
  { name: "/setup pour configurer 🛠️", type: ActivityType.Playing },
  { name: "la ville de Hambourg 🏙️", type: ActivityType.Watching },
  { name: "les services d'urgence 🚒", type: ActivityType.Watching },
];
let statutIndex = 0;

function updateStatut() {
  if (!client.user) return;
  const statut = STATUTS[statutIndex % STATUTS.length];
  client.user.setPresence({
    status: "online",
    activities: [statut],
  });
  statutIndex++;
}

client.once("ready", async () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  console.log(`📊 ${client.guilds.cache.size} serveur(s)`);
  await registerCommands();
  updateStatut();
  setInterval(updateStatut, 30_000);
});

// ═══════════════════════════════════════════
// RECONNEXION AUTOMATIQUE
// ═══════════════════════════════════════════
client.on("disconnect", () => {
  console.warn("⚠️ Bot déconnecté — tentative de reconnexion...");
});

client.on("reconnecting", () => {
  console.log("🔄 Reconnexion en cours...");
});

client.on("error", (error) => {
  console.error("❌ Erreur client Discord:", error.message);
});

// Empêche le bot de crasher sur erreur non gérée
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Erreur non gérée:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("⚠️ Exception non capturée:", error.message);
});

// ═══════════════════════════════════════════
// COMMANDES
// ═══════════════════════════════════════════
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guild, member } = interaction;

  if (commandName === "setup") {
    if (!guild) {
      return interaction.reply({ content: "❌ Cette commande doit être exécutée dans un serveur.", ephemeral: true });
    }
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "❌ Tu dois être **Administrateur** pour utiliser cette commande.", ephemeral: true });
    }
    await interaction.reply({
      content: "⚙️ **Lancement de la configuration du serveur RP Emergencie Hambourg...**\n\nCela peut prendre quelques minutes. Ne quitte pas !",
    });
    await setupServer(guild, interaction);
  }

  if (commandName === "roles") {
    const { SERVER_CONFIG } = await import("./config.mjs");
    const staffRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 91).map((r) => `> **${r.name}**`).join("\n");
    const policeRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 73 && r.position <= 80).map((r) => `> ${r.name}`).join("\n");
    const samuRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 64 && r.position <= 70).map((r) => `> ${r.name}`).join("\n");
    const pompierRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 53 && r.position <= 60).map((r) => `> ${r.name}`).join("\n");
    const douanesRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 48 && r.position <= 50).map((r) => `> ${r.name}`).join("\n");
    const justiceRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 43 && r.position <= 45).map((r) => `> ${r.name}`).join("\n");
    const civilRoles = SERVER_CONFIG.roles.filter((r) => r.position >= 30 && r.position <= 40).map((r) => `> ${r.name}`).join("\n");

    await interaction.reply({
      embeds: [{
        color: 0xff4500,
        title: "🏙️ Rôles — RP Emergencie Hambourg",
        fields: [
          { name: "🛡️ Staff & Administration", value: staffRoles || "Aucun", inline: false },
          { name: "🚔 Police Nationale", value: policeRoles || "Aucun", inline: true },
          { name: "🚑 SAMU", value: samuRoles || "Aucun", inline: true },
          { name: "🚒 Pompiers", value: pompierRoles || "Aucun", inline: true },
          { name: "🛃 Douanes", value: douanesRoles || "Aucun", inline: true },
          { name: "⚖️ Justice", value: justiceRoles || "Aucun", inline: true },
          { name: "👷 Métiers Civils", value: civilRoles || "Aucun", inline: true },
        ],
        footer: { text: "RP Emergencie Hambourg • /setup pour configurer le serveur" },
        timestamp: new Date().toISOString(),
      }],
    });
  }

  if (commandName === "help") {
    const { SERVER_CONFIG } = await import("./config.mjs");
    const totalSalons = SERVER_CONFIG.categories.reduce((acc, c) => acc + c.channels.length, 0);

    await interaction.reply({
      embeds: [{
        color: 0x003087,
        title: "🚨 Bot RP Emergencie Hambourg — Aide",
        description: "Configure automatiquement ton serveur Discord pour du RP Emergencie à Hambourg.",
        fields: [
          {
            name: "⚙️ `/setup`",
            value: "Configure **entièrement** le serveur : crée toutes les catégories, salons et rôles du RP.\n⚠️ **Requiert : Administrateur**",
            inline: false,
          },
          {
            name: "🎭 `/roles`",
            value: "Affiche la liste complète des rôles disponibles.",
            inline: false,
          },
          {
            name: "❓ `/help`",
            value: "Affiche ce message d'aide.",
            inline: false,
          },
          {
            name: "📊 Ce que `/setup` crée",
            value: `> 🎭 **${SERVER_CONFIG.roles.length} rôles** (staff, police, SAMU, pompiers, douanes, justice, civils)\n> 📁 **${SERVER_CONFIG.categories.length} catégories** (publiques & privées)\n> 💬 **${totalSalons} salons** (texte et vocal)`,
            inline: false,
          },
        ],
        footer: { text: "RP Emergencie Hambourg • Bon RP à tous ! 🚨" },
        timestamp: new Date().toISOString(),
      }],
    });
  }
});

client.on("guildCreate", (guild) => {
  console.log(`🆕 Ajouté au serveur: ${guild.name} (${guild.id})`);
  const ch = guild.systemChannel;
  if (ch) {
    ch.send("🚨 **RP Emergencie Hambourg Bot est arrivé !**\n\nTape `/setup` pour configurer automatiquement le serveur.\n\n> ⚠️ Nécessite la permission **Administrateur**.").catch(() => {});
  }
});

// ═══════════════════════════════════════════
// CONNEXION — relance auto si déconnecté
// ═══════════════════════════════════════════
async function connectBot() {
  try {
    await client.login(TOKEN);
  } catch (err) {
    console.error("❌ Erreur de connexion, nouvelle tentative dans 10s...", err.message);
    setTimeout(connectBot, 10_000);
  }
}

connectBot();
