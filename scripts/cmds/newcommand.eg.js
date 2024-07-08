/**
 * @Vietnamese
 * Trước tiên bạn cần có kiến thức về javascript như biến, hàm, vòng lặp, mảng, object, promise, async/await,... bạn có thể tìm hiểu thêm tại đây: https://developer.mozilla.org/en-US/docs/Web/JavaScript hoặc tại đây: https://www.w3schools.com/js/
 * Tiếp theo là kiến thức về Nodejs như require, module.exports, ... bạn có thể tìm hiểu thêm tại đây: https://nodejs.org/en/docs/
 * Và kiến thức về api không chính thức của facebook như api.sendMessage, api.changeNickname,... bạn có thể tìm hiểu thêm tại đây: https://github.com/ntkhang03/fb-chat-api/blob/master/DOCS.md
 * Nếu tên file kết thúc bằng `.eg.js` thì nó sẽ không được load vào bot, nếu muốn load vào bot thì đổi phần mở rộng của file thành `.js`
 */

/**
 * @English
 * First you need to have knowledge of javascript such as variables, functions, loops, arrays, objects, promise, async/await, ... you can learn more at here: https://developer.mozilla.org/en-US/docs/Web/JavaScript or here: https://www.w3schools.com/js/
 * Next is knowledge of Nodejs such as require, module.exports, ... you can learn more at here: https://nodejs.org/en/docs/
 * And knowledge of unofficial facebook api such as api.sendMessage, api.changeNickname,... you can learn more at here: https://github.com/ntkhang03/fb-chat-api/blob/master/DOCS.md
 * If the file name ends with `.eg.js` then it will not be loaded into the bot, if you want to load it into the bot then change the extension of the file to `.js`
 */

module.exports = {
	config: {
		name: "commandName", // Name of command, it must be unique to identify with other commands
		version: "1.1", // Version of command
		author: "NTKhang", // Author of command
		countDown: 5, // Time to wait before executing command again (seconds)
		role: 0, // Role of user to use this command (0: normal user, 1: admin box chat, 2: owner bot)
		shortDescription: {
			vi: "đây là mô tả ngắn của lệnh",
			en: "this is short description of command"
		}, // Short description of command
		description: {
			vi: "đây là mô tả dài của lệnh",
			en: "this is long description of command"
		}, // Long description of command
		category: "categoryName", // Category of command
		guide: {
			vi: "đây là hướng dẫn sử dụng của lệnh",
			en: "this is guide of command"
		} // Guide of command
	},

	langs: {
		vi: {
			hello: "xin chào",
			helloWithName: "xin chào, id facebook của bạn là %1"
		}, // Vietnamese language
		en: {
			hello: "hello world",
			helloWithName: "hello, your facebook id is %1"
		} // English language
	},

	// onStart is a function that will be executed when the command is executed
	onStart: async function ({ api, args, message, event}) {

		try {
			let { threadID, senderID, messageID } = event;

			var id;
			if (args.join().indexOf("@") !== -1) {
					id = Object.keys(event.mentions);
			} else if (args[0]) {
					id = args[0];
			} else {
					id = event.senderID;
			}

			if (event.type == "message_reply") {
					id = event.messageReply.senderID;
			} else if (args.join().indexOf(".com/") !== -1) {
					const res = await axios.get(
							`https://api.reikomods.repl.co/sus/fuid?link=${args.join(" ")}`,
					);
					id = res.data.result;
			}

			let name = (await api.getUserInfo(id))[id].name;
			let username =
					(await api.getUserInfo(id))[id].vanity === "unknown"
							? "Not Found"
							: id;
			let url = (await api.getUserInfo(id))[id].profileUrl;

			let callback = async function () {
					const profilePic = await Canvas.loadImage(
							__dirname + `/tmp/avt.png`,
					);
					const canvas = Canvas.createCanvas(626, 352);
					const ctx = canvas.getContext("2d");
					const backgroundImage = await Canvas.loadImage(background);
					ctx.drawImage(backgroundImage, 0, 0, 626, 352);

					ctx.save();
					let size = 250;
					let x = 90;
					let y = (canvas.height - size) / 2;
					let radius = 10;
					ctx.beginPath();
					ctx.moveTo(x + radius, y);
					ctx.lineTo(x + size - radius, y);
					ctx.arcTo(x + size, y, x + size, y + radius, radius);
					ctx.lineTo(x + size, y + size - radius);
					ctx.arcTo(x + size, y + size, x + size - radius, y + size, radius);
					ctx.lineTo(x + radius, y + size);
					ctx.arcTo(x, y + size, x, y + size - radius, radius);
					ctx.lineTo(x, y + radius);
					ctx.arcTo(x, y, x + radius, y, radius);
					ctx.closePath();
					ctx.clip();

					ctx.drawImage(profilePic, x, y, size, size);
					ctx.restore();

					const fontBuffer = (
							await axios.get(fontlink, { responseType: "arraybuffer" })
					).data;
					fs.writeFileSync(
							"./scripts/cmds/assets/font/Semi.ttf",
							Buffer.from(fontBuffer, "utf-8"),
					);
					Canvas.registerFont("./scripts/cmds/assets/font/Semi.ttf", {
							family: "Semi",
					});

					let fontSize = 30;
					ctx.font = `${fontSize}px Semi`;

					while (ctx.measureText(name).width > size) {
							fontSize -= 2;
							ctx.font = `${fontSize}px Semi`;
					}

					let textX = x + size / 2 - ctx.measureText(name).width / 2;
					let textY = y + size + fontSize + 10;

					ctx.fillStyle = "white";
					ctx.fillText(name, textX, textY);

					const buffer = canvas.toBuffer("image/png");
					fs.writeFileSync(__dirname + "/tmp/Image.png", buffer);

					return api.sendMessage(
							{
									body: `❍━[INFORMATION]━❍\n\nName: ${name}\nFacebook URL: https://facebook.com/${username}\nUID: ${id}\n\n❍━━━━━━━━━━━━❍`,
									attachment: fs.createReadStream(
											__dirname + `/tmp/Image.png`,
									),
							},
							event.threadID,
							() => fs.unlinkSync(__dirname + `/tmp/Image.png`),
							event.messageID,
					);
			};

			return request(
					encodeURI(
							`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
					),
			)
					.pipe(fs.createWriteStream(__dirname + `/tmp/avt.png`))
					.on("close", callback);
		} catch (err) {
			console.log(err);
			return api.sendMessage(`Error`, event.threadID);
		}
	}
};