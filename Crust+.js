require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

// Create a new instance of a Discord bot client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,               // For guild (server) events
        GatewayIntentBits.GuildMessages,        // For messages in guilds
        GatewayIntentBits.MessageContent,       // To read the content of messages
        GatewayIntentBits.GuildMembers,         // To track member updates (optional)
        GatewayIntentBits.GuildMessageReactions // Optional: for message reactions
    ]
});

// Your bot's token (replace this with your actual token)
const TOKEN = process.env.DISCORD_TOKEN; // Replace with your actual bot token

// Event listener when the bot logs in successfully
client.once('ready', () => {
    console.log('Bot is online!');
});

// Event listener for messages
client.on('messageCreate', (message) => {
    // Ignore messages sent by the bot itself
    if (message.author.bot) return;

    // Command to respond to "!ping" with "Pong!"
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

// Log in to Discord with the app's token
client.login(TOKEN);
