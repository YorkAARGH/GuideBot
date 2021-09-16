const ContextCommand = require("../../base/ContextCommand.js");
const { codeBlock } = require("@discordjs/builders");

module.exports = class Eval extends ContextCommand {

  constructor(client) {
    super(client, {
      name: "Eval",
      type: "MESSAGE",
      permLevel: "Bot Owner",
      guildOnly: false
    });
  }

  async clean(client, text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });
    
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replaceAll(client.token, "[REDACTED]");
    return text;
  }

  cleanInput(content) {
    const regex = /^```(?:js|javascript)\n([\s\S]*?)```$/;
    const input = regex.test(content);
    if (input) content = content.match(regex)[1];
    else if (content.startsWith("```") && content.endsWith("```")) {
      content = content.split("```");
      content.shift();
      content.pop();
      content = content.join(" ");
    }
    return content;
  }

  async run(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = this.client.channels.cache.get(interaction.channelId);
    const message = channel.messages.cache.get(interaction.targetId);
    const code = this.cleanInput(message.content);
    try {
      const evaled = eval(code);
      const clean = await this.clean(this.client, evaled);
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 4000) {
        await interaction.editReply("Output exceeded 4000 characters. Sending as a file.", { files: [{ attachment: Buffer.from(clean), name: "output.txt" }]});
      }
      await interaction.editReply(codeBlock("js", clean));
    } catch (err) {
      console.log(err);
    }


  }
};