const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');

const token = "NDE1NTM3NjM5MDM5Njk2ODk2.DW3XlA.1-OrauLvclLjya-RYJD1XTl6ce8";

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
  if (message.content === 'ping') {
    // Send "pong" to the same channel
    message.channel.send('pong');
    //fs.exists
  }
});

// Log our bot in
client.login(token);
