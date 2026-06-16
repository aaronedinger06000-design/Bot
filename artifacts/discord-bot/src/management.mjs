import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

// Stockage en mémoire des avertissements (par guild > user)
const warningsStore = new Map();

function getWarnings(guildId, userId) {
  const key = `${guildId}:${userId}`;
  return warningsStore.get(key) || [];
}
function addWarning(guildId, userId, warn) {
  const key = `${guildId}:${userId}`;
  const list = warningsStore.get(key) || [];
  list.push({ ...warn, date: new Date().toISOString() });
  warningsStore.set(key, list);
  return list;
}
function clearWarnings(guildId, userId) {
  warningsStore.delete(`${guildId}:${userId}`);
}

// Couleurs embed
const COLORS = {
  success: 0x2ecc71,
  error: 0xe74c3c,
  info: 0x3498db,
  warn: 0xf39c12,
  mod: 0xff6600,
};

function embed(color, title, description, fields = []) {
  const e = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setTimestamp();
  if (description) e.setDescription(description);
  if (fields.length) e.addFields(fields);
  return e;
}

// ─── Vérification permissions bot ─────────────────────────────────
function checkBotPerm(guild, perm) {
  return guild.members.me?.permissions.has(perm);
}

// ══════════════════════════════════════════════════════════════════
//                     HANDLERS DE COMMANDES
// ══════════════════════════════════════════════════════════════════

