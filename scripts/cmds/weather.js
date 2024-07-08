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
      const body = event.body.trim();
      const cityName = body.substring(body.indexOf(' ') + 1);

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

          // Check if the weather data contains the required fields
          if (!weatherData || !weatherData.name || !weatherData.sys || !weatherData.main || !weatherData.weather || !weatherData.wind) {
              return sendMessage("Error: Incomplete weather data received.");
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
          console.error('Error fetching weather data:', error);

          // Check if the error response has more information
          if (error.response) {
              console.error('Error response data:', error.response.data);
              return sendMessage(`Failed to fetch weather information. Error: ${error.response.data.message || "Unknown error"}`);
          }

          return sendMessage("Failed to fetch weather information. Please try again later.");
      }
  },
};
