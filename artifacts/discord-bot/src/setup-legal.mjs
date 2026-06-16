import { PermissionFlagsBits, ChannelType } from "discord.js";
import { LEGAL_SERVER_CONFIG, ALL_STAFF, STAFF_ROLES, CIVIL_ROLES } from "./config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rateLimitSafe(fn, label = "") {
  let attempts = 0;
  while (attempts < 5) {
    try {
      const result = await fn();
      await sleep(300);
      return result;
    } catch (err) {
      if (err.code === 429 || err.status === 429) {
        const retryAfter = (err.retry_after || 1) * 1000 + 500;
        console.log(`⏳ Rate limit "${label}", attente ${retryAfter}ms...`);
        await sleep(retryAfter);
        attempts++;
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Trop de tentatives: ${label}`);
}

export async function setupLegalServer(guild, interaction) {
  const editReply = async (content) => {
    try { await interaction.editReply({ content }); } catch (_) {}
  };

  try {
    await editReply("🏛️ **Configuration du serveur Légal Révolution RP...**\n\n`[1/4]` 🗑️ Nettoyage en cours...");

    // 1. Supprimer salons et rôles existants
    for (const ch of [...guild.channels.cache.values()]) {
      try { await rateLimitSafe(() => ch.delete(), `delete ${ch.name}`); } catch (_) {}
    }
    await guild.roles.fetch();
    for (const role of [...guild.roles.cache.values()]) {
      if (role.name === "@everyone" || role.managed) continue;
      try { await rateLimitSafe(() => role.delete(), `delete role ${role.name}`); } catch (_) {}
    }

    await editReply("🏛️ **Configuration du serveur Légal Révolution RP...**\n\n`[2/4]` 🎭 Création des rôles staff...");

    // 2. Créer les rôles staff (pour les permissions des catégories privées)
    const roleMap = {};
    const allRoleDefs = [...STAFF_ROLES, ...CIVIL_ROLES].sort((a, b) => a.position - b.position);
    for (const roleDef of allRoleDefs) {
      const perms = roleDef.permissions.reduce((acc, p) => acc | p, 0n);
      const role = await rateLimitSafe(
        () => guild.roles.create({
          name: roleDef.name,
          color: roleDef.color,
          hoist: roleDef.hoist,
          mentionable: roleDef.mentionable ?? false,
          permissions: perms,
        }),
        `create role ${roleDef.name}`
      );
      roleMap[roleDef.name] = role;
    }

    await editReply("🏛️ **Configuration du serveur Légal Révolution RP...**\n\n`[3/4]` 📁 Création des catégories et salons...");

    // 3. Créer catégories et salons
    const everyoneRole = guild.roles.everyone;
    let catCount = 0;

    for (const catDef of LEGAL_SERVER_CONFIG.categories) {
      catCount++;
      await editReply(
        `🏛️ **Configuration du serveur Légal Révolution RP...**\n\n\`[3/4]\` 📁 Catégories... (${catCount}/${LEGAL_SERVER_CONFIG.categories.length})\n> **${catDef.name}**`
      );

      const permissionOverwrites = [];

      if (catDef.private) {
        permissionOverwrites.push({ id: everyoneRole.id, deny: [PermissionFlagsBits.ViewChannel] });
        for (const roleName of (catDef.privateRoles || [])) {
          const role = roleMap[roleName];
          if (role) {
            permissionOverwrites.push({
              id: role.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            });
          }
        }
      }

      const category = await rateLimitSafe(
        () => guild.channels.create({
          name: catDef.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites,
        }),
        `category ${catDef.name}`
      );

      for (const chanDef of catDef.channels) {
        const isVoice = chanDef.type === "voice";
        const opts = {
          name: chanDef.name,
          type: isVoice ? ChannelType.GuildVoice : ChannelType.GuildText,
          parent: category.id,
        };
        if (!isVoice && chanDef.topic) opts.topic = chanDef.topic;

        // Salons en lecture seule
        if (chanDef.readOnly && !catDef.private) {
          opts.permissionOverwrites = [
            { id: everyoneRole.id, deny: [PermissionFlagsBits.SendMessages], allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] },
          ];
          for (const staffName of ALL_STAFF) {
            const role = roleMap[staffName];
            if (role) opts.permissionOverwrites.push({ id: role.id, allow: [PermissionFlagsBits.SendMessages] });
          }
        }

        await rateLimitSafe(() => guild.channels.create(opts), `channel ${chanDef.name}`);
      }
    }

    await editReply("🏛️ **Configuration du serveur Légal Révolution RP...**\n\n`[4/4]` 📨 Messages d'accueil...");

    // 4. Message dans le salon règlement
    const regCh = guild.channels.cache.find((c) => c.name === "📌┃règlement-légal");
    if (regCh) {
      await rateLimitSafe(() => regCh.send({
        content: `# 📜 Règlement — Révolution RP Légal\n\n**Bienvenue sur le serveur légal de Révolution RP !**\n\nCe serveur est dédié aux **services légaux** de la ville. Il regroupe les liens vers les serveurs Discord officiels de chaque corps de métier.\n\n## 📋 Règles\n\`1.\` Respectez tous les membres.\n\`2.\` Ne postez que les liens officiels dans les salons métiers.\n\`3.\` Toute publicité non autorisée est interdite.\n\`4.\` Le staff se réserve le droit de modifier les accès à tout moment.\n\n## 🏛️ Services disponibles\n🚔 **Police Nationale**\n🚑 **SAMU / Urgences**\n🚒 **Pompiers**\n🛃 **Douanes**\n⚖️ **Justice / Tribunal**\n🏥 **Hôpital**\n🏛️ **Mairie / Gouvernement**\n\n*— La Direction de Révolution RP*`,
      }), "send règlement légal");
    }

    const guideCh = guild.channels.cache.find((c) => c.name === "📋┃guide-recrutement");
    if (guideCh) {
      await rateLimitSafe(() => guideCh.send({
        content: `# 📋 Guide — Rejoindre un service légal\n\n## Comment rejoindre un métier légal ?\n\n**1.** Consulte les salons ci-dessous pour trouver le serveur Discord du métier qui t'intéresse.\n**2.** Rejoins le serveur Discord du corps de métier via le lien fourni.\n**3.** Lis le règlement interne du corps de métier.\n**4.** Dépose ta candidature directement sur leur serveur.\n**5.** Attends la réponse du responsable recrutement.\n\n## 🏛️ Corps de métier disponibles\n🚔 **Police Nationale** — Maintien de l'ordre\n🚑 **SAMU / Urgences** — Secours médicaux\n🚒 **Pompiers** — Lutte incendie & secours\n🛃 **Douanes** — Contrôle des frontières\n⚖️ **Justice** — Juges, procureurs, avocats\n🏥 **Hôpital** — Médecins, infirmiers\n🏛️ **Mairie** — Gouvernement municipal\n\n*Les liens des serveurs sont dans la catégorie **Services Légaux**.*`,
      }), "send guide recrutement");
    }

    const totalSalons = LEGAL_SERVER_CONFIG.categories.reduce((a, c) => a + c.channels.length, 0);
    await editReply(
      `✅ **Serveur Légal Révolution RP configuré !**\n\n📊 **Résumé :**\n> 📁 **${LEGAL_SERVER_CONFIG.categories.length} catégories** créées\n> 💬 **${totalSalons} salons** créés\n> 🎭 **${allRoleDefs.length} rôles** créés\n\n🏛️ Le serveur légal est prêt. Ajoutez les liens des serveurs métiers dans chaque salon ! 🚔🚑🚒`
    );
    console.log("✅ Serveur légal configuré !");
  } catch (err) {
    console.error("❌ Erreur setup légal:", err);
    await editReply(`❌ **Erreur :** ${err.message}\n\nVérifiez que le bot a la permission **Administrateur**.`);
  }
}