export async function handleKick(interaction) {
  const target = interaction.options.getMember("membre");
  const raison = interaction.options.getString("raison") || "Aucune raison fournie";

  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });
  if (!target.kickable) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Impossible", "Je ne peux pas kick ce membre (rôle supérieur au mien).")], ephemeral: true });
  if (target.id === interaction.user.id) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Tu ne peux pas te kick toi-même.")], ephemeral: true });

  try {
    await target.send({ embeds: [embed(COLORS.warn, "🥾 Tu as été expulsé", `Tu as été expulsé de **${interaction.guild.name}**.\n**Raison :** ${raison}`)] }).catch(() => {});
    await target.kick(raison);
    await interaction.reply({
      embeds: [embed(COLORS.mod, "🥾 Membre expulsé", null, [
        { name: "👤 Membre", value: `${target.user.tag} (${target.id})`, inline: true },
        { name: "👮 Modérateur", value: interaction.user.tag, inline: true },
        { name: "📝 Raison", value: raison, inline: false },
      ])],
    });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleBan(interaction) {
  const target = interaction.options.getMember("membre") || interaction.options.getUser("membre");
  const raison = interaction.options.getString("raison") || "Aucune raison fournie";
  const supprMessages = interaction.options.getInteger("suppr_messages") || 0;

  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });
  const targetId = target.id || target.user?.id;
  if (targetId === interaction.user.id) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Tu ne peux pas te bannir toi-même.")], ephemeral: true });

  try {
    if (target.bannable !== undefined && !target.bannable) {
      return interaction.reply({ embeds: [embed(COLORS.error, "❌ Impossible", "Je ne peux pas bannir ce membre.")], ephemeral: true });
    }
    if (target.send) await target.send({ embeds: [embed(COLORS.error, "🔨 Tu as été banni", `Tu as été banni de **${interaction.guild.name}**.\n**Raison :** ${raison}`)] }).catch(() => {});
    await interaction.guild.members.ban(targetId, { reason: raison, deleteMessageSeconds: supprMessages * 86400 });
    await interaction.reply({
      embeds: [embed(COLORS.error, "🔨 Membre banni", null, [
        { name: "👤 Membre", value: `${target.tag || target.user?.tag} (${targetId})`, inline: true },
        { name: "👮 Modérateur", value: interaction.user.tag, inline: true },
        { name: "📝 Raison", value: raison, inline: false },
        { name: "🗑️ Messages supprimés", value: `${supprMessages} jour(s)`, inline: true },
      ])],
    });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleUnban(interaction) {
  const userId = interaction.options.getString("user_id");
  const raison = interaction.options.getString("raison") || "Aucune raison fournie";

  try {
    const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
    if (!ban) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Introuvable", "Cet utilisateur n'est pas banni.")], ephemeral: true });
    await interaction.guild.members.unban(userId, raison);
    await interaction.reply({
      embeds: [embed(COLORS.success, "✅ Membre débanni", null, [
        { name: "👤 Utilisateur", value: `${ban.user.tag} (${userId})`, inline: true },
        { name: "👮 Modérateur", value: interaction.user.tag, inline: true },
        { name: "📝 Raison", value: raison, inline: false },
      ])],
    });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", `ID invalide ou utilisateur non banni.\n${err.message}`)], ephemeral: true });
  }
}

export async function handleTimeout(interaction) {
  const target = interaction.options.getMember("membre");
  const duree = interaction.options.getInteger("durée"); // en minutes
  const raison = interaction.options.getString("raison") || "Aucune raison fournie";

  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });
  if (!target.moderatable) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Impossible", "Je ne peux pas mute ce membre.")], ephemeral: true });

  try {
    const ms = duree * 60 * 1000;
    await target.timeout(ms, raison);
    await target.send({ embeds: [embed(COLORS.warn, "🔇 Tu as été mute", `Tu as été mis en sourdine sur **${interaction.guild.name}** pour **${duree} minute(s)**.\n**Raison :** ${raison}`)] }).catch(() => {});
    await interaction.reply({
      embeds: [embed(COLORS.warn, "🔇 Membre mute", null, [
        { name: "👤 Membre", value: `${target.user.tag} (${target.id})`, inline: true },
        { name: "👮 Modérateur", value: interaction.user.tag, inline: true },
        { name: "⏱️ Durée", value: `${duree} minute(s)`, inline: true },
        { name: "📝 Raison", value: raison, inline: false },
      ])],
    });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleUntimeout(interaction) {
  const target = interaction.options.getMember("membre");
  const raison = interaction.options.getString("raison") || "Aucune raison fournie";

  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });
  if (!target.isCommunicationDisabled()) return interaction.reply({ embeds: [embed(COLORS.info, "ℹ️ Info", "Ce membre n'est pas mute.")], ephemeral: true });

  try {
    await target.timeout(null, raison);
    await interaction.reply({
      embeds: [embed(COLORS.success, "🔊 Membre unmute", null, [
        { name: "👤 Membre", value: `${target.user.tag}`, inline: true },
        { name: "👮 Modérateur", value: interaction.user.tag, inline: true },
        { name: "📝 Raison", value: raison, inline: false },
      ])],
    });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleWarn(interaction) {
  const target = interaction.options.getMember("membre");
  const raison = interaction.options.getString("raison");

  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });
  if (target.id === interaction.user.id) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Tu ne peux pas te warn toi-même.")], ephemeral: true });

  const warns = addWarning(interaction.guild.id, target.id, { raison, mod: interaction.user.tag });

  await target.send({
    embeds: [embed(COLORS.warn, "⚠️ Avertissement reçu", `Tu as reçu un avertissement sur **${interaction.guild.name}**.\n**Raison :** ${raison}\n**Total avertissements :** ${warns.length}`)],
  }).catch(() => {});

  await interaction.reply({
    embeds: [embed(COLORS.warn, "⚠️ Avertissement émis", null, [
      { name: "👤 Membre", value: `${target.user.tag} (${target.id})`, inline: true },
      { name: "👮 Modérateur", value: interaction.user.tag, inline: true },
      { name: "📝 Raison", value: raison, inline: false },
      { name: "⚠️ Total warns", value: `${warns.length}`, inline: true },
    ])],
  });
}

export async function handleWarns(interaction) {
  const target = interaction.options.getMember("membre") || interaction.member;
  const warns = getWarnings(interaction.guild.id, target.id);

  if (warns.length === 0) {
    return interaction.reply({ embeds: [embed(COLORS.success, "✅ Aucun avertissement", `**${target.user.tag}** n'a aucun avertissement.`)] });
  }

  const warnList = warns.map((w, i) => `\`${i + 1}.\` **${w.raison}** — par ${w.mod} le ${new Date(w.date).toLocaleDateString("fr-FR")}`).join("\n");

  await interaction.reply({
    embeds: [embed(COLORS.warn, `⚠️ Avertissements de ${target.user.tag}`, warnList, [
      { name: "Total", value: `${warns.length} avertissement(s)`, inline: true },
    ])],
  });
}

