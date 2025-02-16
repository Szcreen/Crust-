const moment = require('moment-timezone');
const { Client, GatewayIntentBits, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,               // For server events
        GatewayIntentBits.GuildMessages,        // For messages in guilds
        GatewayIntentBits.MessageContent,       // To read the content of messages
        GatewayIntentBits.GuildMembers,         // To track member updates
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Gets DISCORD TOKEN from .env
const TOKEN = process.env.DISCORD_TOKEN; // Discord token
const CLIENT_ID = process.env.CLIENT_ID; // Bot client id
const GUILD_ID = process.env.GUILD_ID; // Guild (server) id

const commands = [
    new SlashCommandBuilder()
        .setName('wipe')
        .setDescription('Get the next force wipe date')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Refreshing application commands.');
    
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
    
        console.log('Reloaded application commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Logs "Bot is online!" when its ready
client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'wipe') {
        const wipe = getwipe();
        await interaction.reply(wipe);
    }
});

// Log in to Discord with the bot's token
client.login(TOKEN);

// Function to find next force wipe
function getwipe() {
    const today = moment().tz('Europe/Paris'); // CET/CEST time zone

    // Calculate the first Thursday of next month
    let wipe = today.clone().add(1, 'month').startOf('month');

    // Calculate the number of days until the next Thursday (4 is Thursday in moment.js)
    let daysToThursday = (4 - wipe.day() + 7) % 7;

    // Adjust the date to the next Thursday
    wipe.add(daysToThursday, 'days');

    // Set the time to 20:00 CET
    wipe.set({ hour: 20, minute: 0, second: 0, millisecond: 0 });

    // Converts time to timestamp form
    const timestamp = wipe.unix();

    if (isNaN(timestamp)) {
        console.error('Invalid timestamp', wipe);
        return 'Error: Invalid date.';
    }

    // Format the date for display
    const formattedDate = wipe.format('DD MMMM [at] HH:mm');

    const message = `Next force wipe is on ${formattedDate}`;

    // Return the formatted date with Discord timestamp
    return `\*\*\*${message}\*\*\* <t:${timestamp}:R>`;
}
