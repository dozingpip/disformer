const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');

const token = require('./config/discord-auth-config').bot_token;

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
