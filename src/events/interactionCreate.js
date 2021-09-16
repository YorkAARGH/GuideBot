const { getSettings } = require("../util/settings.js");
const { permLevels } = require("../config.js");
const { permLevel } = require("../util/functions.js");
const logger = require("../util/logger.js");
const Event = require("../base/Event.js");

module.exports = class interactionCreate extends Event {
  constructor(client) {
    super(client, {
      name: "interactionCreate"
    });
  }
  
  async run(interaction) {
    if (!interaction.isCommand()) return;

    const settings = interaction.settings = getSettings(interaction.guild);

    const cmd = this.client.container.slashCommands.get(interaction.commandName);
    if (!cmd) return;

    const level = permLevel(interaction);
    if (level < this.client.container.levelCache[cmd.conf.permLevel]) {
      return await interaction.reply({
        content: `This command can only be used by ${cmd.conf.permLevel}'s only`,
        ephemeral: settings.systemNotice !== "true"
      });
    }
  
    try {
      await cmd.run(interaction);
      logger.log(`${permLevels.find(l => l.level === level).name} ${interaction.user.id} ran slash command ${interaction.commandName}`, "cmd");
    
    } catch (e) {
      console.error(e);
      if (interaction.replied) {
        interaction.followUp({
          content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``,
          ephemeral: true
        }).catch(e => console.error("An error occurred following up on an error", e));
      } else 

      if (interaction.deferred) {
        interaction.editReply({
          content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``,
          ephemeral: true
        }).catch(e => console.error("An error occurred following up on an error", e));

      } else 
        interaction.reply({
          content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``,
          ephemeral: true
        }).catch(e => console.error("An error occurred replying on an error", e));
    }
  }
};