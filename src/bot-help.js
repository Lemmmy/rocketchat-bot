module.exports = function() {
  let out = "";

  // usage
  let cmdName = this._name;
  if (this._alias) cmdName = `${cmdName}|${this._alias}`;

  out += `*Usage*: ${cmdName} ${this.usage()}\n`;

  // description
  if (this._description) out += `_${this._description}_\n`;

  // commands
  let commandHelp = this.commandHelp();
  if (commandHelp) out += commandHelp + "\n";

  // options
  out += "\n*Options*:\n" + this.optionHelp().replace(/^/gm, "  ");

  return out;
};