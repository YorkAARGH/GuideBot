const { getSettings } = require("../../util/settings.js");
const Event = require("../../base/Event.js");

module.exports = class guildMemberAdd extends Event {
  constructor(client) {
    super(client, {
      name: "guildMemberAdd"
    });
  }

  async run(member) {
    
    const settings = getSettings(member.guild);
    if (settings.welcomeEnabled !== "true") return;

    const welcomeMessage = settings.welcomeMessage.replaceAll("{{user}}", member.user.tag);
    member.guild.channels.cache.find(c => c.name === settings.welcomeChannel).send(welcomeMessage).catch(console.error);
  }
};