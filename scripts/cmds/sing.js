const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");

module.exports = {
    config: {
        name: "sing",
        version: "1.0.0",
        author: "Mirai Team & Yan Maglinte",
        role: 0,
        category: "music",
        description: "Play music via YouTube link or search keyword",
        guide: {
          en: "{pn} [song title]",
        },
        usePrefix: true,
    },
    
    onStart: async function ({ api, event, args }) {
        const input = event.body;
        const data = input.split(" ");
    
        if (data.length < 2) {
          return api.sendMessage("Please put a song", event.threadID, event.messageID);
        }

        data.shift();
        const song = data.join(" ");

        try {
          api.sendMessage(`Finding "${song}". Please wait...`, event.threadID, event.messageID);
    
          const searchResults = await yts(song);
          if (!searchResults.videos.length) {
            return api.sendMessage("Error: Invalid request.", event.threadID, event.messageID);
          }
    
          const video = searchResults.videos[0];
          const videoUrl = video.url;
    
          const stream = ytdl(videoUrl, { filter: "audioonly" });
    
          const fileName = `${event.senderID}.mp3`;
          const filePath = __dirname + `/tmp/${fileName}`;
    
          stream.pipe(fs.createWriteStream(filePath));
    
          stream.on('response', () => {
            console.info('[DOWNLOADER]', 'Starting download now!');
          });
    
          stream.on('info', (info) => {
            console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
          });
    
          stream.on('end', async () => {
            console.info('[DOWNLOADER] Downloaded');
    
            if (fs.statSync(filePath).size > 26214400) {
              fs.unlinkSync(filePath);
              return api.sendMessage('[ERR] The file could not be sent because it is larger than 25MB.', event.threadID, event.messageID);
            }
    
            const message = {
              body: `Here's your music, enjoy! 🥰\n\nTitle: ${video.title}\nArtist: ${video.author.name}`,
              attachment: fs.createReadStream(filePath)
            };
    
            api.sendMessage(message, event.threadID, () => {
              fs.unlinkSync(filePath);
            });
          });
        } catch (error) {
          console.error('[ERROR]', error);
          api.sendMessage('An error occurred while processing the command.', event.threadID, event.messageID);
        }
    },
};
