import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ActivityType } from "discord.js";
import { createServer } from "http";
import { setupServer } from "./setup.mjs";
import { setupLegalServer } from "./setup-legal.mjs";
import { ALL_ROLES, STAFF_ROLES, CIVIL_ROLES, MAIN_SERVER_CONFIG, LEGAL_SERVER_CONFIG } from "./config.mjs";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN manquant !");
  process.exit(1);
}

// ═══════════════════════════════════════════
// KEEP-ALIVE — mini serveur HTTP anti-veille
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 3000;
const keepAliveServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🌆 Révolution RP Bot — En ligne !");
});
keepAliveServer.listen(PORT, () => {
  console.log(`🌐 Keep-alive HTTP actif sur le port ${PORT}`);
});

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
      .setDescription("⚙️ Configure le serveur principal Révolution RP (rôles, catégories, salons, permissions)")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .toJSON(),
    new SlashCommandBuilder()
      .setName("setup-legal")
      .setDescription("🏛️ Configure le serveur légal Révolution RP (métiers, annonces, staff)")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .toJSON(),
    new SlashCommandBuilder()
      .setName("roles")
      .setDescription("🎭 Affiche la hiérarchie complète des rôles Révolution RP")
      .toJSON(),
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("❓ Affiche l'aide du bot Révolution RP")
      .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    console.log("📡 Enregistrement des commandes slash...");
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Commandes slash enregistrées !");
  } catch (error) {
    console.error("❌ Erreur commandes:", error.message);
  }
}

// Statuts tournants
const STATUTS = [
  { name: "🌆 Révolution RP", type: ActivityType.Watching },
  { name: "la ville en révolution 🔥", type: ActivityType.Watching },
  { name: "/setup pour configurer 🛠️", type: ActivityType.Playing },
  { name: "les services légaux 🚔", type: ActivityType.Watching },
  { name: "la hiérarchie staff 👑", type: ActivityType.Watching },
  { name: "/setup-legal pour le légal 🏛️", type: ActivityType.Playing },
];
let statutIndex = 0;

