const axios = require('axios');

module.exports = {
	config: {
		name: 'gpt',
		version: '2.5',
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
			let prompt = event.body.trim();

			// Check if the event is a reply to a previous message
			if (event.type === "message_reply" && event.messageReply && event.messageReply.body) {
				const repliedMessage = event.messageReply.body.trim();
				prompt = `${repliedMessage} ${prompt}`;
			}

			const model = ["v3", "v3-32k", "turbo-16k"];
			const category = model[Math.floor(Math.random() * model.length)];
		
			
			if (prompt) {
				// React to the user's message with an emoji
				await api.setMessageReaction('\u23F1', event.messageID);

				const response = await axios.get(`https://hercai.onrender.com/${category}/hercai?question=${encodeURIComponent(prompt)}`);
				const messageText = response.data.reply;

				// Send the response as a reply to the user's message
				await api.sendMessage({ body: messageText, mentions: [{ tag: `@${event.senderID}`, id: event.senderID }] }, event.threadID, event.messageID);
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
