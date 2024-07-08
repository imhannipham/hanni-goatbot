const fs = require('fs-extra');
const axios = require('axios');
const request = require('request');
const path = require('path');

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
    name: "resend", // Name of command, it must be unique to identify with other commands
    version: "2.0.0", // Version of command
    author: "Thọ & Mod By DuyVuong", // Author of command
    countDown: 5, // Time to wait before executing command again (seconds)
    role: 1, // Role of user to use this command (0: normal user, 1: admin box chat, 2: owner bot)
    shortDescription: {
      vi: "Gửi lại tin nhắn đã xóa",
      en: "Resends Messages"
    }, // Short description of command
    description: {
      vi: "Gửi lại tin nhắn đã xóa",
      en: "Resends Messages"
    }, // Long description of command
    category: "general", // Category of command
    guide: {
      vi: "Dùng lệnh để bật/tắt chức năng gửi lại tin nhắn đã xóa",
      en: "Use the command to enable/disable the resend message feature"
    } // Guide of command
  },

  langs: {
    vi: {
      resendEnabled: "Đã bật chức năng gửi lại tin nhắn.",
      resendDisabled: "Đã tắt chức năng gửi lại tin nhắn.",
      unsendMessage: "%1 đã gỡ tin nhắn\n\nNội dung: %2",
      unsendMessageWithAttachment: "%1 đã gỡ tin nhắn\n%2 tệp đính kèm\n%3"
    },
    en: {
      resendEnabled: "Resend message feature enabled.",
      resendDisabled: "Resend message feature disabled.",
      unsendMessage: "%1 unsent the message\n\nContent: %2",
      unsendMessageWithAttachment: "%1 unsent the message\n%2 Attachments\n%3"
    }
  },

  onLoad: async function ({ api }) {
    if (!global.logMessage) global.logMessage = new Map();
    if (!global.data.botID) global.data.botID = await api.getCurrentUserID();
  },

  handleEvent: async function ({ event, api, getLang }) {
    let { messageID, senderID, threadID, body: content } = event;
    const thread = global.data.threadData.get(parseInt(threadID)) || {};

    if (typeof thread["resend"] !== "undefined" && thread["resend"] === false) return;
    if (senderID == global.data.botID) return;

    if (event.type !== "message_unsend") {
      global.logMessage.set(messageID, {
        msgBody: content,
        attachment: event.attachments,
      });
    } else {
      var getMsg = global.logMessage.get(messageID);
      if (!getMsg) return;

      const getRequestorID = await api.getUserInfo(event.senderID);
      const requesterName = getRequestorID[event.senderID].name;

      if (!getMsg.attachment || getMsg.attachment.length === 0) {
        return api.sendMessage(getLang("unsendMessage", requesterName, getMsg.msgBody), threadID);
      } else {
        let num = 0;
        let msg = {
          body: getLang("unsendMessageWithAttachment", requesterName, getMsg.attachment.length, getMsg.msgBody ? `\n\nContent: ${getMsg.msgBody}` : ""),
          attachment: [],
        };

        for (var i of getMsg.attachment) {
          num += 1;
          var getURL = await request.get(i.url);
          var pathname = getURL.uri.pathname;
          var ext = pathname.substring(pathname.lastIndexOf(".") + 1);
          var filePath = path.join(__dirname, 'tmp', `${num}.${ext}`);
          var data = (await axios.get(i.url, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(filePath, Buffer.from(data, "utf-8"));
          msg.attachment.push(fs.createReadStream(filePath));
        }
        api.sendMessage(msg, threadID);
      }
    }
  },

  onStart: async function ({ api, event, Threads, getLang }) {
    const { threadID, messageID } = event;
    var data = (await Threads.getData(threadID)).data;

    if (typeof data["resend"] == "undefined" || data["resend"] == false) {
      data["resend"] = true;
    } else {
      data["resend"] = false;
    }

    await Threads.setData(parseInt(threadID), { data });
    global.data.threadData.set(parseInt(threadID), data);

    return api.sendMessage(data["resend"] ? getLang("resendEnabled") : getLang("resendDisabled"), threadID, messageID);
  }
};
