const expressWs = require("express-ws");
const { clearCartAndUpdateStock } = require("./dbOperations");

const logWsError = (err, context) => {
  console.error("ERROR IN WS: ", context, err);
};



const connectWs = (app) => {
  expressWs(app);

  const connectedUsers = new Map()

  const handleMessage = (senderId, message) => {
    const {recipientId, content} = message;
  
    const recipientWs = connectedUsers.get(recipientId)
    console.log("WS RECIPIENT: ", recipientId)
    if (recipientWs) {
      console.log("WS MESSAGE SENT")
      recipientWs.send(JSON.stringify({ senderId, content }))
    }
  }

  app.ws("/ws", (ws, req) => {
    const userId = req.query.userId;

    if (!userId) {
      ws.close();
      return;
    }

    console.log("WS CONNECTED: ", userId);
    connectedUsers.set(userId, ws)

    ws.on("message", (message) => {
      console.log("WS MESSAGE: ", message);
      const parsedMessage = JSON.parse(message)
      handleMessage(userId, parsedMessage)
    });

    ws.on("close", async () => {
      console.log("WS USER DISCONNECTED: ", userId);
      connectedUsers.delete(userId)
      try {
        await clearCartAndUpdateStock(userId)
      }
      catch (error) {
        logWsError(error, "WebSocket Error on disconnection")
      }
    });

    ws.on("error", (error) => {
      logWsError(error, "WebSocket error");
    });
  });
};

module.exports = connectWs;
