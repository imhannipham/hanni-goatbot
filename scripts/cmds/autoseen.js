const fs = require('fs-extra');
const pathFile = __dirname + '/tmp/autoseen.txt';

if (!fs.existsSync(pathFile)) {
  fs.writeFileSync(pathFile, 'false');
}

module.exports = {
  config: {
    name: "autoseen",
    usages: "on/off",
    version: "1.0",
    author: "Jun",
    countDown: 0,
    role: 0,
    shortDescription: "Enable/disable auto seen when new message is available",
    longDescription: "",
    category: "SEEN",
    guide: "{pn} on/off"
  },

  onEvent: async function ({ api, event }) {
    if (!fs.existsSync(pathFile))
       fs.writeFileSync(pathFile, 'false');
       const isEnable = fs.readFileSync(pathFile, 'utf-8');
       if (isEnable == 'true')
         api.markAsReadAll(() => {});
    
  },

  onStart: async function ({ api, event, args }) {
    try {
       if (args[0] == 'on') {
         fs.writeFileSync(pathFile, 'true');
         api.sendMessage('The autoseen function is now enabled for new messages.', event.threadID, event.messageID);
       } else if (args[0] == 'off') {
         fs.writeFileSync(pathFile, 'false');
         api.sendMessage('The autoseen function has been disabled for new messages.', event.threadID, event.messageID);
       } else {
         api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
       }
     }
     catch(e) {
       console.log(e);
     }
  }
};
