import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } from "discord.js";
import { setupServer } from "./setup.mjs";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN manquant !");
  process.exit(1);
}

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
      .setDescription("Configure le serveur RP Emergencie Hambourg (rôles, catégories, salons)")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .toJSON(),
    new SlashCommandBuilder()
      .setName("roles")
      .setDescription("Affiche la liste de tous les rôles du serveur RP Emergencie Hambourg")
      .toJSON(),
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Affiche l'aide du bot RP Emergencie Hambourg")
      .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("📡 Enregistrement des commandes slash...");
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Commandes slash enregistrées globalement !");
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement des commandes:", error);
  }
}

client.once("ready", async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  console.log(`📊 Connecté à ${client.guilds.cache.size} serveur(s)`);
  await registerCommands();
  client.user.setActivity("RP Emergencie Hambourg 🚨", { type: 3 }); // WATCHING
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guild, member } = interaction;

  if (commandName === "setup") {
    if (!guild) {
      return interaction.reply({ content: "❌ Cette commande doit être exécutée dans un serveur.", ephemeral: true });
    }

    const memberPerms = member.permissions;
    if (!memberPerms.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "❌ Tu dois être **Administrateur** pour utiliser cette commande.", ephemeral: true });
    }

    await interaction.reply({
      content: "⚙️ **Lancement de la configuration du serveur RP Emergencie Hambourg...**\n\nCela peut prendre quelques minutes selon la taille du serveur. Ne quitte pas !",
      ephemeral: false,
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

    const embed = {
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
    };

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }

  if (commandName === "help") {
    const embed = {
      color: 0x003087,
      title: "🚨 Bot RP Emergencie Hambourg — Aide",
      description: "Ce bot configure automatiquement ton serveur Discord pour du RP Emergencie à Hambourg.",
      fields: [
        {
          name: "⚙️ `/setup`",
          value: "Configure **entièrement** le serveur : supprime tout l'existant et crée toutes les catégories, salons et rôles du RP.\n⚠️ **Requiert : Administrateur**",
          inline: false,
        },
        {
          name: "🎭 `/roles`",
          value: "Affiche la liste complète des rôles disponibles sur le serveur RP.",
          inline: false,
        },
        {
          name: "❓ `/help`",
          value: "Affiche ce message d'aide.",
          inline: false,
        },
        {
          name: "📊 Ce que `/setup` crée",
          value: `> 🎭 **${(await import("./config.mjs")).SERVER_CONFIG.roles.length} rôles** (staff, police, SAMU, pompiers, douanes, justice, civils)\n> 📁 **${(await import("./config.mjs")).SERVER_CONFIG.categories.length} catégories** (publiques et privées)\n> 💬 **${(await import("./config.mjs")).SERVER_CONFIG.categories.reduce((acc, c) => acc + c.channels.length, 0)} salons** (texte et vocal)`,
          inline: false,
        },
      ],
      footer: { text: "RP Emergencie Hambourg • Bon RP à tous ! 🚨" },
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
});

client.on("guildCreate", async (guild) => {
  console.log(`🆕 Bot ajouté au serveur: ${guild.name} (${guild.id})`);
  const systemChannel = guild.systemChannel;
  if (systemChannel) {
    systemChannel.send(
      "🚨 **RP Emergencie Hambourg Bot est arrivé !**\n\nTape `/setup` pour configurer automatiquement le serveur avec tous les rôles, catégories et salons RP.\n\n> ⚠️ Cette commande nécessite la permission **Administrateur** et va reconfigurer entièrement le serveur."
    ).catch(() => {});
  }
});

client.login(TOKEN);
