const { Collection } = require("discord.js");
const LegacyCommand = require("../../../base/LegacyCommand.js");

module.exports = class Deploy extends LegacyCommand {
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
    if (message.flags.length > 0 && message.flags[0] === "list") {
      const global = await this.client.application?.commands.fetch();
      const guild = await this.client.guilds.cache.get(message.guild.id)?.commands.fetch();
      console.log(global.map(c => `${c.id} - ${c.name}:> "${c.description}"`),guild.map(c => `${c.id} - ${c.name}:> "${c.description}"`));
    }
    const [guildCmds, globalCmds] = this.client.container.slashCommands.partition(c => c.conf.guildOnly);
    const contextCmds = this.client.container.contextCommands;
    const tempColl = new Collection();
    const mergedColl = tempColl.concat(globalCmds, contextCmds);
    await message.channel.send("Deploying commands!");
    await this.client.guilds.cache.get(message.guild.id)?.commands.set(guildCmds.map(c => c.commandData));
    await this.client.application?.commands.set(mergedColl.map(c => c.commandData)).catch(e => console.log(e));
    await message.channel.send("All commands deployed!");
  }
};