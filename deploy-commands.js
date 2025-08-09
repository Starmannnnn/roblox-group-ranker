// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const logCommands = [
  "rop", "ac", "bnt", "it", "ptk", "foc", "cg",
  "rod", "rol", "roa", "ke"
];

const commands = [];

// each /log-<type> has the same options: host (required), users (required), cohost (opt), supervisor (opt), proof (opt)
logCommands.forEach(cmd => {
  const builder = new SlashCommandBuilder()
    .setName(`log-${cmd}`)
    .setDescription(`Run the ${cmd.toUpperCase()} log command`)
    .addStringOption(option =>
      option.setName('host')
        .setDescription('Host of the session')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('users')
        .setDescription('Comma-separated Roblox usernames (e.g. user1, user2)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('cohost')
        .setDescription('Cohost of the session')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('supervisor')
        .setDescription('Supervisor of the session')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('proof')
        .setDescription('Link or description for proof')
        .setRequired(false));

  commands.push(builder.toJSON());
});

// ping command
commands.push(
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency')
    .toJSON()
);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering commands to guild', process.env.GUILD_ID);
    await rest.put(
      Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commands registered successfully.');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
})();
// placeholder for deploy commands script
