
module.exports = {
 config: {
   name: "antiout",
   usages: "on/off",
   version: "1.0",
   author: "Jun", 
   countDown: 0,
   role: 1,
   shortDescription: "Enable/disable auto seen when new message is available",
   longDescription: "",
   category: "admin",
   guide: "{pn}"
 },
  
 onStart: async ({ api, event, Threads }) => {
     try {
       let data = (await Threads.getData(event.threadID)).data || {};
       data["antiout"] = !data["antiout"];

       await Threads.setData(event.threadID, { data });
       global.data.threadData.set(parseInt(event.threadID), data);

       return api.sendMessage(
         `✅ Successfully ${(data["antiout"]) ? "turned on" : "turned off"} antiout!`,
         event.threadID
       );
     } catch (err) {
       console.error("Error in antiout command:", err);
       return api.sendMessage(`❌ Error occurred. Please try again later.`, event.threadID);
     }
  }
}