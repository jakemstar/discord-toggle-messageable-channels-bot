const { REST } = require('@discordjs/rest');
const { Client, Intents } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');
const commands = require('./commands.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const rest = new REST({ version: '9' }).setToken(token);

let messageableToggleList = [];

client.on("ready", () => {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const { commandName } = interaction;
	const targetChannel = interaction.options.getChannel('target');
	switch(commandName){
		case 'togglemessageable':
			messageableToggleList.forEach((channel) => {
				channel.permissionsFor(channel.guild.roles.everyone).has('SEND_MESSAGES') ? 
				channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SEND_MESSAGES: false }) :
				channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SEND_MESSAGES: null })
			});
			await interaction.reply('Toggled messageable on ' + messageableToggleList.toString());
			break;
		case 'addtoggle':
			messageableToggleList.push(targetChannel);
			await interaction.reply('Added ' + targetChannel.toString() + ' to the list of toggleable channels');
			break;
		case 'removetoggle':
			messageableToggleList = messageableToggleList.filter(channel => channel !== targetChannel );
			await interaction.reply('Removed ' + targetChannel.toString() + ' from the list of toggleable channels');
			break;
		case 'listtogglechannels':
			const messageableToggleListNames = messageableToggleList.toString();
			await interaction.reply("Channels in toggle list:\n" + messageableToggleListNames);
			break;
	}
});
	
client.login(token);