const express = require('express');

const router = express.Router();
const discordOptions = require('../config/discord-auth-config');
const CLIENT_ID = discordOptions.client_id;
const CLIENT_SECRET = discordOptions.secret;
module.exports = router;
//const redirect = encodeURIComponent('http://localhost:50451/api/discord/callback');

router.get('/login', (req, res) => {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${req.baseUrl}/callback`);
});

