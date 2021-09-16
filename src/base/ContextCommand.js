module.exports = class ContextCommand {

  constructor(client, {
    name = null,
    type =  "USER",
    guildOnly = false,
    permLevel = "User"
  }) {
    this.client = client;
    this.commandData = { name, type };
    this.conf = { guildOnly, permLevel };
  }
};