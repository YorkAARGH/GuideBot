const logger = require("../../util/logger.js");
const { defaultSettings } = require("../../config.js");
const { settings } = require("../../util/settings.js");
const Event = require("../../base/Event.js");

module.exports = class guildCreate extends Event {
  constructor(client) {
    super(client, {
      name: "guildCreate"
    });
  }

  async run(guild) {
    const guildCmds = this.client.container.slashcmds.filter(c => c.guildOnly).map(c => c.commandData);
    await this.client.guilds.cache.get(guild.id)?.commands.set(guildCmds);
    settings.set(guild.id, defaultSettings);
    this.client.user.setActivity(`${defaultSettings.prefix}help | ${this.client.guilds.cache.size} Servers`);
    logger.cmd(`[GUILD JOIN] ${guild.id}, added the bot.`);
  }
};