# rocketchat-bot

A bot framework for [Rocket.Chat](https://rocket.chat), built on [bot-commander](https://www.npmjs.com/package/bot-commander).

## Usage

Load the bot like so:

```javascript
const Bot = require("rocketchat-bot").Bot;

const bot = new Bot({
  server: "your.rocket.chat",
  username: "botuser",
  password: "botpass"
});

bot.start();

bot.on("ready", () => {
  bot.loadPlugins(__dirname + "/plugins");
});
```

Create a `plugins` directory, containing your named plugins (e.g. `test`, `droll`). 
Then create a `plugin.js` file in the directory:

```javascript
module.exports = bot => {
  bot.command("test")
    .action(meta => {
      bot.send(meta, "Hello, world!");
    });
};
```

For more information on the `bot` object, see the [bot-commander](https://www.npmjs.com/package/bot-commander) documentation.

The WebSocket and REST APIs are exposed via bot.wsAPI and bot.webAPI respectively.