import { EmbedBuilder, PermissionFlagsBits, AuditLogEvent } from "discord.js";

// ─── CONFIG PAR DÉFAUT ────────────────────────────────────────────
const DEFAULT_CONFIG = {
  enabled: false,
  logChannelId: null,

  // Anti-spam messages
  antiSpam: {
    enabled: true,
    maxMessages: 5,       // Max messages
    interval: 3000,       // En ms (3 secondes)
    action: "timeout",    // "warn" | "kick" | "ban" | "timeout"
    timeoutDuration: 10,  // minutes
  },

  // Anti-join raid
  antiJoin: {
    enabled: true,
    maxJoins: 8,          // Max joins
    interval: 10000,      // En ms (10 secondes)
    action: "kick",       // "kick" | "ban" | "lockdown"
  },

  // Anti-nuke (suppressions de salons/rôles)
  antiNuke: {
    enabled: true,
    maxDeletions: 3,      // Max suppressions
    interval: 10000,      // En ms (10 secondes)
    action: "ban",        // "kick" | "ban"
  },

  // Anti-bot (ajout de bots en masse)
  antiBot: {
    enabled: true,
    action: "kick",       // "kick" | "ban"
  },

  // Anti-mention spam
  antiMention: {
    enabled: true,
    maxMentions: 6,       // Max mentions par message
    action: "timeout",
    timeoutDuration: 5,   // minutes
  },
};

// ─── STOCKAGE EN MÉMOIRE ─────────────────────────────────────────
const guildConfigs = new Map();      // guildId => config
const messageTracker = new Map();    // guildId:userId => [timestamps]
const joinTracker = new Map();       // guildId => [timestamps]
const deletionTracker = new Map();   // guildId => [timestamps]

