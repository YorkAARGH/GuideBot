if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required. Update Node on your system.");
require("dotenv").config();

const { Client, Collection } = require("discord.js");
const { intents, partials, permLevels } = require("./config.js");
const logger = require("./util/logger.js");
const { loadModule } = require("./util/functions.js");
const levelCache = {};

class GuideBot extends Client {
  constructor(options) {
    super(options);

    this.container = {
      owners: [],
      commands: new Collection(),
      aliases: new Collection(),
      slashcmds: new Collection(),
      events: new Collection(),
      levelCache
    };
  }
}

for (let i = 0; i < permLevels.length; i++) {
  const thisLevel = permLevels[i];
  levelCache[thisLevel.name] = thisLevel.level;
}

const client = new GuideBot({ intents, partials });

const init = async () => {

  await loadModule(client, "./events", "event");
  await loadModule(client, "./commands", "command");
  await loadModule(client, "./slash", "slash");

  client.login();
};

init();

client.on("disconnect", () => logger.warn("Bot is disconnecting..."))
  .on("reconnecting", () => logger.log("Bot reconnecting...", "log"))
  .on("error", e => logger.error(e))
  .on("warn", info => logger.warn(info));

process.on("uncaughtException", (err) => {
  const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
  console.error("Uncaught Exception: ", errorMsg);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: ", err);
});
