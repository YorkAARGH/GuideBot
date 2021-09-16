const { codeBlock } = require("@discordjs/builders");
const LegacyCommand = require("../../../base/LegacyCommand.js");

module.exports = class Eval extends LegacyCommand {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "Evaluates arbitrary Javascript.",
      category:"Owner",
      usage: "eval <expression>",
      aliases: ["ev"],
      permLevel: "Bot Owner"
    });
  }

  async clean(client, text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));

    text.replaceAll(client.token, "[REDACTED]");
    return text;
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const code = args.join(" ");
    try {
      const evaled = eval(code);
      const clean = await this.clean(this.client, evaled);
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 4000) {
        message.channel.send("Output exceeded 4000 characters. Sending as a file.", { files: [{ attachment: Buffer.from(clean), name: "output.txt" }]});
      }
      message.channel.send(codeBlock("js", clean));
    } catch (err) {
      console.log(err);
    }
  }

};