export function getConfig(guildId) {
  if (!guildConfigs.has(guildId)) {
    guildConfigs.set(guildId, JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  }
  return guildConfigs.get(guildId);
}

export function setConfig(guildId, config) {
  guildConfigs.set(guildId, config);
}

// ─── UTILITAIRES ─────────────────────────────────────────────────
const COLORS = { warn: 0xf39c12, error: 0xe74c3c, success: 0x2ecc71, info: 0x3498db };

function raidEmbed(title, description, fields = []) {
  const e = new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle(`🚨 ANTI-RAID — ${title}`)
    .setDescription(description)
    .setTimestamp();
  if (fields.length) e.addFields(fields);
  return e;
}

async function sendLog(guild, config, embedObj) {
  if (!config.logChannelId) return;
  const ch = guild.channels.cache.get(config.logChannelId);
  if (ch) ch.send({ embeds: [embedObj] }).catch(() => {});
}

async function takeAction(guild, member, action, reason, timeoutMinutes = 10) {
  try {
    if (action === "warn") {
      await member.send(`⚠️ **Avertissement Anti-Raid** — ${reason}`).catch(() => {});
    } else if (action === "timeout") {
      if (member.moderatable) await member.timeout(timeoutMinutes * 60 * 1000, reason);
    } else if (action === "kick") {
      if (member.kickable) {
        await member.send(`🥾 Tu as été expulsé de **${guild.name}** — ${reason}`).catch(() => {});
        await member.kick(reason);
      }
    } else if (action === "ban") {
      if (member.bannable) {
        await member.send(`🔨 Tu as été banni de **${guild.name}** — ${reason}`).catch(() => {});
        await member.ban({ reason, deleteMessageSeconds: 86400 });
      }
    }
  } catch (_) {}
}

function track(map, key, interval) {
  const now = Date.now();
  const list = (map.get(key) || []).filter((t) => now - t < interval);
  list.push(now);
  map.set(key, list);
  return list.length;
}

// ═══════════════════════════════════════════════════════════════
//                    ANTI-SPAM MESSAGES
// ═══════════════════════════════════════════════════════════════
export async function checkAntiSpam(message) {
  if (!message.guild || message.author.bot) return;
  const config = getConfig(message.guild.id);
  if (!config.enabled || !config.antiSpam.enabled) return;

  const { maxMessages, interval, action, timeoutDuration } = config.antiSpam;
  const key = `${message.guild.id}:${message.author.id}`;
  const count = track(messageTracker, key, interval);

  if (count >= maxMessages) {
    messageTracker.set(key, []); // reset
    const member = message.guild.members.cache.get(message.author.id);
    if (!member) return;

    // Ignorer les membres staff
    if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const reason = `Anti-Spam : ${count} messages en ${interval / 1000}s`;
    await takeAction(message.guild, member, action, reason, timeoutDuration);

    await sendLog(message.guild, config, raidEmbed("Anti-Spam déclenché", `**${message.author.tag}** a envoyé ${count} messages en ${interval / 1000}s.`, [
      { name: "👤 Membre", value: `${message.author.tag} (${message.author.id})`, inline: true },
      { name: "⚡ Action", value: action.toUpperCase(), inline: true },
      { name: "📍 Salon", value: `${message.channel}`, inline: true },
    ]));
  }
}

// ═══════════════════════════════════════════════════════════════
//                    ANTI-MENTION SPAM
// ═══════════════════════════════════════════════════════════════
export async function checkAntiMention(message) {
  if (!message.guild || message.author.bot) return;
  const config = getConfig(message.guild.id);
  if (!config.enabled || !config.antiMention.enabled) return;

  const mentionCount = message.mentions.users.size + message.mentions.roles.size;
  const { maxMentions, action, timeoutDuration } = config.antiMention;

  if (mentionCount >= maxMentions) {
    const member = message.guild.members.cache.get(message.author.id);
    if (!member) return;
    if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    try { await message.delete(); } catch (_) {}

    const reason = `Anti-Mention : ${mentionCount} mentions dans un message`;
    await takeAction(message.guild, member, action, reason, timeoutDuration);

    await sendLog(message.guild, config, raidEmbed("Anti-Mention déclenché", `**${message.author.tag}** a mentionné ${mentionCount} personnes/rôles.`, [
      { name: "👤 Membre", value: `${message.author.tag} (${message.author.id})`, inline: true },
      { name: "⚡ Action", value: action.toUpperCase(), inline: true },
      { name: "🔢 Mentions", value: `${mentionCount}`, inline: true },
    ]));
  }
}

// ═══════════════════════════════════════════════════════════════
//                    ANTI-JOIN RAID
// ═══════════════════════════════════════════════════════════════
export async function checkAntiJoin(member) {
  const config = getConfig(member.guild.id);
  if (!config.enabled || !config.antiJoin.enabled) return;

  const { maxJoins, interval, action } = config.antiJoin;
  const count = track(joinTracker, member.guild.id, interval);

  if (count >= maxJoins) {
    const reason = `Anti-Join Raid : ${count} joins en ${interval / 1000}s`;

    if (action === "lockdown") {
      // Mode lockdown : verrouille le serveur
      await sendLog(member.guild, config, raidEmbed("🔒 LOCKDOWN ACTIVÉ", `**${count}** membres ont rejoint en moins de ${interval / 1000}s.\nLe serveur est en mode lockdown.`));
      // Essayer de kick le nouveau membre
      try { if (member.kickable) await member.kick(reason); } catch (_) {}
    } else {
      await takeAction(member.guild, member, action, reason);
      await sendLog(member.guild, config, raidEmbed("Anti-Join déclenché", `**${count}** membres ont rejoint en ${interval / 1000}s.`, [
        { name: "👤 Dernier join", value: `${member.user.tag} (${member.id})`, inline: true },
        { name: "⚡ Action", value: action.toUpperCase(), inline: true },
        { name: "🔢 Joins détectés", value: `${count}`, inline: true },
      ]));
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//                    ANTI-NUKE (suppressions)
// ═══════════════════════════════════════════════════════════════
export async function checkAntiNuke(guild, auditEvent, targetName) {
  const config = getConfig(guild.id);
  if (!config.enabled || !config.antiNuke.enabled) return;

  const { maxDeletions, interval, action } = config.antiNuke;
  const count = track(deletionTracker, guild.id, interval);

  if (count >= maxDeletions) {
    deletionTracker.set(guild.id, []); // reset

    // Récupérer le responsable via les audit logs
    try {
      const logs = await guild.fetchAuditLogs({ limit: 1, type: auditEvent });
      const entry = logs.entries.first();
      if (entry && entry.executor) {
        const executor = await guild.members.fetch(entry.executor.id).catch(() => null);
        if (executor && !executor.permissions.has(PermissionFlagsBits.Administrator)) {
          const reason = `Anti-Nuke : ${count} suppressions en ${interval / 1000}s`;
          await takeAction(guild, executor, action, reason);
          await sendLog(guild, config, raidEmbed("⚠️ ANTI-NUKE déclenché", `**${count}** suppressions détectées en ${interval / 1000}s !`, [
            { name: "🦹 Exécuteur", value: `${entry.executor.tag} (${entry.executor.id})`, inline: true },
            { name: "⚡ Action", value: action.toUpperCase(), inline: true },
            { name: "🗑️ Suppression", value: targetName || "Inconnue", inline: true },
          ]));
        }
      }
    } catch (_) {}
  }
}

// ═══════════════════════════════════════════════════════════════
//                    ANTI-BOT
// ═══════════════════════════════════════════════════════════════
export async function checkAntiBot(member) {
  if (!member.user.bot) return;
  const config = getConfig(member.guild.id);
  if (!config.enabled || !config.antiBot.enabled) return;

  const { action } = config.antiBot;

  // Vérifier si un admin a ajouté le bot via audit logs
  try {
    const logs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
    const entry = logs.entries.first();
    if (entry && entry.executor) {
      const executor = await member.guild.members.fetch(entry.executor.id).catch(() => null);
      if (executor && !executor.permissions.has(PermissionFlagsBits.Administrator)) {
        const reason = `Anti-Bot : ajout de bot non autorisé`;
        await takeAction(member.guild, member, action, reason); // kick/ban le bot
        await takeAction(member.guild, executor, action, reason); // et l'exécuteur
        await sendLog(member.guild, config, raidEmbed("Anti-Bot déclenché", `Le bot **${member.user.tag}** a été ajouté par un non-admin.`, [
          { name: "🤖 Bot ajouté", value: `${member.user.tag}`, inline: true },
          { name: "👤 Ajouté par", value: `${entry.executor.tag}`, inline: true },
          { name: "⚡ Action", value: action.toUpperCase(), inline: true },
        ]));
      }
    }
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════
//                    COMMANDE /antiraid
// ═══════════════════════════════════════════════════════════════
export async function handleAntiRaid(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;
  const config = getConfig(guildId);

  const infoEmbed = (title, desc, fields = []) =>
    new EmbedBuilder().setColor(0xff4500).setTitle(title).setDescription(desc).addFields(fields).setTimestamp();

  // ── status ──
  if (sub === "status") {
    const statusEmbed = new EmbedBuilder()
      .setColor(config.enabled ? COLORS.success : COLORS.error)
      .setTitle("🛡️ Anti-Raid — Statut")
      .setDescription(config.enabled ? "✅ **Anti-Raid ACTIVÉ**" : "❌ **Anti-Raid DÉSACTIVÉ**")
      .addFields(
        { name: "📨 Anti-Spam", value: config.antiSpam.enabled ? `✅ Max ${config.antiSpam.maxMessages} msgs/${config.antiSpam.interval / 1000}s → ${config.antiSpam.action}` : "❌ Désactivé", inline: false },
        { name: "👥 Anti-Join Raid", value: config.antiJoin.enabled ? `✅ Max ${config.antiJoin.maxJoins} joins/${config.antiJoin.interval / 1000}s → ${config.antiJoin.action}` : "❌ Désactivé", inline: false },
        { name: "💣 Anti-Nuke", value: config.antiNuke.enabled ? `✅ Max ${config.antiNuke.maxDeletions} suppressions/${config.antiNuke.interval / 1000}s → ${config.antiNuke.action}` : "❌ Désactivé", inline: false },
        { name: "🤖 Anti-Bot", value: config.antiBot.enabled ? `✅ → ${config.antiBot.action}` : "❌ Désactivé", inline: false },
        { name: "📢 Anti-Mention", value: config.antiMention.enabled ? `✅ Max ${config.antiMention.maxMentions} mentions → ${config.antiMention.action}` : "❌ Désactivé", inline: false },
        { name: "📋 Salon de logs", value: config.logChannelId ? `<#${config.logChannelId}>` : "Non défini", inline: false },
      )
      .setTimestamp();
    return interaction.reply({ embeds: [statusEmbed] });
  }

  // ── activer ──
  if (sub === "activer") {
    config.enabled = true;
    setConfig(guildId, config);
    return interaction.reply({ embeds: [infoEmbed("✅ Anti-Raid activé", "Le système anti-raid est maintenant **ACTIF**.\nTous les modules configurés sont opérationnels.")] });
  }

  // ── désactiver ──
  if (sub === "désactiver") {
    config.enabled = false;
    setConfig(guildId, config);
    return interaction.reply({ embeds: [infoEmbed("❌ Anti-Raid désactivé", "Le système anti-raid est maintenant **DÉSACTIVÉ**.")] });
  }

  // ── logs ──
  if (sub === "logs") {
    const salon = interaction.options.getChannel("salon");
    config.logChannelId = salon.id;
    setConfig(guildId, config);
    return interaction.reply({ embeds: [infoEmbed("📋 Salon de logs défini", `Les alertes anti-raid seront envoyées dans ${salon}.`)] });
  }

  // ── anti-spam config ──
  if (sub === "spam") {
    const actif = interaction.options.getBoolean("actif");
    const maxMsgs = interaction.options.getInteger("max_messages");
    const intervalSec = interaction.options.getInteger("intervalle");
    const action = interaction.options.getString("action");

    if (actif !== null) config.antiSpam.enabled = actif;
    if (maxMsgs) config.antiSpam.maxMessages = maxMsgs;
    if (intervalSec) config.antiSpam.interval = intervalSec * 1000;
    if (action) config.antiSpam.action = action;
    setConfig(guildId, config);

    return interaction.reply({
      embeds: [infoEmbed("📨 Anti-Spam configuré", null, [
        { name: "Actif", value: config.antiSpam.enabled ? "✅ Oui" : "❌ Non", inline: true },
        { name: "Max messages", value: `${config.antiSpam.maxMessages}`, inline: true },
        { name: "Intervalle", value: `${config.antiSpam.interval / 1000}s`, inline: true },
        { name: "Action", value: config.antiSpam.action.toUpperCase(), inline: true },
      ])],
    });
  }

  // ── anti-join config ──
  if (sub === "join") {
    const actif = interaction.options.getBoolean("actif");
    const maxJoins = interaction.options.getInteger("max_joins");
    const intervalSec = interaction.options.getInteger("intervalle");
    const action = interaction.options.getString("action");

    if (actif !== null) config.antiJoin.enabled = actif;
    if (maxJoins) config.antiJoin.maxJoins = maxJoins;
    if (intervalSec) config.antiJoin.interval = intervalSec * 1000;
    if (action) config.antiJoin.action = action;
    setConfig(guildId, config);

    return interaction.reply({
      embeds: [infoEmbed("👥 Anti-Join configuré", null, [
        { name: "Actif", value: config.antiJoin.enabled ? "✅ Oui" : "❌ Non", inline: true },
        { name: "Max joins", value: `${config.antiJoin.maxJoins}`, inline: true },
        { name: "Intervalle", value: `${config.antiJoin.interval / 1000}s`, inline: true },
        { name: "Action", value: config.antiJoin.action.toUpperCase(), inline: true },
      ])],
    });
  }

  // ── anti-nuke config ──
  if (sub === "nuke") {
    const actif = interaction.options.getBoolean("actif");
    const maxDel = interaction.options.getInteger("max_suppressions");
    const intervalSec = interaction.options.getInteger("intervalle");
    const action = interaction.options.getString("action");

    if (actif !== null) config.antiNuke.enabled = actif;
    if (maxDel) config.antiNuke.maxDeletions = maxDel;
    if (intervalSec) config.antiNuke.interval = intervalSec * 1000;
    if (action) config.antiNuke.action = action;
    setConfig(guildId, config);

    return interaction.reply({
      embeds: [infoEmbed("💣 Anti-Nuke configuré", null, [
        { name: "Actif", value: config.antiNuke.enabled ? "✅ Oui" : "❌ Non", inline: true },
        { name: "Max suppressions", value: `${config.antiNuke.maxDeletions}`, inline: true },
        { name: "Intervalle", value: `${config.antiNuke.interval / 1000}s`, inline: true },
        { name: "Action", value: config.antiNuke.action.toUpperCase(), inline: true },
      ])],
    });
  }

  // ── anti-bot config ──
  if (sub === "bot") {
    const actif = interaction.options.getBoolean("actif");
    const action = interaction.options.getString("action");

    if (actif !== null) config.antiBot.enabled = actif;
    if (action) config.antiBot.action = action;
    setConfig(guildId, config);

    return interaction.reply({
      embeds: [infoEmbed("🤖 Anti-Bot configuré", null, [
        { name: "Actif", value: config.antiBot.enabled ? "✅ Oui" : "❌ Non", inline: true },
        { name: "Action", value: config.antiBot.action.toUpperCase(), inline: true },
      ])],
    });
  }

  // ── anti-mention config ──
  if (sub === "mention") {
    const actif = interaction.options.getBoolean("actif");
    const maxMentions = interaction.options.getInteger("max_mentions");
    const action = interaction.options.getString("action");

    if (actif !== null) config.antiMention.enabled = actif;
    if (maxMentions) config.antiMention.maxMentions = maxMentions;
    if (action) config.antiMention.action = action;
    setConfig(guildId, config);

    return interaction.reply({
      embeds: [infoEmbed("📢 Anti-Mention configuré", null, [
        { name: "Actif", value: config.antiMention.enabled ? "✅ Oui" : "❌ Non", inline: true },
        { name: "Max mentions", value: `${config.antiMention.maxMentions}`, inline: true },
        { name: "Action", value: config.antiMention.action.toUpperCase(), inline: true },
      ])],
    });
  }
}
