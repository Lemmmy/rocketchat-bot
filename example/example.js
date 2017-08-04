require("dotenv").config(); // load our .env file

const Bot = require("../").Bot; // require("rocketchat-bot").Bot

const bot = new Bot({
  server: process.env.ROCKETCHAT_SERVER,
  username: process.env.ROCKETCHAT_USERNAME,
  password: process.env.ROCKETCHAT_PASSWORD
});

bot.start();

bot.on("ready", () => {
  console.log("The bot is ready");
  bot.loadPlugins(__dirname + "/plugins");
});