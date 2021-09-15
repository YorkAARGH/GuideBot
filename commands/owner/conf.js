const Command = require("../../base/Command.js");
const { codeBlock } = require("@discordjs/builders");
const { settings } = require("../../util/settings.js");
const { defaultSettings } = require("../../config.js");

module.exports = class Conf extends Command {
  constructor(client) {
    super(client, {
      name: "conf",
      description: "Modify the default configuration for all guilds.",
      category: "Owner",
      usage: "conf <view/get/edit> <key> <value>",
      guildOnly: true,
      aliases: ["defaults"],
      permLevel: "Bot Admin"
    });
  }

  async run(message, [action, key, ...value], level) { // eslint-disable-line no-unused-vars
    
    const defaults = settings.get("default");
    const replying = settings.ensure(message.guild.id, defaultSettings).commandReply;

    if (action === "add") {
      if (!key) return message.reply({ 
        content: "Please specify a key to add", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } });
      if (defaults[key]) return message.reply({ 
        content: "This key already exists in the default settings", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      if (value.length < 1) return message.reply({ 
        content: "Please specify a value", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });

      defaults[key] = value.join(" ");
  
      settings.set("default", defaults);
      message.reply({ 
        content: `${key} successfully added with the value of ${value.join(" ")}`, 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
    } else
  
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
      if (value.length < 1) return message.reply({ 
        content: "Please specify a new value", 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
  
      defaults[key] = value.join(" ");

      settings.set("default", defaults);
      message.reply({ 
        content: `${key} successfully edited to ${value.join(" ")}`, 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
    } else
  
    if (action === "del") {
      if (!key) return message.reply({ 
        content: "Please specify a key to delete.", 
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
    
      const response = await this.client.awaitReply(message, `Are you sure you want to permanently delete ${key} from all guilds? This **CANNOT** be undone.`);

      if (["y", "yes"].includes(response)) {

        delete defaults[key];
        settings.set("default", defaults);
      
        for (const [guildId, conf] of settings.filter((setting, id) => setting[key] && id !== "default")) {
          delete conf[key];
          settings.set(guildId, conf);
        }
      
        message.reply({ 
          content: `${key} was successfully deleted.`, 
          allowedMentions: { 
            repliedUser: (replying === "true") 
          } 
        });
      } else
      if (["n","no","cancel"].includes(response)) {
        message.reply({ 
          content: "Action cancelled.", 
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
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });
      message.reply({ 
        content: `The value of ${key} is currently ${defaults[key]}`, 
        allowedMentions: { 
          repliedUser: (replying === "true") 
        } 
      });

    } else {
      const array = [];
      Object.entries(settings.get("default")).forEach(([key, value]) => {
        array.push(`${key}${" ".repeat(20 - key.length)}::  ${value}`); 
      });
      await message.channel.send(codeBlock("asciidoc", `= Bot Default Settings =\n${array.join("\n")}`));
    }
  }
};