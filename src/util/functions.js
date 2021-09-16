const { readdirSync } = require("fs");
const { resolve } = require("path");
const { permLevels } = require("../config.js");
const logger = require("./logger.js");

function permLevel(message) {
  let permlvl = 0;

  const permOrder = permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

  while (permOrder.length) {
    const currentLevel = permOrder.shift();
    if (message.guild && currentLevel.guildOnly) continue;
    if (currentLevel.check(message)) {
      permlvl = currentLevel.level;
      break;
    }
  }
  return permlvl;
}

async function awaitReply(msg, question, limit = 60000) {
  const filter = m => m.author.id === msg.author.id;
  await msg.channel.send(question);
  try {
    const collected = await msg.channel.awaitMessages({ filter, max: 1, time: limit, errors: ["time"]});
    return collected.first().content;
  } catch (e) {
    return false;
  }
}

const promises = [];
async function loadModule(client, dir, type, reloaded, reloadedName) {
  const { container } = client;
  try {
    for (const dirent of readdirSync(dir, { withFileTypes: true })) {
      const loc = resolve(dir, dirent.name);
      if (dirent.isFile()) {
        const name = dirent.name.split(".")[0];
        
        if (reloaded === true) {
          if (name !== reloadedName) return; 
        }
        
        const file = new (require(loc))(client);
        logger.log(`Loading ${type}: ${name}. 👌`, "log");  
        file.conf.location = loc;
        file.conf.dir = dir;
        switch (type) {
          case "event": {
            container.events.set(file.conf.name, file);
            client.on(file.conf.name, (...args) => file.run(...args));
            delete require.cache[require.resolve(loc)];
            break;
          }
          
          case "command": {
            if (file.init) file.init(client);
            container.legacyCommands.set(file.help.name, file);
            file.conf.aliases.forEach(alias => {
              container.aliases.set(alias, file.help.name);
            });
            break;
          }
          
          case "slash": {
            container.slashCommands.set(file.commandData.name, file);
            break;
          }
          
          case "context": {
            container.contextCommands.set(file.commandData.name, file);
            break;
          }
        }
      } else if (dirent.isDirectory()) {
        promises.push(await loadModule(client, loc, type));
      }
    }
  } catch (e) {
    return `Unable to load ${type}: ${e}`;
  }
}

async function unloadModule(client, container, type, commandPath, commandName) {
  switch (type) {
    case "command": {
      let command;
      if (container.commands.has(commandName)) {
        command = container.commands.get(commandName);
      } else if (container.aliases.has(commandName)) {
        command = container.commands.get(container.aliases.get(commandName));
      }
      if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;

      if (command.shutdown) {
        await command.shutdown(client);
      }
      delete require.cache[require.resolve(commandPath)];
      return false;
    }

    case "slash": {
      let command;
      if (container.slashcmds.has(commandName)) command = container.slashcmds.get(commandName);
      if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
      delete require.cache[require.resolve(commandPath)];
      return false;
    }
  }
}

async function reloadEvent(client, eventName, loc) {
  client.removeAllListeners(eventName);
  delete require.cache[require.resolve(loc)];
  const event = new(require(loc))(client);
  client.on(eventName, (...args) => event.run(...args));
  delete require.cache[require.resolve(loc)];
}

String.prototype.toProperCase = function() {
  return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

module.exports = { permLevel, awaitReply, loadModule, unloadModule, reloadEvent };
