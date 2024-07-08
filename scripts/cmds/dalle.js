const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "dalle", 
    version: "1.0.0", 
    author: "Chill", 
    countDown: 5, 
    role: 0, 
    shortDescription: {
      vi: "đây là mô tả ngắn của lệnh",
      en: "generate image using Dall-e"
    }, // Short description of command
    description: {
      vi: "đây là mô tả dài của lệnh",
      en: "generate image using Dall-e"
    }, // Long description of command
    category: "categoryName", // Category of command
    guide: {
      vi: "đây là hướng dẫn sử dụng của lệnh",
      en: "{pn} <your_prompt>"
    } // Guide of command
  },
  
  // onStart is a function that will be executed when the command is executed
  onStart: async function ({ api, event, args}) {
    try {
      let chilli = args.join(" ");
      if (!chilli) {
          return api.sendMessage(
              "[ ❗ ] - Missing prompt for the DALL-E command",
              event.threadID,
              event.messageID,
          );
      }

      api.sendMessage(
          "Generating image, please wait...",
          event.threadID,
          async (err, info) => {
              if (err) {
                  console.error(err);
                  return api.sendMessage(
                      "An error occurred while processing your request.",
                      event.threadID,
                  );
              }

              try {
                  const pogi = await axios.get(
                      `https://joshweb.click/dalle?prompt=${encodeURIComponent(chilli)}`,
                      { responseType: "arraybuffer" },
                  );
                  const imagePath = path.join(__dirname, "tmp/dalle_image.png");

                  fs.writeFileSync(imagePath, pogi.data);

                  const poganda = await api.getUserInfo(event.senderID);
                  const requesterName = poganda[event.senderID].name;

                  api.sendMessage(
                      {
                          body: `Here is the image you requested:\n\nPrompt: ${chilli}\n\nRequested by: ${requesterName}`,
                          attachment: fs.createReadStream(imagePath),
                      },
                      event.threadID,
                      () => {
                          fs.unlinkSync(imagePath);
                      },
                  );
              } catch (mantika) {
                  console.error(mantika);
                  api.sendMessage(
                      "An error occurred while processing your request.",
                      event.threadID,
                  );
              }
          },
      );
    } catch (mantika) {
      console.error("Error in DALL-E command:", mantika);
      api.sendMessage(
          "An error occurred while processing your request.",
          event.threadID,
      );
    }
  }
};