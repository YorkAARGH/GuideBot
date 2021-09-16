module.exports = class SlashCommand {

  constructor(client, {
    name = null,
    description = "No description provided.",
    options = [],
    defaultPermission = true,
    guildOnly = false,
    permLevel = "User"
  }) {
    this.client = client;
    this.commandData = { name, description, options, defaultPermission };
    this.conf = {
      guildOnly,
      permLevel
    };
  }
};