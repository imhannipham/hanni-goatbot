const axios = require('axios');

module.exports = {
  config: {
    name: 'imagine',
    version: '2.5',
    author: 'Hanni', // do not change
    role: 0,
    category: 'image',
    description: {
      en: "Generate a text to image using your imagination."
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },
  onStart: async function ({ api, event }) {
    try {
      let prompt = event.body.trim();
      if (!prompt)
          return api.sendMessage(
              "Missing prompt for image generator",
              event.threadID,
              event.messageID,
          );

      api.sendMessage(
          "Generating your image ...",
          event.threadID,
          async (err, info) => {
              try {
                  const apiUrl = `https://samirxpikachu.onrender.com/mageDef?prompt=${encodeURIComponent(prompt)}`;
                  const response = await axios.get(apiUrl, {
                      responseType: "stream",
                  });

                  if (!response.data) {
                      return api.sendMessage(
                          "Failed to retrieve image.",
                          event.threadID,
                          event.messageID,
                      );
                  }

                  return api.sendMessage(
                      {
                          body: "Here is your image",
                          attachment: response.data,
                      },
                      event.threadID,
                  );
              } catch (error) {
                  console.error(error);
                  api.sendMessage(
                      "An error occurred while generating your image.",
                      event.threadID,
                  );
              }
          },
      );
    } catch (s) {
      api.sendMessage(s.message, event.threadID);
    }
  },
};
