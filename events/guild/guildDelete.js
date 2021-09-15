const logger = require("../../util/logger.js");
const { defaultSettings } = require("../../config.js");
const { settings } = require("../../util/settings.js");
const Event = require("../../base/Event.js");

module.exports = class guildDelete extends Event {
  constructor(client) {
    super(client, {
      name: "guildDelete"
    });
  }
  async run(guild) {
    this.client.user.setActivity(`${defaultSettings.prefix}help | ${this.client.guilds.cache.size} Servers`);
    settings.delete(guild.id);
    logger.cmd(`[GUILD LEFT] ${guild.id}, removed the bot.`);
  }
};