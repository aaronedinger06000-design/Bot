import { PermissionFlagsBits, ChannelType } from "discord.js";
import { SERVER_CONFIG } from "./config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rateLimitSafe(fn, label = "") {
  let attempts = 0;
  while (attempts < 5) {
    try {
      const result = await fn();
      await sleep(300);
      return result;
    } catch (err) {
      if (err.code === 429 || (err.status === 429)) {
        const retryAfter = (err.retry_after || 1) * 1000 + 500;
        console.log(`⏳ Rate limit sur "${label}", attente ${retryAfter}ms...`);
        await sleep(retryAfter);
        attempts++;
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Trop de tentatives pour: ${label}`);
}

export async function setupServer(guild, interaction) {
  const editReply = async (content) => {
    try {
      await interaction.editReply({ content });
    } catch (_) {}
  };

  try {
    await editReply("🚀 **Configuration du serveur RP Emergencie Hambourg lancée !**\n\n`[1/6]` 🗑️ Suppression des salons et rôles existants...");

    // 1. Supprimer tous les salons existants (sauf celui du bot)
    const channels = [...guild.channels.cache.values()];
    for (const channel of channels) {
      try {
        await rateLimitSafe(() => channel.delete(), `delete channel ${channel.name}`);
      } catch (_) {}
    }

    // 2. Supprimer tous les rôles existants (sauf @everyone et rôle bot)
    await guild.roles.fetch();
    const roles = [...guild.roles.cache.values()];
    for (const role of roles) {
      if (role.name === "@everyone" || role.managed) continue;
      try {
        await rateLimitSafe(() => role.delete(), `delete role ${role.name}`);
      } catch (_) {}
    }

    await editReply("🚀 **Configuration du serveur RP Emergencie Hambourg lancée !**\n\n`[2/6]` 🎭 Création des rôles...");

    // 3. Créer les rôles
    const roleMap = {};
    const sortedRoles = [...SERVER_CONFIG.roles].sort((a, b) => a.position - b.position);

    for (const roleDef of sortedRoles) {
      const role = await rateLimitSafe(
        () =>
          guild.roles.create({
            name: roleDef.name,
            color: roleDef.color,
            hoist: roleDef.hoist,
            mentionable: roleDef.mentionable ?? false,
            permissions: [],
          }),
        `create role ${roleDef.name}`
      );
      roleMap[roleDef.name] = role;
      console.log(`✅ Rôle créé: ${roleDef.name}`);
    }

    await editReply("🚀 **Configuration du serveur RP Emergencie Hambourg lancée !**\n\n`[3/6]` 📁 Création des catégories et salons...");

    // 4. Créer les catégories et salons
    const everyoneRole = guild.roles.everyone;
    let categoryCount = 0;
    let channelCount = 0;

    for (const catDef of SERVER_CONFIG.categories) {
      categoryCount++;
      await editReply(
        `🚀 **Configuration du serveur RP Emergencie Hambourg lancée !**\n\n\`[3/6]\` 📁 Création des catégories... (${categoryCount}/${SERVER_CONFIG.categories.length})\n> **${catDef.name}**`
      );

      // Permissions de la catégorie
      const permissionOverwrites = [];

      if (catDef.private) {
        // Masquer pour tout le monde par défaut
        permissionOverwrites.push({
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel],
        });

        // Accès pour les rôles spécifiés
        if (catDef.privateRoles) {
          for (const roleName of catDef.privateRoles) {
            const role = roleMap[roleName];
            if (role) {
              permissionOverwrites.push({
                id: role.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
              });
            }
          }
        }
      }

      // Créer la catégorie
      const category = await rateLimitSafe(
        () =>
          guild.channels.create({
            name: catDef.name,
            type: ChannelType.GuildCategory,
            permissionOverwrites,
          }),
        `create category ${catDef.name}`
      );

      // Créer les salons dans la catégorie
      for (const chanDef of catDef.channels) {
        const isVoice = chanDef.type === "voice";

        const channelOptions = {
          name: chanDef.name,
          type: isVoice ? ChannelType.GuildVoice : ChannelType.GuildText,
          parent: category.id,
        };

        if (!isVoice && chanDef.topic) {
          channelOptions.topic = chanDef.topic;
        }

        await rateLimitSafe(() => guild.channels.create(channelOptions), `create channel ${chanDef.name}`);

        channelCount++;
        console.log(`  ✅ Salon créé: ${chanDef.name}`);
      }
    }

    await editReply("🚀 **Configuration du serveur RP Emergencie Hambourg lancée !**\n\n`[4/6]` ⚙️ Configuration des permissions avancées...");

    // 5. Configurer les permissions des catégories de corps de métier (vue publique mais envoi restreint)
    const publicCategoryRestrictions = {
      "🚔 ┃ POLICE NATIONALE": ["Commissaire de Police", "Commandant de Police", "Capitaine de Police", "Lieutenant de Police", "Sergent de Police", "Brigadier de Police", "Agent de Police", "Agent Stagiaire Police"],
      "🚑 ┃ SAMU — URGENCES": ["Médecin Chef SAMU", "Médecin SAMU", "Infirmier Chef", "Infirmier", "Ambulancier Chef", "Ambulancier", "Stagiaire SAMU"],
      "🚒 ┃ POMPIERS": ["Colonel Pompier", "Commandant Pompier", "Capitaine Pompier", "Lieutenant Pompier", "Sergent Pompier", "Caporal Pompier", "Pompier", "Stagiaire Pompier"],
      "🛃 ┃ DOUANES": ["Directeur des Douanes", "Inspecteur des Douanes", "Agent des Douanes"],
      "⚖️ ┃ JUSTICE": ["Juge", "Procureur", "Avocat"],
      "💀 ┃ MILIEU CRIMINEL": ["Criminel"],
    };

    for (const [catName, allowedRoles] of Object.entries(publicCategoryRestrictions)) {
      const category = guild.channels.cache.find((c) => c.name === catName && c.type === ChannelType.GuildCategory);
      if (!category) continue;

      const overwrites = [
        {
          id: everyoneRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages],
        },
      ];

      for (const roleName of allowedRoles) {
        const role = roleMap[roleName];
        if (role) {
          overwrites.push({
            id: role.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          });
        }
      }

      // Admins/mods ont toujours accès
      for (const adminRole of ["Fondateur", "Co-Fondateur", "Directeur Général", "Administrateur", "Modérateur Chef", "Modérateur"]) {
        const role = roleMap[adminRole];
        if (role) {
          overwrites.push({
            id: role.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages],
          });
        }
      }

      await rateLimitSafe(() => category.permissionOverwrites.set(overwrites), `set perms ${catName}`);
    }

    await editReply("🚀 **Configuration du serveur RP Emergencie Hambourg lancée !**\n\n`[5/6]` 📨 Envoi des messages d'accueil...");

    // 6. Envoyer le message de règlement dans le bon salon
    const regChannel = guild.channels.cache.find((c) => c.name === "📌┃règlement-du-serveur");
    if (regChannel) {
      await rateLimitSafe(
        () =>
          regChannel.send({
            content: `# 📜 Règlement Officiel — RP Emergencie Hambourg\n\n**Bienvenue sur le serveur RP Emergencie Hambourg !** Merci de lire et de respecter ce règlement intégralement.\n\n## 🔹 Règles Générales\n\`1.\` Respectez tous les membres du serveur. Toute forme d'irrespect, insulte ou harcèlement est interdite.\n\`2.\` Le langage vulgaire excessif est interdit en dehors des zones autorisées.\n\`3.\` Toute publicité non autorisée par le staff est strictement interdite.\n\`4.\` Il est interdit de partager du contenu NSFW, choquant ou illégal.\n\`5.\` Le multi-compte est interdit. Un seul compte Discord par personne.\n\n## 🎭 Règles RP\n\`6.\` Le **Power Gaming** (forcer des actions sur d'autres joueurs sans leur consentement) est interdit.\n\`7.\` Le **Meta Gaming** (utiliser des informations hors RP en RP) est interdit.\n\`8.\` Le **RDM** (Random Death Match — tuer sans raison RP valable) est interdit.\n\`9.\` Le **VDM** (Vehicle Death Match — écraser quelqu'un sans raison RP) est interdit.\n\`10.\` Le **Fail RP** (ne pas respecter les scénarios RP) est sanctionnable.\n\`11.\` Restez **en personnage** (IC) dans les zones RP. Utilisez **(( ))** pour les discussions hors RP.\n\`12.\` Le **Combat Logging** (se déconnecter pendant un scénario RP) est interdit.\n\n## 👮 Staff & Sanctions\n\`13.\` Les décisions du staff sont finales. Le plaidoyer se fait uniquement via un ticket.\n\`14.\` Toute tentative de manipulation, contournement de sanction ou usurpation de rôle est bannable.\n\`15.\` Les sanctions vont du simple avertissement au bannissement définitif selon la gravité de l'infraction.\n\n*En rejoignant ce serveur, vous acceptez l'intégralité de ce règlement.*\n\n**— La Direction de RP Emergencie Hambourg**`,
          }),
        "send règlement"
      );
    }

    const welcomeChannel = guild.channels.cache.find((c) => c.name === "👋┃bienvenue");
    if (welcomeChannel) {
      await rateLimitSafe(
        () =>
          welcomeChannel.send({
            content: `# 🚨 Bienvenue sur **RP Emergencie Hambourg** !\n\n> *La ville de Hambourg a besoin de vous. Chaque appel d'urgence compte.*\n\n**RP Emergencie Hambourg** est un serveur de jeu de rôle immersif centré sur les services d'urgence de la ville de Hambourg. Que vous souhaitiez devenir un officier de police, un médecin du SAMU, un pompier courageux, ou simplement un citoyen qui donne vie à la ville, votre place est ici.\n\n## 📋 Pour commencer :\n1️⃣ Lisez le <#règlement-du-serveur>\n2️⃣ Présentez-vous dans <#présentation>\n3️⃣ Consultez les <#offres-emploi> pour rejoindre un corps de métier\n4️⃣ Déposez votre candidature dans la catégorie correspondante\n\n## 🏙️ Les services disponibles :\n🚔 **Police Nationale** — Maintien de l'ordre et sécurité publique\n🚑 **SAMU** — Urgences médicales et secours aux personnes\n🚒 **Pompiers** — Lutte contre les incendies et secours divers\n🛃 **Douanes** — Contrôle des frontières et du port\n⚖️ **Justice** — Tribunaux, juges, procureurs et avocats\n\n*Bonne aventure à Hambourg !* 🇩🇪`,
          }),
        "send bienvenue"
      );
    }

    const codePenalChannel = guild.channels.cache.find((c) => c.name === "📜┃code-pénal-hambourg");
    if (codePenalChannel) {
      await rateLimitSafe(
        () =>
          codePenalChannel.send({
            content: `# ⚖️ Code Pénal de Hambourg\n\n## 🔴 Infractions Majeures (Bannissement / Emprisonnement long)\n\`Article 1\` — Homicide volontaire : 10 000€ d'amende + 30 min de prison\n\`Article 2\` — Terrorisme ou attentat : Bannissement immédiat du territoire\n\`Article 3\` — Corruption d'agent public : 8 000€ + 20 min de prison\n\`Article 4\` — Trafic de stupéfiants (grande quantité) : 12 000€ + 35 min de prison\n\`Article 5\` — Prise d'otage : 15 000€ + 40 min de prison\n\n## 🟠 Infractions Graves (Emprisonnement)\n\`Article 6\` — Agression armée : 5 000€ + 15 min de prison\n\`Article 7\` — Vol à main armée : 7 000€ + 20 min de prison\n\`Article 8\` — Recel de marchandises volées : 4 000€ + 10 min de prison\n\`Article 9\` — Fuite face aux forces de l'ordre : 3 000€ + 8 min de prison\n\`Article 10\` — Trafic de stupéfiants (petite quantité) : 5 000€ + 12 min de prison\n\n## 🟡 Infractions Moyennes (Amende)\n\`Article 11\` — Conduite sans permis : 2 000€\n\`Article 12\` — Conduite en état d'ivresse : 2 500€ + saisie du véhicule\n\`Article 13\` — Refus d'obtempérer : 1 500€\n\`Article 14\` — Port d'arme illégal : 3 000€\n\`Article 15\` — Trouble à l'ordre public : 800€\n\n## 🟢 Infractions Mineures (Avertissement)\n\`Article 16\` — Stationnement illégal : 200€\n\`Article 17\` — Excès de vitesse léger : 300€\n\`Article 18\` — Incivilité : Avertissement oral\n\`Article 19\` — Dégradation de bien public mineur : 500€\n\n*Ce code pénal est susceptible d'évoluer. La direction se réserve le droit de modifier les peines.*\n**— Tribunal de Hambourg**`,
          }),
        "send code pénal"
      );
    }

    await editReply(
      `✅ **Serveur RP Emergencie Hambourg configuré avec succès !**\n\n📊 **Résumé :**\n> 🎭 **${SERVER_CONFIG.roles.length} rôles** créés\n> 📁 **${SERVER_CONFIG.categories.length} catégories** créées\n> 💬 **${SERVER_CONFIG.categories.reduce((acc, c) => acc + c.channels.length, 0)} salons** créés\n\n🏙️ Le serveur est prêt pour le RP Emergencie Hambourg. Bonne aventure ! 🚨`
    );

    console.log("✅ Configuration terminée !");
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error);
    await editReply(`❌ **Erreur lors de la configuration :** ${error.message}\n\nVérifiez que le bot a les permissions \`Administrateur\` sur le serveur.`);
  }
}
