import { PermissionFlagsBits, ChannelType } from "discord.js";
import { MAIN_SERVER_CONFIG, ALL_ROLES, STAFF_ROLES, CIVIL_ROLES, ALL_STAFF, MID_STAFF, SENIOR_STAFF } from "./config.mjs";

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

export async function setupServer(guild, interaction) {
  const editReply = async (content) => {
    try { await interaction.editReply({ content }); } catch (_) {}
  };

  try {
    await editReply("🚀 **Configuration de Révolution RP lancée !**\n\n`[1/5]` 🗑️ Suppression des salons et rôles existants...");

    // 1. Supprimer tous les salons
    for (const ch of [...guild.channels.cache.values()]) {
      try { await rateLimitSafe(() => ch.delete(), `delete ${ch.name}`); } catch (_) {}
    }

    // 2. Supprimer tous les rôles existants
    await guild.roles.fetch();
    for (const role of [...guild.roles.cache.values()]) {
      if (role.name === "@everyone" || role.managed) continue;
      try { await rateLimitSafe(() => role.delete(), `delete role ${role.name}`); } catch (_) {}
    }

    await editReply("🚀 **Configuration de Révolution RP lancée !**\n\n`[2/5]` 🎭 Création de la hiérarchie staff & rôles...");

    // 3. Créer tous les rôles avec leurs permissions
    const roleMap = {};
    const sortedRoles = [...ALL_ROLES].sort((a, b) => a.position - b.position);

    for (const roleDef of sortedRoles) {
      // Calcul des permissions en BigInt
      const perms = (roleDef.permissions || []).reduce((acc, p) => acc | p, 0n);

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
      console.log(`✅ Rôle: ${roleDef.name}`);
    }

    await editReply("🚀 **Configuration de Révolution RP lancée !**\n\n`[3/5]` 📁 Création des catégories et salons...");

    // 4. Créer les catégories et salons
    const everyoneRole = guild.roles.everyone;
    let catCount = 0;

    for (const catDef of MAIN_SERVER_CONFIG.categories) {
      catCount++;
      await editReply(
        `🚀 **Configuration de Révolution RP lancée !**\n\n\`[3/5]\` 📁 Catégories... (${catCount}/${MAIN_SERVER_CONFIG.categories.length})\n> **${catDef.name}**`
      );

      const permissionOverwrites = [];

      if (catDef.private) {
        // Catégorie privée : masquée pour tout le monde
        permissionOverwrites.push({ id: everyoneRole.id, deny: [PermissionFlagsBits.ViewChannel] });

        // Accès aux rôles autorisés
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

      // Créer les salons dans la catégorie
      for (const chanDef of catDef.channels) {
        const isVoice = chanDef.type === "voice";
        const channelOpts = {
          name: chanDef.name,
          type: isVoice ? ChannelType.GuildVoice : ChannelType.GuildText,
          parent: category.id,
        };

        if (!isVoice && chanDef.topic) channelOpts.topic = chanDef.topic;

        // Salons en lecture seule pour @everyone
        if (chanDef.readOnly && !catDef.private) {
          channelOpts.permissionOverwrites = [
            {
              id: everyoneRole.id,
              deny: [PermissionFlagsBits.SendMessages],
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
            },
          ];
          // Le staff peut écrire
          for (const staffName of ALL_STAFF) {
            const role = roleMap[staffName];
            if (role) {
              channelOpts.permissionOverwrites.push({
                id: role.id,
                allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.MentionEveryone],
              });
            }
          }
        }

        await rateLimitSafe(() => guild.channels.create(channelOpts), `channel ${chanDef.name}`);
        console.log(`  ✅ Salon: ${chanDef.name}`);
      }
    }

    await editReply("🚀 **Configuration de Révolution RP lancée !**\n\n`[4/5]` 📨 Envoi des messages d'accueil et règlements...");

    // 5. Envoyer les messages dans les salons clés
    const regChannel = guild.channels.cache.find((c) => c.name === "📌┃règlement");
    if (regChannel) {
      await rateLimitSafe(() => regChannel.send({
        content: `# 📜 Règlement Officiel — Révolution RP\n\n**Bienvenue sur Révolution RP !** Ce règlement est à lire entièrement avant toute participation.\n\n## 🔹 Règles Générales\n\`1.\` Respectez tous les membres. Toute insulte ou harcèlement mène à un bannissement immédiat.\n\`2.\` Le langage offensant excessif est interdit hors des zones dédiées.\n\`3.\` Aucune publicité non autorisée par la direction.\n\`4.\` Contenu NSFW, choquant ou illégal strictement interdit.\n\`5.\` Un seul compte Discord par personne. Le multi-compte est banni.\n\n## 🎭 Règles RP\n\`6.\` **No Power Gaming** — Interdiction de forcer des actions sur d'autres joueurs.\n\`7.\` **No Meta Gaming** — Infos hors-jeu ne doivent pas influencer le RP.\n\`8.\` **No RDM** — Tuer sans raison RP valable est interdit.\n\`9.\` **No VDM** — Écraser quelqu'un sans raison RP est interdit.\n\`10.\` **No Fail RP** — Rester cohérent avec son personnage en permanence.\n\`11.\` Utilisez **(( ))** pour les échanges hors personnage en jeu.\n\`12.\` **No Combat Logging** — Se déconnecter pendant un scénario RP est interdit.\n\n## 👮 Modération\n\`13.\` Les décisions du staff sont définitives. Contestation uniquement par ticket.\n\`14.\` Toute tentative de contournement de sanction est bannable.\n\`15.\` Sanctions progressives : avertissement → mute → kick → ban.\n\n## 📊 Hiérarchie Staff\n👑 **Owner** › **Fondateur** › **Co-Fondateur** › **Super Administrateur** › **Administrateur** › **Responsable Administrateur** › **Super Modérateur** › **Modérateur** › **Responsable Staff** › **Helper**\n\n*En rejoignant Révolution RP, vous acceptez ce règlement intégralement.*\n\n**— La Direction de Révolution RP**`,
      }), "règlement");
    }

    const welcomeChannel = guild.channels.cache.find((c) => c.name === "👋┃bienvenue");
    if (welcomeChannel) {
      await rateLimitSafe(() => welcomeChannel.send({
        content: `# 🌆 Bienvenue sur **Révolution RP** !\n\n> *La ville ne dort jamais. Ton rôle dans cette révolution commence maintenant.*\n\n**Révolution RP** est un serveur de jeu de rôle immersif et communautaire. Rejoins l'un des nombreux corps de métier, construis ton personnage et participe à la vie de la ville.\n\n## 📋 Pour commencer :\n1️⃣ Lis le <#règlement>\n2️⃣ Présente-toi dans <#présentation>\n3️⃣ Consulte la <#charte-rp>\n4️⃣ Rejoins un service légal via notre **serveur légal**\n\n## 🔑 Nos services :\n🚔 **Police Nationale**\n🚑 **SAMU / Urgences**\n🚒 **Pompiers**\n🛃 **Douanes**\n⚖️ **Justice**\n🏥 **Hôpital**\n🏛️ **Mairie**\n\n*Bonne révolution à tous !* 🌆`,
      }), "bienvenue");
    }

    const faqChannel = guild.channels.cache.find((c) => c.name === "❓┃faq");
    if (faqChannel) {
      await rateLimitSafe(() => faqChannel.send({
        content: `# ❓ FAQ — Révolution RP\n\n**Q : Comment rejoindre un corps de métier ?**\n> Rejoins le serveur légal de Révolution RP, consulte le salon du métier qui t'intéresse et suis le lien vers leur serveur Discord.\n\n**Q : Comment devenir staff ?**\n> Dépose une candidature staff dans le salon dédié. Les recrutements se font selon les besoins.\n\n**Q : Comment signaler un joueur ?**\n> Ouvre un ticket dans la catégorie Support ou utilise le salon signalement.\n\n**Q : C'est quoi le RP ?**\n> Le Role Play (RP) consiste à incarner un personnage fictif dans la ville et interagir avec les autres joueurs en restant dans ce rôle.\n\n**Q : Puis-je avoir plusieurs personnages ?**\n> Un seul personnage par joueur. Le multi-compte est interdit.\n\n**Q : Comment contester une sanction ?**\n> Ouvre un ticket "recours sanction" dans la catégorie Support.\n\n*— Le Staff de Révolution RP*`,
      }), "faq");
    }

    const charteChannel = guild.channels.cache.find((c) => c.name === "🎭┃charte-rp");
    if (charteChannel) {
      await rateLimitSafe(() => charteChannel.send({
        content: `# 🎭 Charte RP — Révolution RP\n\n## Les fondamentaux du RP\n\n**👤 Ton personnage**\nTu incarnes un personnage fictif. Tout ce que tu fais en jeu doit être cohérent avec ce personnage. Ton personnage n'a pas accès à tes connaissances personnelles.\n\n**🗣️ In Character (IC) vs Out Of Character (OOC)**\n- **IC** = Ce que ton personnage dit/fait en jeu\n- **OOC** = Ce que toi, le joueur, dis hors jeu → toujours entre **(( ))**\n\n**⚠️ Comportements interdits**\n❌ **Power Gaming** — Imposer une action sans laisser l'autre réagir\n❌ **Meta Gaming** — Utiliser des infos Discord/voix en jeu\n❌ **God Modding** — Rendre ton personnage invincible ou tout-puissant\n❌ **Combat Logging** — Quitter pendant un combat ou arrestation\n❌ **RDM / VDM** — Tuer ou écraser sans raison RP\n\n**✅ Comportements encouragés**\n✅ Interagir de façon réaliste avec les services (police, SAMU, pompiers)\n✅ Créer des scénarios RP enrichissants pour tout le monde\n✅ Respecter le travail des autres rôlistes\n✅ Signaler les problèmes au staff plutôt que de se faire justice\n\n*Le RP de qualité, c'est l'affaire de tous.*\n**— La Direction de Révolution RP**`,
      }), "charte RP");
    }

    const totalSalons = MAIN_SERVER_CONFIG.categories.reduce((a, c) => a + c.channels.length, 0);

    await editReply(
      `✅ **Révolution RP configuré avec succès !**\n\n📊 **Résumé :**\n> 🎭 **${ALL_ROLES.length} rôles** créés avec permissions adaptées\n> 📁 **${MAIN_SERVER_CONFIG.categories.length} catégories** (dont ${MAIN_SERVER_CONFIG.categories.filter(c => c.private).length} privées staff)\n> 💬 **${totalSalons} salons** créés\n\n👑 Hiérarchie staff : Owner › Fondateur › Co-Fondateur › Super Admin › Admin › Responsable Admin › Super Modo › Modo › Responsable Staff › Helper\n\n🏛️ Pour le serveur légal, utilisez \`/setup-legal\` sur votre serveur légal !`
    );
    console.log("✅ Serveur principal configuré !");
  } catch (err) {
    console.error("❌ Erreur setup:", err);
    await editReply(`❌ **Erreur :** ${err.message}\n\nVérifiez que le bot a la permission **Administrateur**.`);
  }
}
