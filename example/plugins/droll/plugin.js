const Dice = require("node-dice-js");

module.exports = bot => {
  let lastRoll;

  bot.command("droll <dice>")
    .description(
      `Roll a dice. Dice format is \`(AdX(kY)-LxCM)xR\`.

- \`A\` - the number of dice to be rolled (default: 1)
- \`d\` - separator that stands for die or dice
- \`X\` - the number of face of each die
- \`(kY)\` - number of dice to keep from roll (optional)
- \`-L\` - take the lowest dice from all the rolls (optional)
- \`-H\` - take the highest dice from all the rolls (optional)
- \`C\` - the multiplier, must be a natural number (optional, default: 1)
- \`B\` - the modifier, must be an integer (optional, default: 0)
- \`R\` - the number of times to repeat the entire command (optional, default: 1)

You can see verbose information for the last roll with \`!lastdroll\``
    )
    .action((meta, command) => {
      let dice = new Dice();
      let roll = dice.execute(command);
      lastRoll = roll;

      let out = roll.text.replace(/^The result (.*?) = (\d+)$/gm, "The result $1 = *$2*");
      bot.send(meta, out);
    });

  bot.command("lastdroll")
    .description("Provides verbose information for the last dice roll.")
    .action(meta => {
      if (!lastRoll) return bot.send(meta, "No last dice in memory.");

      let out = lastRoll.verbose.join("\n")
        .replace(/^Roll #(\d+): (\d+)$/gm, "Roll *$1*: *$2*:")
        .replace(/^Adding up all the rolls: (.*?) = (\d+)$/gm, "Adding up all the rolls: $1 = *$2*")
        .replace(/^The (.*?) is (\d+)$/gm, "The $1 is *$2*");

      bot.send(meta, out);
    });
};