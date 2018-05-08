const Discord = require('discord.js');
const levelsDb = require('./lib/levels');
const client = new Discord.Client();

const keyword = "ping";
const keywordResponse = "pong";

const token = require('./config/discordAuth-options').bot_token;

/*
	A ping pong bot, whenever you send "ping", it replies "pong".
*/

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
	// If the message is "ping"
	var messageStart = message.content.substring(0, keyword.length);
	if (messageStart == keyword) {
		if(message.content.length>keyword.length){
			let levelText = message.content.substring(keyword.length);
			if(levelText[0] ==" "){
				let levelText = message.content.substring(keyword.length+1);
			}
			
			let username = message.author.username;
			let nameSubstring = levelText.indexOf(" ") || (levelText.length > 5 ? 5 : levelText.length);
			let levelName = levelText.substring(0, nameSubstring);
			if(!message.content.includes(".")){
				levelText+=".";
			}
			var levelObject = levelsDb.readLevelInput(
				levelText.trim(),
				levelName.trim(),
				username.trim()
			);
			
			levelsDb.create(levelObject);
			
			message.channel.send('*'+keywordResponse+'*, also your "'+levelName+'" level: '+levelText);
		}else{
			message.channel.send('*'+keywordResponse+'*... but give me a longer message, please!');
		}
		
	}
});

client.on('guildMemberAdd', member => {
	var generalChannel = member.guild.channels.find("name", "general")
	generalChannel.send('**' + member.user.username + '**, has joined the server! say `ping` and some words to make a level on the server.');
});


// Log our bot in
client.login(token);