function updateStatut() {
  if (!client.user) return;
  const s = STATUTS[statutIndex % STATUTS.length];
  client.user.setPresence({ status: "online", activities: [s] });
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
// RECONNEXION AUTOMATIQUE & ANTI-CRASH
// ═══════════════════════════════════════════
client.on("error", (err) => console.error("❌ Erreur client:", err.message));
process.on("unhandledRejection", (r) => console.error("⚠️ Erreur non gérée:", r));
process.on("uncaughtException", (e) => console.error("⚠️ Exception non capturée:", e.message));

// ═══════════════════════════════════════════
// COMMANDES
// ═══════════════════════════════════════════
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, guild, member } = interaction;

  // ── /setup ──────────────────────────────
  if (commandName === "setup") {
    if (!guild) return interaction.reply({ content: "❌ Commande uniquement dans un serveur.", ephemeral: true });
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "❌ Tu dois être **Administrateur** pour cette commande.", ephemeral: true });
    }
    await interaction.reply({
      content: "⚙️ **Lancement de la configuration Révolution RP...**\n\nCela prend quelques minutes. Ne quitte pas !",
    });
    await setupServer(guild, interaction);
  }

  // ── /setup-legal ─────────────────────────
  if (commandName === "setup-legal") {
    if (!guild) return interaction.reply({ content: "❌ Commande uniquement dans un serveur.", ephemeral: true });
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "❌ Tu dois être **Administrateur** pour cette commande.", ephemeral: true });
    }
    await interaction.reply({
      content: "🏛️ **Lancement de la configuration du serveur Légal Révolution RP...**\n\nCela prend quelques minutes. Ne quitte pas !",
    });
    await setupLegalServer(guild, interaction);
  }

  // ── /roles ───────────────────────────────
  if (commandName === "roles") {
    const staffList = STAFF_ROLES
      .sort((a, b) => b.position - a.position)
      .map((r, i) => `\`${i + 1}.\` **${r.name}** — ${r.description}`)
      .join("\n");

    const civilList = CIVIL_ROLES
      .filter(r => !["Banni"].includes(r.name))
      .sort((a, b) => b.position - a.position)
      .map((r) => `> ${r.name}`)
      .join("\n");

    await interaction.reply({
      embeds: [{
        color: 0xff4500,
        title: "👑 Hiérarchie — Révolution RP",
        fields: [
          {
            name: "🛡️ Staff & Administration (du plus haut au plus bas)",
            value: staffList || "Aucun",
            inline: false,
          },
          {
            name: "👥 Rôles Civils",
            value: civilList || "Aucun",
            inline: false,
          },
        ],
        footer: { text: "Révolution RP • /setup pour configurer • /setup-legal pour le serveur légal" },
        timestamp: new Date().toISOString(),
      }],
    });
  }

  // ── /help ────────────────────────────────
  if (commandName === "help") {
    const totalSalonsPrincipal = MAIN_SERVER_CONFIG.categories.reduce((a, c) => a + c.channels.length, 0);
    const totalSalonsLegal = LEGAL_SERVER_CONFIG.categories.reduce((a, c) => a + c.channels.length, 0);

    await interaction.reply({
      embeds: [{
        color: 0x003087,
        title: "🌆 Bot Révolution RP — Aide",
        description: "Configure automatiquement tes serveurs Discord pour le RP Révolution.",
        fields: [
          {
            name: "⚙️ `/setup` — Serveur Principal",
            value: `Configure le serveur principal Révolution RP.\n> 🎭 **${ALL_ROLES.length} rôles** avec permissions adaptées\n> 📁 **${MAIN_SERVER_CONFIG.categories.length} catégories** (${MAIN_SERVER_CONFIG.categories.filter(c => c.private).length} privées staff)\n> 💬 **${totalSalonsPrincipal} salons**\n⚠️ **Requiert : Administrateur**`,
            inline: false,
          },
          {
            name: "🏛️ `/setup-legal` — Serveur Légal",
            value: `Configure un serveur légal séparé avec les salons pour chaque métier.\n> 📁 **${LEGAL_SERVER_CONFIG.categories.length} catégories**\n> 💬 **${totalSalonsLegal} salons** (police, SAMU, pompiers, douanes, justice...)\n⚠️ **Requiert : Administrateur**`,
            inline: false,
          },
          {
            name: "🎭 `/roles`",
            value: "Affiche la hiérarchie complète des rôles staff et civils.",
            inline: false,
          },
          {
            name: "❓ `/help`",
            value: "Affiche ce message d'aide.",
            inline: false,
          },
          {
            name: "👑 Hiérarchie Staff",
            value: STAFF_ROLES.sort((a, b) => b.position - a.position).map(r => `**${r.name}**`).join(" › "),
            inline: false,
          },
        ],
        footer: { text: "Révolution RP • Bonne révolution à tous ! 🌆" },
        timestamp: new Date().toISOString(),
      }],
    });
  }
});

// Quand le bot rejoint un serveur
client.on("guildCreate", (guild) => {
  console.log(`🆕 Ajouté au serveur: ${guild.name} (${guild.id})`);
  const ch = guild.systemChannel;
  if (ch) {
    ch.send(
      "🌆 **Bot Révolution RP est arrivé !**\n\n" +
      "**Commandes disponibles :**\n" +
      "⚙️ `/setup` — Configure le **serveur principal** (rôles, catégories, salons avec permissions)\n" +
      "🏛️ `/setup-legal` — Configure le **serveur légal** (métiers, annonces légales)\n\n" +
      "> ⚠️ Ces commandes nécessitent la permission **Administrateur**."
    ).catch(() => {});
  }
});

// ═══════════════════════════════════════════
// CONNEXION AVEC RELANCE AUTO
// ═══════════════════════════════════════════
async function connectBot() {
  try {
    await client.login(TOKEN);
  } catch (err) {
    console.error("❌ Connexion échouée, relance dans 10s...", err.message);
    setTimeout(connectBot, 10_000);
  }
}

connectBot();
