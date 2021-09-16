const { getSettings } = require("../util/settings.js");
const { permLevels } = require("../config.js");
const { permLevel } = require("../util/functions.js");
const logger = require("../util/logger.js");
const Event = require("../base/Event.js");

module.exports = class messageCreate extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate"
    });
  }

  async run(message) {
    if (message.author.bot) return;
    const settings = message.settings = getSettings(message.guild);
    const prefixMention = new RegExp(`^<@!?${this.client.user.id}> ?$`);
    if (message.content.match(prefixMention)) {
      return message.reply(`My prefix on this guild is \`${settings.prefix}\``);
    }
    
    if (!message.content.startsWith(settings.prefix)) return;
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.guild && !message.member) await message.guild.members.fetch(message.author);

    const level = permLevel(message);
    const cmd = this.client.container.legacyCommands.get(command) || this.client.container.legacyCommands.get(this.client.container.aliases.get(command));
    if (!cmd) return;

    if (cmd && !message.guild && cmd.conf.guildOnly)
      return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

    if (!cmd.conf.enabled) return;
    if (level < this.client.container.levelCache[cmd.conf.permLevel]) {
      if (settings.systemNotice === "true") {
        return message.channel.send(`You do not have permission to use this command.
Your permission level is ${level} (${permLevels.find(l => l.level === level).name})
This command requires level ${this.client.container.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
      } else {
        return;
      }
    }
      
    message.flags = [];
    while (args[0] &&args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }
    
    try {
      await cmd.run(message, args, level);
      logger.log(`${permLevels.find(l => l.level === level).name} ${message.author.id} ran command ${cmd.help.name}`, "cmd");
    } catch (e) {
      console.log(e);
      message.channel.send({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\`` })
        .catch(e => console.error("An error occurred replying on an error", e));
    }
  }
};