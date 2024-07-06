const axios = require('axios');

module.exports = {
		config: {
				name: 'weather',
				version: '2.5',
				author: 'Hanni', // do not change
				role: 0,
				category: 'tools',
				description: {
						en: "Get weather information for a specified city."
				},
				guide: {
						en: '{pn} [city]',
				},
		},
		onStart: async function ({ api, event }) {
				const cityName = event.body.trim();

				function sendMessage(msg) {
						api.sendMessage(msg, event.threadID, event.messageID);
				}

				if (!cityName) {
						return sendMessage("Please provide a city name.");
				}

				// box.react("🌩️", event.messageID);

				const url = `https://nodejs-2-jrqi.onrender.com/weather?city=${encodeURIComponent(cityName)}`;

				try {
						const response = await axios.get(url);
						const weatherData = response.data;

						if (weatherData.error) {
								return sendMessage(`Error: ${weatherData.error}`);
						}

						const city = weatherData.name;
						const country = weatherData.sys.country;
						const temperature = weatherData.main.temp;
						const weatherDescription = weatherData.weather[0].description;
						const humidity = weatherData.main.humidity;
						const windSpeed = weatherData.wind.speed;

						const message = `📍 Weather in ${city}, ${country}:\n\n🌡️ Temperature: ${temperature}°C\n☁️ Description: ${weatherDescription}\n💧 Humidity: ${humidity}%\n🌀 Wind Speed: ${windSpeed} km/h`;

						return sendMessage(message);
				} catch (error) {
						console.error(error);
						return sendMessage("Failed to fetch weather information. Please try again later.");
				}
		},
};
