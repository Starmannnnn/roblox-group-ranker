// index.js
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// load group IDs and role IDs from env (fallback to 1 for testing)
const GROUP1_ID = parseInt(process.env.GROUP1_ID || '1', 10);
const GROUP2_ID = parseInt(process.env.GROUP2_ID || '1', 10);
const GROUP3_ID = parseInt(process.env.GROUP3_ID || '1', 10);
const GROUP4_ID = parseInt(process.env.GROUP4_ID || '1', 10);

// helper to read role ids per group (rank numbers 1..6)
const parseRole = (key, fallback = 1) => parseInt(process.env[key] || String(fallback), 10);

const GROUP1_ROLE = {
  1: parseRole('GROUP1_ROLE_RANK1'),
  2: parseRole('GROUP1_ROLE_RANK2'),
  3: parseRole('GROUP1_ROLE_RANK3'),
  4: parseRole('GROUP1_ROLE_RANK4'),
  5: parseRole('GROUP1_ROLE_RANK5'),
  6: parseRole('GROUP1_ROLE_RANK6'),
};
const GROUP2_ROLE = {
  1: parseRole('GROUP2_ROLE_RANK1'),
  2: parseRole('GROUP2_ROLE_RANK2'),
  3: parseRole('GROUP2_ROLE_RANK3'),
  4: parseRole('GROUP2_ROLE_RANK4'),
  5: parseRole('GROUP2_ROLE_RANK5'),
  6: parseRole('GROUP2_ROLE_RANK6'),
};
const GROUP3_ROLE = {
  1: parseRole('GROUP3_ROLE_RANK1'),
  2: parseRole('GROUP3_ROLE_RANK2'),
  3: parseRole('GROUP3_ROLE_RANK3'),
  4: parseRole('GROUP3_ROLE_RANK4'),
  5: parseRole('GROUP3_ROLE_RANK5'),
  6: parseRole('GROUP3_ROLE_RANK6'),
};
const GROUP4_ROLE = {
  1: parseRole('GROUP4_ROLE_RANK1'),
  2: parseRole('GROUP4_ROLE_RANK2'),
  3: parseRole('GROUP4_ROLE_RANK3'),
  4: parseRole('GROUP4_ROLE_RANK4'),
  5: parseRole('GROUP4_ROLE_RANK5'),
  6: parseRole('GROUP4_ROLE_RANK6'),
};

async function loginRoblox() {
  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE);
    const me = await noblox.getCurrentUser();
    console.log('✅ Roblox logged in as', me.UserName);
  } catch (err) {
    console.error('❌ Roblox login failed:', err && err.message ? err.message : err);
  }
}

client.once('ready', () => {
  console.log(`✅ Discord logged in as ${client.user.tag}`);
});

// helper: safe get user id from username
async function getUserId(username) {
  try {
    return await noblox.getIdFromUsername(username);
  } catch (err) {
    throw new Error(`Could not find Roblox user "${username}"`);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const name = interaction.commandName;

  if (name === 'ping') {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    await interaction.editReply(`🏓 Latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms — API: ${Math.round(client.ws.ping)}ms`);
    return;
  }

  if (!name.startsWith('log-')) return;

  // Shared options
  const host = interaction.options.getString('host');
  const usersRaw = interaction.options.getString('users');
  const cohost = interaction.options.getString('cohost') || 'N/A';
  const supervisor = interaction.options.getString('supervisor') || 'N/A';
  const proof = interaction.options.getString('proof') || 'N/A';

  const usernames = usersRaw.split(',').map(s => s.trim()).filter(Boolean);
  const results = [];

  // Defer because Roblox calls may take time
  await interaction.deferReply();

  for (const username of usernames) {
    try {
      const userId = await getUserId(username);

      switch (name) {
        // Group1 & Group2
        case 'log-rop':
          // accept into group1 (if pending) then rank in group2
          try { await noblox.handleJoinRequest(GROUP1_ID, userId, true); } catch (e) { /* ignore if not applicable */ }
          await noblox.setRank(GROUP2_ID, userId, GROUP2_ROLE[1]);
          results.push(`✅ ${username}: accepted into Group1 (if needed), ranked in Group2`);
          break;

        case 'log-ac':
          // rank in group1 & group2
          await noblox.setRank(GROUP1_ID, userId, GROUP1_ROLE[1]);
          await noblox.setRank(GROUP2_ID, userId, GROUP2_ROLE[1]);
          results.push(`✅ ${username}: ranked in Group1 & Group2`);
          break;

        // Group3 & Group4
        case 'log-bnt':
          try { await noblox.handleJoinRequest(GROUP3_ID, userId, true); } catch (e) { /* ignore */ }
          await noblox.setRank(GROUP4_ID, userId, GROUP4_ROLE[1]);
          results.push(`✅ ${username}: accepted into Group3 (if needed), ranked in Group4`);
          break;

        case 'log-it':
          await noblox.setRank(GROUP3_ID, userId, GROUP3_ROLE[1]);
          await noblox.setRank(GROUP4_ID, userId, GROUP4_ROLE[1]);
          results.push(`✅ ${username}: ranked in Group3 & Group4`);
          break;

        // Group3-only
        case 'log-ptk':
        case 'log-foc':
        case 'log-cg':
          await noblox.setRank(GROUP3_ID, userId, GROUP3_ROLE[1]);
          results.push(`✅ ${username}: ranked in Group3`);
          break;

        // Group1-only
        case 'log-rod':
        case 'log-rol':
        case 'log-roa':
        case 'log-ke':
          await noblox.setRank(GROUP1_ID, userId, GROUP1_ROLE[1]);
          results.push(`✅ ${username}: ranked in Group1`);
          break;

        default:
          results.push(`❌ ${username}: Unknown command`);
      }

    } catch (err) {
      console.error('Error handling', username, err);
      results.push(`❌ ${username}: ${err.message || err}`);
    }
  }

  // Build embed with the details
  const embed = new EmbedBuilder()
    .setTitle('✅ Promotion Results')
    .setColor(0x22BB55)
    .addFields(
      { name: 'Host', value: host, inline: true },
      { name: 'Cohost', value: cohost, inline: true },
      { name: 'Supervisor', value: supervisor, inline: true },
      { name: 'Proof', value: proof, inline: false },
      { name: 'Results', value: results.join('\n') || 'No results', inline: false }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
});

// start: login to roblox then discord
(async () => {
  await loginRoblox();
  await client.login(process.env.DISCORD_TOKEN);
})();
// placeholder for bot index script
