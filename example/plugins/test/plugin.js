module.exports = bot => {
  bot.command("test")
    .action(meta => {
      bot.send(meta, "Hello, world!");
    });
};