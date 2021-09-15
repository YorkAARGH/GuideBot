const Command = require("../../base/Command.js");

module.exports = class Deploy extends Command {
  constructor(client) {
    super(client, {
      name: "deploy",
      description: "This will deploy all slash commands.",
      category: "Owner",
      usage: "deploy",
      permLevel: "Bot Owner",
      aliases: []
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const [guildCmds, globalCmds] = this.client.container.slashcmds.partition(c => c.guildOnly);
    await message.channel.send("Deploying commands!");
    await this.client.guilds.cache.get(message.guild.id)?.commands.set(guildCmds.map(c => c.commandData));
    await this.client.application?.commands.set(globalCmds.map(c => c.commandData)).catch(e => console.log(e));
    await message.channel.send("All commands deployed!");
  }
};