export async function handleClearwarns(interaction) {
  const target = interaction.options.getMember("membre");
  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });

  clearWarnings(interaction.guild.id, target.id);
  await interaction.reply({
    embeds: [embed(COLORS.success, "✅ Avertissements effacés", `Tous les avertissements de **${target.user.tag}** ont été supprimés.`)],
  });
}

export async function handleClear(interaction) {
  const nombre = interaction.options.getInteger("nombre");
  const salon = interaction.options.getChannel("salon") || interaction.channel;

  if (nombre < 1 || nombre > 100) {
    return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Le nombre doit être entre 1 et 100.")], ephemeral: true });
  }

  try {
    await interaction.deferReply({ ephemeral: true });
    const deleted = await salon.bulkDelete(nombre, true);
    await interaction.editReply({
      embeds: [embed(COLORS.success, "🗑️ Messages supprimés", `**${deleted.size}** message(s) supprimé(s) dans ${salon}.`)],
    });
  } catch (err) {
    interaction.editReply({ embeds: [embed(COLORS.error, "❌ Erreur", `Impossible de supprimer les messages (peut-être trop anciens).\n${err.message}`)] });
  }
}

export async function handleSlowmode(interaction) {
  const secondes = interaction.options.getInteger("secondes");
  const salon = interaction.options.getChannel("salon") || interaction.channel;

  try {
    await salon.setRateLimitPerUser(secondes);
    const msg = secondes === 0
      ? `Le mode lent a été **désactivé** dans ${salon}.`
      : `Mode lent défini à **${secondes} seconde(s)** dans ${salon}.`;
    await interaction.reply({ embeds: [embed(COLORS.success, "🐌 Slowmode", msg)] });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleLock(interaction) {
  const salon = interaction.options.getChannel("salon") || interaction.channel;
  const raison = interaction.options.getString("raison") || "Salon verrouillé par le staff";

  try {
    await salon.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
      SendMessagesInThreads: false,
    });
    await salon.send({ embeds: [embed(COLORS.error, "🔒 Salon verrouillé", `Ce salon a été verrouillé.\n**Raison :** ${raison}`)] });
    await interaction.reply({ embeds: [embed(COLORS.success, "🔒 Salon verrouillé", `${salon} est maintenant verrouillé.`)], ephemeral: true });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleUnlock(interaction) {
  const salon = interaction.options.getChannel("salon") || interaction.channel;

  try {
    await salon.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null,
      SendMessagesInThreads: null,
    });
    await salon.send({ embeds: [embed(COLORS.success, "🔓 Salon déverrouillé", "Ce salon est de nouveau ouvert.")] });
    await interaction.reply({ embeds: [embed(COLORS.success, "🔓 Salon déverrouillé", `${salon} est maintenant déverrouillé.`)], ephemeral: true });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleRole(interaction) {
  const target = interaction.options.getMember("membre");
  const role = interaction.options.getRole("rôle");

  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });
  if (role.managed) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Impossible", "Ce rôle est géré automatiquement par un bot.")], ephemeral: true });
  if (role.position >= interaction.guild.members.me.roles.highest.position) {
    return interaction.reply({ embeds: [embed(COLORS.error, "❌ Impossible", "Ce rôle est supérieur ou égal au mien.")], ephemeral: true });
  }

  try {
    const hasRole = target.roles.cache.has(role.id);
    if (hasRole) {
      await target.roles.remove(role);
      await interaction.reply({ embeds: [embed(COLORS.warn, "➖ Rôle retiré", `Le rôle **${role.name}** a été retiré à ${target.user.tag}.`)] });
    } else {
      await target.roles.add(role);
      await interaction.reply({ embeds: [embed(COLORS.success, "➕ Rôle ajouté", `Le rôle **${role.name}** a été donné à ${target.user.tag}.`)] });
    }
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}

export async function handleUserinfo(interaction) {
  const target = interaction.options.getMember("membre") || interaction.member;
  const user = target.user;

  const roles = target.roles.cache
    .filter((r) => r.id !== interaction.guild.id)
    .sort((a, b) => b.position - a.position)
    .map((r) => `<@&${r.id}>`)
    .slice(0, 10)
    .join(" ") || "Aucun";

  const joinedAt = target.joinedAt ? `<t:${Math.floor(target.joinedAt / 1000)}:R>` : "Inconnu";
  const createdAt = `<t:${Math.floor(user.createdAt / 1000)}:R>`;

  const e = new EmbedBuilder()
    .setColor(target.displayHexColor || COLORS.info)
    .setTitle(`👤 Infos — ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "🆔 ID", value: user.id, inline: true },
      { name: "📛 Pseudo serveur", value: target.displayName, inline: true },
      { name: "🤖 Bot", value: user.bot ? "Oui" : "Non", inline: true },
      { name: "📅 Compte créé", value: createdAt, inline: true },
      { name: "📥 Rejoint le serveur", value: joinedAt, inline: true },
      { name: "🎭 Rôles", value: roles, inline: false },
    )
    .setTimestamp();

  const warns = getWarnings(interaction.guild.id, user.id);
  if (warns.length > 0) e.addFields({ name: "⚠️ Avertissements", value: `${warns.length}`, inline: true });

  await interaction.reply({ embeds: [e] });
}

export async function handleServerinfo(interaction) {
  const guild = interaction.guild;
  await guild.fetch();

  const channels = guild.channels.cache;
  const textCount = channels.filter((c) => c.type === 0).size;
  const voiceCount = channels.filter((c) => c.type === 2).size;
  const categoryCount = channels.filter((c) => c.type === 4).size;

  const createdAt = `<t:${Math.floor(guild.createdAt / 1000)}:R>`;
  const owner = await guild.fetchOwner().catch(() => null);

  const e = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`🏙️ Infos — ${guild.name}`)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .addFields(
      { name: "🆔 ID", value: guild.id, inline: true },
      { name: "👑 Owner", value: owner ? owner.user.tag : "Inconnu", inline: true },
      { name: "📅 Créé", value: createdAt, inline: true },
      { name: "👥 Membres", value: `${guild.memberCount}`, inline: true },
      { name: "🎭 Rôles", value: `${guild.roles.cache.size}`, inline: true },
      { name: "💬 Salons texte", value: `${textCount}`, inline: true },
      { name: "🔊 Salons vocaux", value: `${voiceCount}`, inline: true },
      { name: "📁 Catégories", value: `${categoryCount}`, inline: true },
      { name: "🌍 Région", value: guild.preferredLocale || "Inconnue", inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [e] });
}

export async function handleWhitelist(interaction) {
  const target = interaction.options.getMember("membre");
  if (!target) return interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", "Membre introuvable.")], ephemeral: true });

  const whitelistRole = interaction.guild.roles.cache.find((r) => r.name === "En Whitelist");
  const citizenRole = interaction.guild.roles.cache.find((r) => r.name === "Citoyen");

  try {
    const added = [];
    if (whitelistRole) { await target.roles.add(whitelistRole); added.push("En Whitelist"); }
    if (citizenRole) { await target.roles.add(citizenRole); added.push("Citoyen"); }

    await target.send({
      embeds: [embed(COLORS.success, "✅ Whitelist accordée", `Félicitations ! Tu as été whitelisté sur **${interaction.guild.name}**.\nTu peux maintenant accéder au serveur de jeu. Bienvenue dans la Révolution !`)],
    }).catch(() => {});

    await interaction.reply({
      embeds: [embed(COLORS.success, "✅ Membre whitelisté", null, [
        { name: "👤 Membre", value: `${target.user.tag}`, inline: true },
        { name: "👮 Par", value: interaction.user.tag, inline: true },
        { name: "🎭 Rôles ajoutés", value: added.join(", ") || "Aucun rôle trouvé", inline: false },
      ])],
    });
  } catch (err) {
    interaction.reply({ embeds: [embed(COLORS.error, "❌ Erreur", err.message)], ephemeral: true });
  }
}
