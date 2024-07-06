const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: 'pinterest',
    version: '1.0.0',
    author: 'Hanni', // do not change
    role: 0,
    category: 'search',
    description: {
      en: "Search images from Pinterest"
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },
  onStart: async function ({ api, event }) {
    const messageBody = event.body.trim();
    const args = messageBody.split(' ');

    if (args.length < 1) {
      return api.sendMessage(
        "Please provide a search term and optionally the number of images you want to retrieve. For example: ?pinterest nayeon 2",
        event.threadID,
        event.messageID
      );
    }

    // Extract count and search term from arguments
    const count = parseInt(args.pop()) || 2; // Default to 2 if no count provided
    const keySearch = args.join(' ');

    api.setMessageReaction("📸", event.messageID);

    try {
      const res = await axios.get(
        `https://openapi-idk8.onrender.com/pinterest?search=${encodeURIComponent(keySearch)}&count=${count}`
      );
      const data = res.data.images;

      if (!data || data.length === 0) {
        return api.sendMessage(
          "No images found.",
          event.threadID,
          event.messageID
        );
      }

      const imgData = [];
      for (let i = 0; i < data.length; i++) {
        const imagePath = path.join(__dirname, `tmp/image${i + 1}.jpg`);

        try {
          const imageResponse = await axios.get(data[i], {
            responseType: "arraybuffer"
          });
          fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
          imgData.push(fs.createReadStream(imagePath));
        } catch (error) {
          console.error(`Error downloading or saving image ${i + 1}:`, error);
          // Send a message to the user indicating the download failed for this image
          api.sendMessage(
            `Error downloading image ${i + 1}.`,
            event.threadID,
            event.messageID
          );
        }
      }

      if (imgData.length === 0) {
        return api.sendMessage(
          "Failed to download any images.",
          event.threadID,
          event.messageID
        );
      }

      api.sendMessage(
        {
          attachment: imgData,
          body: `Pinterest results for keyword: ${keySearch}`,
        },
        event.threadID,
        event.messageID
      );

      // Cleanup
      imgData.forEach((_, i) => {
        const imagePath = path.join(__dirname, `tmp/image${i + 1}.jpg`);
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error(`Failed to delete image ${i + 1}:`, err);
          });
        } else {
          console.log(`Image file ${imagePath} doesn't exist, skipping deletion.`);
        }
      });
    } catch (error) {
      console.error("Error fetching Pinterest data:", error);
      if (error.response) {
        api.sendMessage(
          "An error occurred while fetching data.",
          event.threadID,
          event.messageID
        );
      }
    }
  },
};
