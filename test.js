const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const STEAM_API_KEY = 'YOUR_STEAM_API_KEY'; // Replace with your actual Steam API key
const RUST_APP_ID = 252490; // Rust app ID
const CLIENT_ID = 'YOUR_BOT_CLIENT_ID'; // Replace with your bot's client ID
const GUILD_ID = 'YOUR_GUILD_ID'; // Replace with your Discord guild/server ID

// Slash command registration
const commands = [
  new SlashCommandBuilder()
    .setName('rust')
    .setDescription('Get the value of a user\'s Rust inventory')
    .addStringOption(option =>
      option.setName('profile')
        .setDescription('The URL of the Steam profile')
        .setRequired(true)),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken('YOUR_BOT_TOKEN');

// Register the slash command with Discord
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'rust') {
    const steamProfileUrl = interaction.options.getString('profile');
    const steamID64 = getSteamID64FromProfile(steamProfileUrl); // Extract Steam ID64

    try {
      const inventoryData = await getRustInventory(steamID64);

      if (inventoryData.success === false) {
        return interaction.reply('Could not fetch inventory. Please make sure the Steam profile is public.');
      }

      const expensiveItems = await getExpensiveRustItems(inventoryData);

      const embed = new EmbedBuilder()
        .setTitle(`${steamProfileUrl} Rust Inventory Value`)
        .setDescription(`Here are some of the most expensive items in their inventory:`)
        .setColor('#0099ff');

      expensiveItems.forEach(item => {
        embed.addFields({
          name: item.name,
          value: `Price: $${item.price} - Quality: ${item.quality}`,
        });
      });

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return interaction.reply('There was an error fetching the inventory.');
    }
  }
});

// Function to get Steam ID64 from Steam Profile URL
function getSteamID64FromProfile(profileUrl) {
  const profileID = profileUrl.split('/').pop(); // Extracts profile ID from URL
  return profileID.length === 17 ? profileID : `https://steamcommunity.com/profiles/${profileID}`;
}

// Fetch Rust Inventory
async function getRustInventory(steamID64) {
  const url = `http://api.steampowered.com/IEconItems_252490/GetPlayerItems/v0001/?key=${STEAM_API_KEY}&steamid=${steamID64}&appid=${RUST_APP_ID}`;
  const response = await axios.get(url);
  return response.data.result;
}

// Function to get the most expensive Rust items (dummy implementation for illustration)
async function getExpensiveRustItems(inventoryData) {
  const items = inventoryData.items;
  const itemsWithPrice = [];

  // Dummy logic: Assume we have a function getRustItemPrice that fetches the price for an item
  for (const item of items) {
    const price = await getRustItemPrice(item); // Fetch the item price
    itemsWithPrice.push({ name: item.market_hash_name, price: price, quality: item.type });
  }

  // Sort items by price (descending)
  itemsWithPrice.sort((a, b) => b.price - a.price);

  // Return the top 5 expensive items
  return itemsWithPrice.slice(0, 5);
}

// Dummy function to simulate getting the price (Replace this with a real API)
async function getRustItemPrice(item) {
  // In a real implementation, fetch the price using the Rust Market or a 3rd party API.
  return (Math.random() * 100).toFixed(2); // Random price between 0 and 100
}

client.login('YOUR_BOT_TOKEN'); // Add your bot's token here
