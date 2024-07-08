const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
      name: "upscale",
      version: "1.0.0",
      author: "Hanni",
      role: 0,
      category: "tools",
      description: "Upscale an image",
      guide: {
        en: "{pn} [reply to the photo  with {pn}]",
      },
      usePrefix: true,
  },


  onStart: async function ({ api, event }) {
      const { threadID, messageID, messageReply } = event;

      // Check if the event is a message reply and contains an image attachment
      if (
        messageReply &&
        messageReply.attachments &&
        messageReply.attachments.length > 0 &&
        messageReply.attachments[0].type === "photo"
      ) {
        const photoUrl = messageReply.attachments[0].url;

        try {
          // Call your API endpoint to upscale the image and get the result URL
          const response = await axios.get(`https://www.api.vyturex.com/upscale?imageUrl=${encodeURIComponent(photoUrl)}`);
          const resultUrl = response.data.resultUrl;

          // Download the upscaled image
          const imageResponse = await axios({
            url: resultUrl,
            method: 'GET',
            responseType: 'stream'
          });

          const imagePath = path.resolve(__dirname, 'tmp/upscaled_image.jpg');
          const writer = fs.createWriteStream(imagePath);

          imageResponse.data.pipe(writer);

          writer.on('finish', () => {
            api.sendMessage({
              body: "Here's your upscaled image!",
              attachment: fs.createReadStream(imagePath)
            }, threadID, (err) => {
              if (err) {
                api.sendMessage(
                  "An error occurred while sending the image.",
                  threadID,
                  messageID,
                );
              }
              fs.unlinkSync(imagePath); // Delete the image after sending
            });
          });

          writer.on('error', () => {
            api.sendMessage(
              "An error occurred while processing the image.",
              threadID,
              messageID,
            );
          });

        } catch (error) {
          api.sendMessage(
            "An error occurred while fetching the image link.",
            threadID,
            messageID,
          );
        }
      } else {
        api.sendMessage(
          "Please reply to a message with a photo to get the image upscaled.",
          threadID,
          messageID,
        );
      }
  },
};
