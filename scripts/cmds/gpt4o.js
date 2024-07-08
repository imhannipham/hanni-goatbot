const axios = require('axios');

module.exports = {
  config: {
    name: 'gpt4o',
    version: '1.0.0',
    author: 'Hanni', // do not change
    role: 0,
    category: 'chatbot',
    description: {
      en: "Responds to questions using ChatGpt"
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },
  onStart: async function ({ api, event, box }) {
    try {
      const body = event.body.trim();
      const prompt = body.substring(body.indexOf(' ') + 1);

      if (prompt) {
        // React to the user's message with an emoji
        await api.setMessageReaction('\u23F1', event.messageID);

        const response = await axios.get(`https://nash-rest-api.replit.app/freegpt4o8k?question=${encodeURIComponent(prompt)}`);
        const responseData = JSON.parse(response.data.answer); // Parse the JSON string
        let messageText = responseData.response; 

        messageText = messageText.replace(
          "Is this answer helpful to you?",
          "",
        );

        // Send the response as a reply to the user's message
        await api.sendMessage({ body: messageText.trim(), mentions: [{ tag: `@${event.senderID}`, id: event.senderID }] }, event.threadID, event.messageID);
        console.log('Sent answer as a reply to the user');
      }
    } catch (error) {
      console.error(`Failed to get an answer: ${error.message}`);
      api.sendMessage(
        {
          body: `${error.message}.\n\nYou can try typing your question again or resending it, as there might be a bug from the server that's causing the problem. It might resolve the issue.`,
          mentions: [{ tag: `@${event.senderID}`, id: event.senderID }]
        },
        event.threadID,
        event.messageID
      );
    }
  },
};
