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
    const cmd = this.client.container.slashcmds.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.run(interaction);
      logger.log(`${interaction.user.id} ran slash command ${interaction.commandName}`, "cmd");
  
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