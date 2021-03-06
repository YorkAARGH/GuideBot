const LegacyCommand = require("../../../base/LegacyCommand.js");
const { unloadModule, loadModule, reloadEvent } = require("../../../util/functions.js");
const { defaultSettings } = require("../../../config.js");
const { settings } = require("../../../util/settings.js");

module.exports = class Reload extends LegacyCommand {
  constructor(client) {
    super(client, {
      name: "reload",
      description: "Reloads a command that has been modified.",
      category: "System",
      usage: "reload [command/slash/event] [name]",
      permLevel: "Bot Admin"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars  

    const { container } = this.client;

    const replying = settings.ensure(message.guild.id, defaultSettings).commandReply;
    
    const type = args[0];
    const module = args[1];
    
    if (!type || args.length < 1) return message.reply({ 
      content: "What kind of module are you trying to reload? You can reload commands, events, or slash commands.", 
      allowedMentions: { 
        repliedUser: (replying === "true") 
      } 
    });

    if (!module) return message.reply({
      content: "Must provide a module to reload. Derp.",
      allowedMentions: {
        repliedUser: (replying === "true")
      }
    });  

    switch (type) {
      case "command": {
        const command = container.commands.get(module) || container.commands.get(container.aliases.get(module));
        
        let response = await unloadModule(this.client, "command", command.conf.location, command.help.name);
        if (response) return message.reply({
          content: `Error Unloading: ${response}`,
          allowedMentions: {
            repliedUser: (replying === "true")
          }
        });

        response = await loadModule(this.client, command.conf.dir, "command", true, command.help.name);
        if (response) return message.reply({ 
          content: `Error Loading: ${response}`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });

        return message.reply({ 
          content: `The command \`${command.help.name}\` has been reloaded`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });
      }

      case "slash": {
        const command = container.slashcmds.get(module);

        let response = await unloadModule(this.client, "slash", command.conf.location, command.commandData.name);
        if (response) return message.reply({ 
          content: `Error Unloading: ${response}`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });

        response = await loadModule(this.client, command.conf.dir, "slash", true, command.commandData.name);
        if (response) return message.reply({ 
          content: `Error Loading: ${response}`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });

        return message.reply({ 
          content: `The slash command \`${command.commandData.name}\` has been reloaded`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });
      }

      case "event": {
        const event = container.events.get(module);
        if (!event) return message.reply({ 
          content: `${module} is neither a command, a command alias, or an event. Please check your spelling and try again.`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });

        const response = await reloadEvent(this.client, event.conf.name, event.conf.location);
        if (response) return message.reply({ 
          content: `Error Unloading: ${response}`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });

        return message.reply({ 
          content: `The event \`${event.conf.name}\` has been reloaded`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });
      }
    }
  }
};