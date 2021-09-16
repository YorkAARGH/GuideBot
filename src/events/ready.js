const { Team } = require("discord.js");
const { defaultSettings } = require("../config.js");
const { settings } = require("../util/settings.js");
const logger = require("../util/logger.js");
const Event = require("../base/Event.js");

module.exports = class ready extends Event {
  constructor(client) {
    super(client, {
      name: "ready"
    });
  }

  async run() {
    if (!this.client.application?.owner) await this.client.application?.fetch();
    if (this.client.container.owners.length < 1) {
      if (this.client.application.owner instanceof Team) {
        this.client.container.owners.push(...this.client.application.owner.members.keys());
      } else {
        this.client.container.owners.push(this.client.application.owner.id);
      }
    }

    if (!settings.has("default")) {
      if (!defaultSettings) throw new Error("defaultSettings not preset in config.js or settings database. Bot cannot load.");
      settings.set("default", defaultSettings);
    }
    this.client.user.setActivity(`${settings.get("default").prefix}help | ${this.client.guilds.cache.size} Servers`);
    logger.log(`${this.client.user.tag}, ready to serve ${this.client.users.cache.size} users in ${this.client.guilds.cache.size} servers.`, "ready");
  }
};