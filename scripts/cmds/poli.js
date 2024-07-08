const Canvas = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "stalk", 
    version: "1.0.0", 
    author: "jameslim", 
    countDown: 5, 
    role: 0, 
    shortDescription: {
      vi: "đây là mô tả ngắn của lệnh",
      en: "generate image using polination"
    }, // Short description of command
    description: {
      vi: "đây là mô tả dài của lệnh",
      en: "generate image using polination"
    }, // Long description of command
    category: "categoryName", // Category of command
    guide: {
      vi: "đây là hướng dẫn sử dụng của lệnh",
      en: "{pn} <your_prompt>"
    } // Guide of command
  },
  
  // onStart is a function that will be executed when the command is executed
  onStart: async function ({ api, event, args}) {
    
  }
};