const LegacyCommand = require("../../../base/LegacyCommand.js");
const { codeBlock } = require("@discordjs/builders");

const { settings } = require("../../../util/settings.js");

module.exports = class SetCMD extends LegacyCommand {
  constructor(client) {
    super(client, {
      name: "set",
      description: "View or change settings for your server.",
      category: "System",
      usage: "set <view/get/edit> <key> <value>",
      guildOnly: true,
      aliases: ["setting", "settings"],
      permLevel: "Administrator"
    });
  }

  async run(message, [action, key, ...value], level) { // eslint-disable-line no-unused-vars

    const defaults = settings.get("default");
    const guildSettings = settings.get(message.guild.id);
    const replying = guildSettings.commandReply;
    if (!settings.has(message.guild.id)) settings.set(message.guild.id, {});
  
    if (action === "edit") {
      if (!key) return message.reply({ 
        content: "Please specify a key to edit", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      if (!defaults[key]) return message.reply({ 
        content: "This key does not exist in the settings", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      const joinedValue = value.join(" ");
      if (joinedValue.length < 1) return message.reply({ content: "Please specify a new value", allowedMentions: { repliedUser: (replying === "true") } });
      if (joinedValue === guildSettings[key]) return message.reply({ 
        content: "This setting already has that value!", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });

      if (!settings.has(message.guild.id)) settings.set(message.guild.id, {});

      settings.set(message.guild.id, joinedValue, key);
      message.reply({ 
        content: `${key} successfully edited to ${joinedValue}`, 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
    } else
  
    if (action === "del" || action === "reset") {
      if (!key) return message.reply({ 
        content: "Please specify a key to reset.", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      if (!defaults[key]) return message.reply({ 
        content: "This key does not exist in the settings", allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      if (!guildSettings[key]) return message.reply({ 
        content: "This key does not have an override and is already using defaults.", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });

      const response = await this.client.awaitReply(message, `Are you sure you want to reset \`${key}\` to the default \`${defaults[key]}\`?`);

      if (["y", "yes"].includes(response)) {

        settings.delete(message.guild.id, key);
        message.reply({ 
          content: `${key} was successfully reset to default.`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });
      } else

      if (["n","no","cancel"].includes(response)) {
        message.reply({ 
          content: `Your setting for \`${key}\` remains as \`${guildSettings[key]}\``, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });
      }
    } else
  
    if (action === "get") {
      if (!key) return message.reply({ 
        content: "Please specify a key to view", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      if (!defaults[key]) return message.reply({ 
        content: "This key does not exist in the settings", 
        allowedMentions: 
      { repliedUser: (replying === "true") 
      } 
      });
      const isDefault = !guildSettings[key] ? "\nThis is the default global default value." : "";
      message.reply({ 
        content: `The value of ${key} is currently ${guildSettings[key]}${isDefault}`, 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      
    } else {
      const array = Object.entries(guildSettings).map(([key, value]) => `${key}${" ".repeat(20 - key.length)}::  ${value}`);
      await message.channel.send(codeBlock("asciidoc", `= Current Guild Settings =\n${array.join("\n")}`));    }
  }
};