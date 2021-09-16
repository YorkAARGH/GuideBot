const Enmap = require("enmap");
const settings = new Enmap({ name: "settings" });
 
function getSettings(guild) {
  const defaults = settings.get("default") || {};
  const guildData = guild ? settings.get(guild.id) || {} : {};
  const returnObject = {};
  Object.keys(defaults).forEach((key) => {
    returnObject[key] = guildData[key] ? guildData[key] : defaults[key];
  });
  return returnObject;
}

function writeSettings(id, newSettings) {
  const defaults = settings.get("default");
  let guildSettings = settings.get(id);
  if (typeof guildSettings != "object") guildSettings = {};
  for (const key in newSettings) {
    if (defaults[key] !== newSettings[key]) {
      guildSettings[key] = newSettings[key];
    } else {
      delete guildSettings[key];
    }
  }
  settings.set(id, guildSettings);
}

module.exports = { settings, getSettings, writeSettings };